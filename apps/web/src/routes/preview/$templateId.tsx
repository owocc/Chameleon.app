import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { z } from 'zod'
import { useEffect, useState, useCallback, useRef } from 'react'
import type { Palette } from '@chameleon/shared'
import { ALL_TEMPLATES, hasDarkMode } from '@chameleon/shared'
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
  const wrapRef = useRef<HTMLDivElement>(null)

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
  const currentTemplate = ALL_TEMPLATES.find((t) => t.id === templateId)
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

  return (
    <div
      ref={wrapRef}
      className="fixed inset-0 z-50 flex-col"
      style={{ backgroundColor: isMobile ? '#000' : '#0d0d0d', display: 'flex' }}
    >
      {!isMobile && (
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <Link
              to="/preview"
              search={{
                paletteId: search.paletteId,
                templateId,
                mode: previewMode !== 'light' ? previewMode : undefined,
              }}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            >
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              返回预览
            </Link>
            <span className="text-sm text-white/30">/</span>
            <span className="text-sm font-medium text-white/60">
              {currentPalette?.name ?? '无色板'}
            </span>
            <span className="text-sm text-white/30">/</span>
            <span className="flex items-center gap-1.5 text-sm text-white/80">
              {currentTemplate?.icon} {currentTemplate?.name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {paletteHasDark && (
              <button
                type="button"
                onClick={() => setPreviewMode((m) => (m === 'light' ? 'dark' : 'light'))}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                {previewMode === 'dark' ? '☀️' : '🌙'}
                {previewMode === 'dark' ? '亮色' : '暗色'}
              </button>
            )}
            <button
              type="button"
              onClick={handleBrowserFullscreen}
              className="rounded-full p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              title="浏览器全屏"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                {isFullscreen ? (
                  <path
                    d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ) : (
                  <path
                    d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
              </svg>
            </button>
            <button
              type="button"
              onClick={goBack}
              className="flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/20"
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
              退出
            </button>
          </div>
        </div>
      )}

      {isMobile && (
        <button
          type="button"
          onClick={goBack}
          className="fixed left-4 top-4 z-10 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium text-white/80 backdrop-blur-md"
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
          退出
        </button>
      )}

      {isMobile && paletteHasDark && (
        <div className="fixed right-4 top-4 z-10 flex gap-1">
          <button
            type="button"
            onClick={() => setPreviewMode((m) => (m === 'light' ? 'dark' : 'light'))}
            className="rounded-full bg-black/50 px-2.5 py-1.5 text-xs text-white/80 backdrop-blur-md"
          >
            {previewMode === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      )}

      <div className={`flex flex-1 items-center justify-center ${isMobile ? 'p-0' : 'p-6'}`}>
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

      {!isMobile && (
        <div className="pb-4 text-center">
          <span className="text-xs text-white/30">ESC 退出 &middot; 亮暗模式可在顶栏切换</span>
        </div>
      )}
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
