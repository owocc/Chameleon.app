import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { z } from 'zod'
import { useEffect, useState, useCallback, useRef } from 'react'
import type { Palette, PaletteRoleMap } from '@chameleon/shared'
import { hasDarkMode, PALETTE_ROLES } from '@chameleon/shared'
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
  const [selectedPaletteId, setSelectedPaletteId] = useState(search.paletteId)

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
  const currentPalette = palettes.find((p) => p.id === selectedPaletteId) ?? palettes[0]
  const paletteHasDark = currentPalette ? hasDarkMode(currentPalette) : false

  const handlePaletteChange = useCallback((paletteId: string) => {
    setSelectedPaletteId(paletteId)
  }, [])

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
        paletteId: selectedPaletteId,
        templateId,
        mode: previewMode !== 'light' ? previewMode : undefined,
      },
    })
  }, [navigate, selectedPaletteId, templateId, previewMode])

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden bg-black">
      {/* 模板占满整个容器 */}
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

      {/* 底部灵动岛控制栏 */}
      <ControlsIsland
        palettes={palettes}
        currentPaletteId={currentPalette?.id}
        onPaletteChange={handlePaletteChange}
        paletteHasDark={paletteHasDark}
        previewMode={previewMode}
        onToggleMode={() => setPreviewMode((m) => (m === 'light' ? 'dark' : 'light'))}
        isFullscreen={isFullscreen}
        onFullscreen={handleBrowserFullscreen}
        onGoBack={goBack}
      />
    </div>
  )
}

/* ── 首次使用教学 ── */

