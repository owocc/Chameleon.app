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
const MOBILE_BREAKPOINT = 768

function ImmersiveTemplatePage() {
  const { templateId } = Route.useParams()
  const search = Route.useSearch()
  const navigate = useNavigate()

  const [isMobile, setIsMobile] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [previewMode, setPreviewMode] = useState<PreviewMode>(search.mode ?? 'light')

  useEffect(() => {
    function check() {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

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
    <div className="fixed inset-0 z-50 flex overflow-hidden bg-[#0d0d0d]">
      {/* 模板占满整个容器 */}
      <div className="flex flex-1 items-center justify-center">
        {currentPalette ? (
          <div className={isMobile ? 'h-full w-full' : ''}>
            {templateId === 'wechat' ? (
              <WeChatTemplate palette={currentPalette} mode={previewMode} fill={isMobile} />
            ) : templateId === 'x' ? (
              <XTemplate palette={currentPalette} mode={previewMode} fill={isMobile} />
            ) : templateId === 'macos' ? (
              <MacOSTemplate palette={currentPalette} mode={previewMode} fill={isMobile} />
            ) : (
              <div className="text-center text-white/30">未知模板</div>
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

      {/* 悬浮药丸控件 */}
      <ControlsPill
        paletteHasDark={paletteHasDark}
        previewMode={previewMode}
        onToggleMode={() => setPreviewMode((m) => (m === 'light' ? 'dark' : 'light'))}
        isFullscreen={isFullscreen}
        onFullscreen={handleBrowserFullscreen}
        onGoBack={goBack}
        onGoToStore={goToStore}
        isMobile={isMobile}
      />
    </div>
  )
}

/* ── 悬浮药丸控件 ── */

interface ControlsPillProps {
  paletteHasDark: boolean
  previewMode: PreviewMode
  onToggleMode: () => void
  isFullscreen: boolean
  onFullscreen: () => void
  onGoBack: () => void
  onGoToStore: () => void
  isMobile: boolean
}

function ControlsPill({
  paletteHasDark,
  previewMode,
  onToggleMode,
  isFullscreen,
  onFullscreen,
  onGoBack,
  onGoToStore,
  isMobile,
}: ControlsPillProps) {
  const [open, setOpen] = useState(false)
  const pillRef = useRef<HTMLDivElement>(null)

  // 点击外部关闭
  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (pillRef.current && !pillRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const timer = setTimeout(() => document.addEventListener('click', handleClick), 0)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('click', handleClick)
    }
  }, [open])

  // ESC 关闭
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        onGoBack()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onGoBack])

  const run = (fn: () => void) => {
    fn()
    setOpen(false)
  }

  const actions: { icon: React.ReactNode; label: string; onClick: () => void }[] = [
    {
      icon: (
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      label: '返回预览',
      onClick: () => run(onGoBack),
    },
    {
      icon: (
        <svg
          className="h-4 w-4"
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
      label: '模板市场',
      onClick: () => run(onGoToStore),
    },
    {
      icon: isFullscreen ? (
        <svg
          className="h-4 w-4"
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
          className="h-4 w-4"
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
      label: isFullscreen ? '退出全屏' : '浏览器全屏',
      onClick: () => run(onFullscreen),
    },
  ]

  // 暗色模式切换按钮（只在色板支持时显示）
  if (paletteHasDark) {
    actions.push({
      icon: <span className="text-base leading-none">{previewMode === 'dark' ? '☀️' : '🌙'}</span>,
      label: previewMode === 'dark' ? '亮色模式' : '暗色模式',
      onClick: () => run(onToggleMode),
    })
  }

  return (
    <div
      ref={pillRef}
      className={`fixed z-50 ${isMobile ? 'bottom-4 right-4' : 'bottom-6 right-6'}`}
    >
      {/* 弹出菜单 */}
      {open && (
        <div className="absolute bottom-full right-0 mb-2 min-w-[160px] overflow-hidden rounded-2xl bg-white/10 backdrop-blur-2xl">
          <div className="p-1.5">
            {actions.map((action, i) => (
              <button
                key={i}
                type="button"
                onClick={action.onClick}
                className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                {action.icon}
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 药丸主按钮 */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-2.5 text-white/70 backdrop-blur-2xl transition-all hover:bg-white/20 hover:text-white"
        style={open ? { backgroundColor: 'rgba(255,255,255,0.18)' } : undefined}
      >
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <circle cx={12} cy={5} r={1} />
          <circle cx={12} cy={12} r={1} />
          <circle cx={12} cy={19} r={1} />
        </svg>
        {!isMobile && <span className="text-xs font-medium">菜单</span>}
      </button>
    </div>
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
