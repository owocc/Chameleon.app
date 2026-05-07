import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { z } from 'zod'
import { useEffect, useState, useCallback, useRef } from 'react'
import type { Palette } from '@chameleon/shared'
import { hasDarkMode } from '@chameleon/shared'
import { WeChatTemplate, XTemplate, MacOSTemplate } from '@chameleon/ui'

type PreviewMode = 'light' | 'dark'

const searchSchema = z.object({
  paletteId: z.string().optional(),
  mode: z.enum(['light', 'dark']).optional(),
})

export const Route = createFileRoute('/preview/$templateId')({
  validateSearch: searchSchema,
  component: ImmersiveTemplatePage,
})

const STORAGE_KEY = 'chameleon:palettes'
const TUTORIAL_KEY = 'chameleon:immersive-tutorial-shown'
const LONG_PRESS_MS = 600

function ImmersiveTemplatePage() {
  const { templateId } = Route.useParams()
  const search = Route.useSearch()
  const navigate = useNavigate()

  const [isFullscreen, setIsFullscreen] = useState(false)
  const [previewMode, setPreviewMode] = useState<PreviewMode>(search.mode ?? 'light')
  const [showTutorial, setShowTutorial] = useState(false)

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  // 首次使用：显示教学
  useEffect(() => {
    const shown = localStorage.getItem(TUTORIAL_KEY)
    if (!shown) {
      setShowTutorial(true)
      localStorage.setItem(TUTORIAL_KEY, '1')
    }
  }, [])

  const palettes = readStoredPalettes()
  const currentPalette = palettes.find((p) => p.id === search.paletteId) ?? palettes[0]
  const paletteHasDark = currentPalette ? hasDarkMode(currentPalette) : false

  const handleBrowserFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      void document.documentElement.requestFullscreen()
    } else {
      void document.exitFullscreen()
    }
  }, [])

  const goBack = useCallback(() => {
    if (document.fullscreenElement) {
      void document.exitFullscreen()
    }
    void navigate({
      to: '/preview',
      search: {
        paletteId: search.paletteId,
        templateId,
        mode: previewMode !== 'light' ? previewMode : undefined,
      },
    })
  }, [navigate, search.paletteId, templateId, previewMode])

  const goToStore = useCallback(() => {
    if (document.fullscreenElement) {
      void document.exitFullscreen()
    }
    void navigate({ to: '/templates' })
  }, [navigate])

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden bg-black">
      {/* 模板占满整个容器 — 无白边、无边框 */}
      <div className="flex flex-1 items-center justify-center">
        {currentPalette ? (
          <div className="h-full w-full">
            {templateId === 'wechat' ? (
              <WeChatTemplate palette={currentPalette} mode={previewMode} fill={true} />
            ) : templateId === 'x' ? (
              <XTemplate palette={currentPalette} mode={previewMode} fill={true} />
            ) : templateId === 'macos' ? (
              <MacOSTemplate palette={currentPalette} mode={previewMode} fill={true} />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-white/30">
                未知模板
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <p className="text-lg text-white/40">请先选择一个色板</p>
            <Link
              to="/preview"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
            >
              前往预览页
            </Link>
          </div>
        )}
      </div>

      {/* 首次使用教学 */}
      {showTutorial && <TutorialOverlay onDismiss={() => setShowTutorial(false)} />}

      {/* 圆形控制按钮 — 长按出现，点击展开扇面 */}
      <ControlsPill
        paletteHasDark={paletteHasDark}
        previewMode={previewMode}
        onToggleMode={() => setPreviewMode((m) => (m === 'light' ? 'dark' : 'light'))}
        isFullscreen={isFullscreen}
        onFullscreen={handleBrowserFullscreen}
        onGoBack={goBack}
        onGoToStore={goToStore}
        autoShow={!showTutorial}
      />
    </div>
  )
}

/* ── 首次使用教学 ── */

function TutorialOverlay({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 max-w-xs rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-2xl">
        {/* 手势动画 */}
        <div className="mb-6 flex justify-center">
          <div className="animate-pulse relative flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
            <span className="text-3xl">👆</span>
          </div>
        </div>
        <h2 className="mb-2 text-lg font-medium text-white">沉浸预览</h2>
        <p className="mb-1 text-sm leading-6 text-white/60">长按屏幕显示控制面板</p>
        <p className="mb-6 text-sm leading-6 text-white/40">再次长按隐藏</p>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-full bg-white/15 px-8 py-2.5 text-sm font-medium text-white backdrop-blur-xl transition-colors hover:bg-white/25"
        >
          知道了
        </button>
      </div>
    </div>
  )
}

/* ── 扇形展开菜单 ── */

interface ControlsPillProps {
  paletteHasDark: boolean
  previewMode: PreviewMode
  onToggleMode: () => void
  isFullscreen: boolean
  onFullscreen: () => void
  onGoBack: () => void
  onGoToStore: () => void
  autoShow?: boolean
}

/** 计算扇形展开位置 */
function getFanPosition(index: number, total: number, radius: number = 100) {
  const startDeg = 145
  const endDeg = 35
  const angleDeg = total > 1 ? startDeg - (index * (startDeg - endDeg)) / (total - 1) : 90
  const rad = (angleDeg * Math.PI) / 180
  return {
    x: Math.sin(rad) * radius,
    y: -Math.cos(rad) * radius,
  }
}