function TutorialOverlay({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 max-w-xs rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-2xl">
        {/* 手势动画 */}
        <div className="mb-6 flex justify-center">
          <div className="animate-pulse relative flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
            <span className="text-3xl">👆</span>
          </div>
        </div>
        <h2 className="mb-2 text-lg font-medium text-white">沉浸预览</h2>
        <p className="mb-1 text-sm leading-6 text-white/60">长按屏幕底部召唤控制面板</p>
        <p className="mb-6 text-sm leading-6 text-white/40">
          ✕ 关闭面板 · 🦎 切换色板 · ⋯ 更多操作
        </p>
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

/* ── Chameleon Logo SVG ── */

function ChameleonLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx={16} cy={19} rx={10} ry={7} fill="currentColor" opacity={0.9} />
      <circle cx={14} cy={13} r={5} fill="currentColor" opacity={0.95} />
      <circle cx={12.5} cy={12} r={2} fill="black" opacity={0.8} />
      <circle cx={12.5} cy={11.5} r={0.8} fill="white" />
      <path
        d="M26 21c3-1 4-4 3-6"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        opacity={0.8}
      />
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

/* ── 底部扇形展开（从底部向上） ── */

function getBottomFanPosition(index: number, total: number, radius: number = 90) {
  // 从底部向上展开：角度范围 310° → 50°，经过 0°（正上方）
  const startDeg = 310
  const endDeg = 50
  const range = endDeg >= startDeg ? endDeg - startDeg : 360 - startDeg + endDeg
  const angleDeg = total > 1 ? (startDeg + (index * range) / (total - 1)) % 360 : 0
  const rad = (angleDeg * Math.PI) / 180
  return {
    x: Math.sin(rad) * radius,
    y: -Math.cos(rad) * radius,
  }
}

/* ── 色板预览小圆点 ── */

function RoleSwatch({ roles }: { roles: PaletteRoleMap }) {
  return (
    <div className="flex items-center gap-0.5">
      {PALETTE_ROLES.map((role) => (
        <span
          key={role}
          className="h-2.5 w-2.5 rounded-full border border-white/10"
          style={{ backgroundColor: roles[role] }}
        />
      ))}
    </div>
  )
}

/* ── 色板悬浮面板 ── */

interface PalettePanelProps {
  palettes: Palette[]
  currentPaletteId?: string
  onSelect: (paletteId: string) => void
  onClose: () => void
}

function PalettePanel({ palettes, currentPaletteId, onSelect, onClose }: PalettePanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  // 点击外部关闭
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    const timer = setTimeout(() => document.addEventListener('click', handleClick), 0)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('click', handleClick)
    }
  }, [onClose])

  if (palettes.length === 0) return null

  return (
    <div
      ref={panelRef}
      className="absolute bottom-24 left-1/2 z-50 w-[340px] max-w-[90vw] -translate-x-1/2 rounded-2xl border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur-2xl"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium text-white/70">切换配色</span>
        <button
          type="button"
          onClick={onClose}
          className="flex h-6 w-6 items-center justify-center rounded-full text-xs text-white/50 transition-colors hover:bg-white/10 hover:text-white"
        >
          ✕
        </button>
      </div>
      <div className="flex max-h-48 flex-col gap-2 overflow-y-auto">
        {palettes.map((p) => {
          const isActive = p.id === currentPaletteId
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                onSelect(p.id)
                onClose()
              }}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${
                isActive
                  ? 'bg-white/20 ring-1 ring-white/30'
                  : 'hover:bg-white/10 active:bg-white/15'
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-medium ${isActive ? 'text-white' : 'text-white/80'}`}
                  >
                    {p.name}
                  </span>
                  {isActive && (
                    <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[9px] text-white/70">
                      当前
                    </span>
                  )}
                </div>
                <div className="mt-1.5">
                  <RoleSwatch roles={p.roles} />
                  {p.darkRoles && (
                    <div className="mt-0.5 opacity-60">
                      <RoleSwatch roles={p.darkRoles} />
                    </div>
                  )}
                </div>
              </div>
              {isActive && <span className="text-sm text-white/80">✓</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ── 底部灵动岛 ── */

interface ControlsIslandProps {
  palettes: Palette[]
  currentPaletteId?: string
  onPaletteChange: (paletteId: string) => void
  paletteHasDark: boolean
  previewMode: PreviewMode
  onToggleMode: () => void
  isFullscreen: boolean
  onFullscreen: () => void
  onGoBack: () => void
}

function ControlsIsland({
  palettes,
  currentPaletteId,
  onPaletteChange,
  paletteHasDark,
  previewMode,
  onToggleMode,
  isFullscreen,
  onFullscreen,
  onGoBack,
}: ControlsIslandProps) {
  const [islandVisible, setIslandVisible] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [palettePanelOpen, setPalettePanelOpen] = useState(false)

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const containerRef = useRef<HTMLDivElement>(null)

  // ── 长按检测 ──
  const startLongPress = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault()
    clearTimeout(longPressTimer.current)
    longPressTimer.current = setTimeout(() => {
      setIslandVisible((v) => !v)
      setMenuOpen(false)
      setPalettePanelOpen(false)
    }, LONG_PRESS_MS)
  }, [])

  const cancelLongPress = useCallback(() => {
    clearTimeout(longPressTimer.current)
  }, [])

  // 关闭所有弹层
  const closeAll = useCallback(() => {
    setMenuOpen(false)
    setPalettePanelOpen(false)
  }, [])

  // ESC → 退出
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (menuOpen || palettePanelOpen) {
          closeAll()
        } else {
          onGoBack()
        }
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onGoBack, menuOpen, palettePanelOpen, closeAll])

  // 点击外部关闭菜单/面板
  useEffect(() => {
    if (!menuOpen && !palettePanelOpen) return
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeAll()
      }
    }
    const timer = setTimeout(() => document.addEventListener('click', handleClick), 0)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('click', handleClick)
    }
  }, [menuOpen, palettePanelOpen, closeAll])

  const runAction = (fn: () => void) => {
    fn()
    closeAll()
  }

  // 菜单按钮的动作
  const menuActions: { icon: React.ReactNode; label: string; onClick: () => void }[] = [
    {
      icon: (
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <circle cx={12} cy={12} r={3} />
          <circle cx={12} cy={12} r={7} strokeDasharray="2 3" />
        </svg>
      ),
      label: '配色',
      onClick: () => {
        setMenuOpen(false)
        setPalettePanelOpen((v) => !v)
      },
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
      onClick: () => runAction(onFullscreen),
    },
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
      onClick: () => runAction(onGoBack),
    },
  ]

  if (paletteHasDark) {
    menuActions.push({
      icon: <span className="text-lg leading-none">{previewMode === 'dark' ? '☀️' : '🌙'}</span>,
      label: '亮暗',
      onClick: () => runAction(onToggleMode),
    })
  }

  // 打开切换色板（从 LOGO 或菜单触发）
  const openPalettePanel = useCallback(() => {
    setMenuOpen(false)
    setPalettePanelOpen((v) => !v)
  }, [])

  const handlePaletteSelect = useCallback(
    (paletteId: string) => {
      onPaletteChange(paletteId)
      closeAll()
      setIslandVisible(false) // 切换配色后同时隐藏岛
    },
    [onPaletteChange, closeAll],
  )

  return (
    <>
      {/* 模糊背景遮罩 — 面板/菜单打开时 */}
      {(menuOpen || palettePanelOpen) && (
        <div className="fixed inset-0 z-40 bg-black/20" onClick={closeAll} />
      )}

      {/* 长按区域 — 全屏，只在岛隐藏时激活 */}
      {!islandVisible && !menuOpen && !palettePanelOpen && (
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

      {/* 底部岛 + 弹出层 */}
      <div
        ref={containerRef}
        className="fixed bottom-0 left-0 right-0 z-50 flex flex-col items-center"
        style={{ display: islandVisible || menuOpen || palettePanelOpen ? 'flex' : 'none' }}
      >
        {/* 色板悬浮面板 — 在岛上方 */}
        {palettePanelOpen && (
          <PalettePanel
            palettes={palettes}
            currentPaletteId={currentPaletteId}
            onSelect={handlePaletteSelect}
            onClose={() => setPalettePanelOpen(false)}
          />
        )}

        {/* 扇形菜单 — 从按钮位置向上展开 */}
        {menuOpen && (
          <div className="relative mb-2 h-[100px] w-full">
            {menuActions.map((action, i) => {
              const pos = getBottomFanPosition(i, menuActions.length)
              return (
                <button
                  key={i}
                  type="button"
                  onClick={action.onClick}
                  className="absolute left-1/2 top-0 flex flex-col items-center gap-1"
                  title={action.label}
                  style={{
                    transform: `translate(calc(-50% + ${pos.x}px), ${pos.y}px)`,
                    opacity: 1,
                    transition: `all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.05}s`,
                  }}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white shadow-lg backdrop-blur-2xl transition-colors hover:bg-white/25">
                    {action.icon}
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* 灵动岛主体 */}
        <div
          className="mx-auto mb-6 flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-3 py-2 shadow-2xl backdrop-blur-2xl"
          style={{
            minWidth: '200px',
            maxWidth: '280px',
          }}
          onTouchStart={(e) => e.stopPropagation()}
        >
          {/* ✕ 关闭按钮 */}
          <button
            type="button"
            onClick={() => {
              setIslandVisible(false)
              closeAll()
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="关闭面板"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* 中间分隔 */}
          <div className="h-6 w-px bg-white/10" />

          {/* 🦎 LOGO — 切换色板快捷方式 */}
          <button
            type="button"
            onClick={openPalettePanel}
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/80 transition-all hover:bg-white/10 hover:text-white active:scale-90"
            aria-label="切换色板"
          >
            <ChameleonLogo className="h-5 w-5" />
          </button>

          {/* 中间分隔 */}
          <div className="h-6 w-px bg-white/10" />

          {/* ⋯ 菜单按钮 — 弹出扇形操作 */}
          <button
            type="button"
            onClick={() => {
              setMenuOpen((v) => !v)
              setPalettePanelOpen(false)
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="更多操作"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <circle cx={12} cy={5} r={1.5} />
              <circle cx={12} cy={12} r={1.5} />
              <circle cx={12} cy={19} r={1.5} />
            </svg>
          </button>
        </div>
      </div>
    </>
  )
}

/* ── 工具函数 ── */

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
