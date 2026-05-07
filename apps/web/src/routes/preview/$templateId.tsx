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
const LONG_PRESS_MS = 600

function ImmersiveTemplatePage() {
  const { templateId } = Route.useParams()
  const search = Route.useSearch()
  const navigate = useNavigate()

  const [isFullscreen, setIsFullscreen] = useState(false)
  const [previewMode, setPreviewMode] = useState<PreviewMode>(search.mode ?? 'light')

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
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

      {/* 圆形控制按钮 — 长按出现，点击展开扇面 */}
      <ControlsPill
        paletteHasDark={paletteHasDark}
        previewMode={previewMode}
        onToggleMode={() => setPreviewMode((m) => (m === 'light' ? 'dark' : 'light'))}
        isFullscreen={isFullscreen}
        onFullscreen={handleBrowserFullscreen}
        onGoBack={goBack}
        onGoToStore={goToStore}
      />
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
}

/** 计算扇形展开位置 */
function getFanPosition(index: number, total: number, radius: number = 110) {
  // 从左到右，扇形弧度为 140° → 40°
  const startDeg = 145
  const endDeg = 35
  const angleDeg = total > 1 ? startDeg - (index * (startDeg - endDeg)) / (total - 1) : 90
  const rad = (angleDeg * Math.PI) / 180
  return {
    x: Math.sin(rad) * radius,
    y: -Math.cos(rad) * radius,
  }
}

function ControlsPill({
  paletteHasDark,
  previewMode,
  onToggleMode,
  isFullscreen,
  onFullscreen,
  onGoBack,
  onGoToStore,
}: ControlsPillProps) {
  const [pillVisible, setPillVisible] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const pillRef = useRef<HTMLDivElement>(null)

  // ── 长按检测 ──
  const startLongPress = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault()
    clearTimeout(longPressTimer.current)
    longPressTimer.current = setTimeout(() => {
      setPillVisible((v) => !v) // toggle pill visibility
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
      label: previewMode === 'dark' ? '亮色' : '暗色',
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
        className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2"
        style={{ display: pillVisible || menuOpen ? 'block' : 'none' }}
      >
        {/* 扇形展开按钮 */}
        {actions.map((action, i) => {
          const pos = getFanPosition(i, actionCount, 108)
          return (
            <button
              key={i}
              type="button"
              onClick={action.onClick}
              className="absolute left-1/2 top-1/2 flex flex-col items-center gap-1"
              style={{
                transform: menuOpen
                  ? `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`
                  : 'translate(-50%, -50%)',
                opacity: menuOpen ? 1 : 0,
                pointerEvents: menuOpen ? 'auto' : 'none',
                transition: `all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.05}s`,
              }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white shadow-lg backdrop-blur-2xl transition-colors hover:bg-white/25">
                {action.icon}
              </div>
              <span
                className="text-[11px] font-medium tracking-wide text-white/70"
                style={{
                  opacity: menuOpen ? 1 : 0,
                  transition: `opacity 0.25s ease ${i * 0.05 + 0.15}s`,
                }}
              >
                {action.label}
              </span>
            </button>
          )
        })}

        {/* 主圆形按钮 */}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          onTouchStart={(e) => {
            // If pill already visible and we touch it, cancel the outer long-press
            e.stopPropagation()
          }}
          className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white shadow-lg backdrop-blur-2xl transition-all hover:bg-white/30 active:scale-90"
          style={{
            transform: menuOpen ? 'scale(0.85)' : 'scale(1)',
            transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx={12} cy={5} r={1.5} fill="currentColor" stroke="none" />
            <circle cx={12} cy={12} r={1.5} fill="currentColor" stroke="none" />
            <circle cx={12} cy={19} r={1.5} fill="currentColor" stroke="none" />
          </svg>
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