/** 临时 Chameleon Logo — 简洁几何变色龙 */
function ChameleonLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 身体 - 椭圆形 */}
      <ellipse cx={16} cy={19} rx={10} ry={7} fill="currentColor" opacity={0.9} />
      {/* 头部 */}
      <circle cx={14} cy={13} r={5} fill="currentColor" opacity={0.95} />
      {/* 眼睛 */}
      <circle cx={12.5} cy={12} r={2} fill="black" opacity={0.8} />
      <circle cx={12.5} cy={11.5} r={0.8} fill="white" />
      {/* 尾巴 - 卷曲 */}
      <path
        d="M26 21c3-1 4-4 3-6"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        opacity={0.8}
      />
      {/* 舌头 */}
      <path
        d="M9 14c-2 1-4 0-4-2s2-3 4-2"
        stroke="currentColor"
        strokeWidth={1.2}
        strokeLinecap="round"
        opacity={0.6}
      />
    </svg>
  )
}

function ControlsPill({
  paletteHasDark,
  previewMode,
  onToggleMode,
  isFullscreen,
  onFullscreen,
  onGoBack,
  onGoToStore,
  autoShow = true,
}: ControlsPillProps) {
  const [pillVisible, setPillVisible] = useState(autoShow)
  const [menuOpen, setMenuOpen] = useState(false)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const pillRef = useRef<HTMLDivElement>(null)

  // 教学关闭后自动显示按钮
  useEffect(() => {
    if (autoShow && !pillVisible) {
      setPillVisible(true)
    }
  }, [autoShow])

  // ── 长按检测 ──
  const startLongPress = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault()
    clearTimeout(longPressTimer.current)
    longPressTimer.current = setTimeout(() => {
      setPillVisible((v) => !v)
      setMenuOpen(false)
    }, LONG_PRESS_MS)
  }, [])

  const cancelLongPress = useCallback(() => {
    clearTimeout(longPressTimer.current)
  }, [])

  // 点击外部关闭菜单
  useEffect(() => {
    if (!menuOpen) return
    const handleClick = (e: MouseEvent) => {
      if (pillRef.current && !pillRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    const timer = setTimeout(() => document.addEventListener('click', handleClick), 0)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('click', handleClick)
    }
  }, [menuOpen])

  // ESC → 退出
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false)
        onGoBack()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onGoBack])

  const run = (fn: () => void) => {
    fn()
    setMenuOpen(false)
  }

  const actions: { icon: React.ReactNode; label: string; onClick: () => void }[] = [
    {
      icon: (
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      label: '返回',
      onClick: () => run(onGoBack),
    },
    {
      icon: (
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <rect x={3} y={3} width={7} height={7} rx={1} />
          <rect x={14} y={3} width={7} height={7} rx={1} />
          <rect x={3} y={14} width={7} height={7} rx={1} />
          <rect x={14} y={14} width={7} height={7} rx={1} />
        </svg>
      ),
      label: '市场',
      onClick: () => run(onGoToStore),
    },
    {
      icon: isFullscreen ? (
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      label: '全屏',
      onClick: () => run(onFullscreen),
    },
  ]

  if (paletteHasDark) {
    actions.push({
      icon: <span className="text-lg leading-none">{previewMode === 'dark' ? '☀️' : '🌙'}</span>,
      label: '亮暗',
      onClick: () => run(onToggleMode),
    })
  }

  const actionCount = actions.length

  return (
    <>
      {/* 模糊背景遮罩 — 菜单打开时 */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40"
          style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* 长按区域 — 覆盖全屏，只在 pill 隐藏时激活 */}
      {!pillVisible && !menuOpen && (
        <div
          className="fixed inset-0 z-30"
          onTouchStart={startLongPress}
          onTouchEnd={cancelLongPress}
          onTouchMove={cancelLongPress}
          onMouseDown={startLongPress}
          onMouseUp={cancelLongPress}
          onMouseLeave={cancelLongPress}
        />
      )}

      {/* 圆形按钮 + 扇形菜单 */}
      <div
        ref={pillRef}
        className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2"
        style={{ display: pillVisible || menuOpen ? 'block' : 'none' }}
      >
        {/* 扇形展开按钮 */}
        {actions.map((action, i) => {
          const pos = getFanPosition(i, actionCount)
          return (
            <button
              key={i}
              type="button"
              onClick={action.onClick}
              className="absolute left-1/2 top-1/2 flex flex-col items-center gap-1"
              title={action.label}
              style={{
                transform: menuOpen
                  ? `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`
                  : 'translate(-50%, -50%)',
                opacity: menuOpen ? 1 : 0,
                pointerEvents: menuOpen ? 'auto' : 'none',
                transition: `all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.05}s`,
              }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white shadow-lg backdrop-blur-2xl transition-colors hover:bg-white/25">
                {action.icon}
              </div>
            </button>
          )
        })}

        {/* 主圆形按钮 — 变色龙 Logo */}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          onTouchStart={(e) => e.stopPropagation()}
          className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white/90 shadow-lg backdrop-blur-2xl transition-all hover:bg-white/30 active:scale-90"
          style={{
            transform: menuOpen ? 'scale(0.85)' : 'scale(1)',
            transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <ChameleonLogo className="h-6 w-6" />
        </button>
      </div>
    </>
  )
}

function readStoredPalettes(): Palette[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
