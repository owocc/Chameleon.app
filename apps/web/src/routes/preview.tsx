import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { useEffect, useState, useCallback, useRef } from 'react'
import type { Palette, MobileTemplateId, DesktopTemplateId } from '@chameleon/shared'
import {
  BUILTIN_MOBILE_TEMPLATES,
  BUILTIN_DESKTOP_TEMPLATES,
  hasDarkMode,
  PALETTE_ROLES,
  PALETTE_ROLE_LABELS,
} from '@chameleon/shared'
import { WeChatTemplate, XTemplate, MacOSTemplate } from '@chameleon/ui'

type TemplateId = MobileTemplateId | DesktopTemplateId

type PreviewMode = 'light' | 'dark'

const ALL_TEMPLATES = [...BUILTIN_MOBILE_TEMPLATES, ...BUILTIN_DESKTOP_TEMPLATES]

const previewSearchSchema = z.object({
  paletteId: z.string().optional(),
  templateId: z.string().optional(),
  mode: z.enum(['light', 'dark']).optional(),
  fullscreen: z.string().optional(),
})

export const Route = createFileRoute('/preview')({
  validateSearch: previewSearchSchema,
  component: PreviewPage,
})

const STORAGE_KEY = 'chameleon:palettes'

function PreviewPage() {
  const navigate = useNavigate()
  const search = Route.useSearch()
  const containerRef = useRef<HTMLDivElement>(null)
  const [palettes, setPalettes] = useState<Palette[]>([])
  const [selectedPaletteId, setSelectedPaletteId] = useState(search.paletteId ?? '')
  const [selectedTemplateId, setSelectedTemplateId] = useState<TemplateId>(
    (search.templateId as TemplateId) ?? 'wechat',
  )
  const [previewMode, setPreviewMode] = useState<PreviewMode>(search.mode ?? 'light')
  const [isFullscreen, setIsFullscreen] = useState(false)

  // 全屏状态监听
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  useEffect(() => {
    const stored = readStoredPalettes()
    setPalettes(stored)
    // auto-select first palette if none selected
    if (!selectedPaletteId && stored.length > 0) {
      setSelectedPaletteId(stored[0].id)
    }
  }, [])

  // Sync URL with state
  useEffect(() => {
    void navigate({
      to: '/preview',
      search: {
        paletteId: selectedPaletteId || undefined,
        templateId: selectedTemplateId,
        mode: previewMode !== 'light' ? previewMode : undefined,
      },
      replace: true,
    })
  }, [selectedPaletteId, selectedTemplateId, previewMode, navigate])

  const currentPalette = palettes.find((p) => p.id === selectedPaletteId)
  const currentTemplate = ALL_TEMPLATES.find((t) => t.id === selectedTemplateId)
  const paletteHasDark = currentPalette ? hasDarkMode(currentPalette) : false

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      void containerRef.current?.requestFullscreen()
    } else {
      void document.exitFullscreen()
    }
  }, [])

  return (
    <div ref={containerRef} className="space-y-8">
      {/* 页面头部 */}
      <section className="relative overflow-hidden rounded-[24px] border border-[var(--chm-hairline)] bg-[var(--chm-surface-card)] p-6 shadow-[0_22px_70px_rgb(12_10_9/0.07)] sm:p-10">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[var(--chm-gradient-rose)] opacity-45 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-12 h-64 w-64 rounded-full bg-[var(--chm-gradient-mint)] opacity-45 blur-3xl" />
        <div className="relative">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--chm-muted)]">
            Live preview
          </p>
          <h1 className="font-serif text-4xl font-light leading-[1.05] tracking-normal text-[var(--chm-ink)] sm:text-5xl">
            模板预览
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--chm-body)]">
            选择色板与模板，实时预览配色在真实界面中的效果。
          </p>
        </div>
      </section>

      {/* 选择栏 */}
      <div className="flex flex-wrap items-end gap-6">
        {/* 色板选择 */}
        <div className="min-w-[200px] flex-1 sm:flex-none">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-[var(--chm-muted)]">
            色板
          </label>
          {palettes.length === 0 ? (
            <p className="text-sm text-[var(--chm-body)]">
              还没有色板，先去{' '}
              <button
                type="button"
                onClick={() => navigate({ to: '/palette/new' })}
                className="font-medium underline underline-offset-2"
                style={{ color: 'var(--chm-primary)' }}
              >
                创建
              </button>
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {palettes.map((p) => {
                const isActive = p.id === selectedPaletteId
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPaletteId(p.id)}
                    className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all"
                    style={{
                      borderColor: isActive ? 'var(--chm-primary)' : 'var(--chm-hairline)',
                      backgroundColor: isActive ? 'var(--chm-primary)' : 'var(--chm-surface-card)',
                      color: isActive ? 'var(--chm-on-primary)' : 'var(--chm-ink)',
                    }}
                  >
                    <span
                      className="inline-block h-3 w-3 rounded-full"
                      style={{ backgroundColor: p.roles.primary }}
                    />
                    {p.name}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* 模板选择 */}
        <div className="min-w-[200px] flex-1 sm:flex-none">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-[var(--chm-muted)]">
            模板
          </label>
          <div className="flex flex-wrap gap-2">
            {ALL_TEMPLATES.map((t) => {
              const isActive = t.id === selectedTemplateId
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTemplateId(t.id as TemplateId)}
                  className="rounded-full border px-5 py-2 text-sm font-medium transition-all"
                  style={{
                    borderColor: isActive ? 'var(--chm-primary)' : 'var(--chm-hairline)',
                    backgroundColor: isActive ? 'var(--chm-primary)' : 'var(--chm-surface-card)',
                    color: isActive ? 'var(--chm-on-primary)' : 'var(--chm-ink)',
                  }}
                >
                  {t.name}
                </button>
              )
            })}
          </div>
        </div>

        {/* 亮暗 + 全屏控制 */}
        {currentPalette && (
          <div className="flex items-center gap-2">
            {/* 亮暗切换 */}
            <button
              type="button"
              onClick={() => setPreviewMode((m) => (m === 'light' ? 'dark' : 'light'))}
              disabled={!paletteHasDark}
              className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-40"
              style={{
                borderColor: previewMode === 'dark' ? 'var(--chm-primary)' : 'var(--chm-hairline)',
                backgroundColor:
                  previewMode === 'dark' ? 'var(--chm-primary)' : 'var(--chm-surface-card)',
                color: previewMode === 'dark' ? 'var(--chm-on-primary)' : 'var(--chm-ink)',
              }}
              title={!paletteHasDark ? '该色板未设置暗色模式' : ''}
            >
              {previewMode === 'dark' ? (
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
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
                  <circle cx={12} cy={12} r={4} strokeLinecap="round" strokeLinejoin="round" />
                  <path
                    d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
                    strokeLinecap="round"
                  />
                </svg>
              )}
              <span>{previewMode === 'dark' ? '暗色' : '亮色'}</span>
            </button>

            {/* 全屏按钮 */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all"
              style={{
                borderColor: 'var(--chm-hairline)',
                backgroundColor: 'var(--chm-surface-card)',
                color: 'var(--chm-ink)',
              }}
            >
              {isFullscreen ? (
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
              )}
              <span>{isFullscreen ? '退出全屏' : '全屏'}</span>
            </button>
          </div>
        )}
      </div>

      {/* 预览区 */}
      {currentPalette ? (
        <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-center">
          {/* 模板模拟器 */}
          <div className="shrink-0">
            <div className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.08em] text-[var(--chm-muted)]">
              {currentTemplate?.name ?? '未知模板'}
            </div>
            {selectedTemplateId === 'wechat' ? (
              <WeChatTemplate palette={currentPalette} mode={previewMode} />
            ) : selectedTemplateId === 'x' ? (
              <XTemplate palette={currentPalette} mode={previewMode} />
            ) : (
              <MacOSTemplate palette={currentPalette} mode={previewMode} />
            )}
          </div>

          {/* 色板信息侧栏 */}
          <div className="w-full shrink-0 max-w-xs">
            <div className="rounded-[24px] border border-[var(--chm-hairline)] bg-[var(--chm-surface-card)] p-5 shadow-[0_18px_48px_rgb(12_10_9/0.05)]">
              <h3 className="text-lg font-medium tracking-[0.01em] text-[var(--chm-ink)]">
                {currentPalette.name}
              </h3>

              {/* 亮色模式色板 */}
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--chm-muted)]">
                亮色模式
              </p>
              <PaletteRolesSection roles={currentPalette.roles} />

              {/* 暗色模式色板（仅存在时显示） */}
              {currentPalette.darkRoles && (
                <>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--chm-muted)]">
                    暗色模式
                  </p>
                  <PaletteRolesSection roles={currentPalette.darkRoles} />
                </>
              )}

              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--chm-muted)]">
                模板说明
              </p>
              <p className="mt-1 text-sm leading-6 text-[var(--chm-body)]">
                {currentTemplate?.description}
              </p>
              <p className="mt-2 text-xs text-[var(--chm-muted)]">
                💡 {currentTemplate?.previewHint}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-[24px] border border-dashed border-[var(--chm-hairline-strong)] bg-[var(--chm-canvas-soft)] px-6 py-20 text-center">
          <h3 className="font-serif text-3xl font-light text-[var(--chm-ink)]">请选择一个色板</h3>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[var(--chm-body)]">
            在上方选择一个色板，即可在模板中预览配色效果。
          </p>
        </div>
      )}
    </div>
  )
}

function PaletteRolesSection({ roles }: { roles: Palette['roles'] }) {
  return (
    <div className="mt-2 space-y-1.5">
      {PALETTE_ROLES.map((role) => (
        <div
          key={role}
          className="flex items-center justify-between rounded-xl px-3 py-1.5"
          style={{ backgroundColor: 'var(--chm-canvas-soft)' }}
        >
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-4 w-4 rounded-md border"
              style={{ backgroundColor: roles[role], borderColor: 'var(--chm-hairline)' }}
            />
            <span className="text-sm text-[var(--chm-ink)]">{PALETTE_ROLE_LABELS[role]}</span>
          </div>
          <span className="font-mono text-xs uppercase text-[var(--chm-muted-soft)]">
            {roles[role]}
          </span>
        </div>
      ))}
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
