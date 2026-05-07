import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { z } from 'zod'
import { useEffect, useState } from 'react'
import type { Palette, TemplateInfo } from '@chameleon/shared'
import {
  ALL_TEMPLATES,
  hasDarkMode,
  PALETTE_ROLES,
  PALETTE_ROLE_LABELS,
  getMobileCompatibleTemplates,
} from '@chameleon/shared'
import { WeChatTemplate, XTemplate, MacOSTemplate } from '@chameleon/ui'

type PreviewMode = 'light' | 'dark'

const previewSearchSchema = z.object({
  paletteId: z.string().optional(),
  templateId: z.string().optional(),
  mode: z.enum(['light', 'dark']).optional(),
})

export const Route = createFileRoute('/preview/')({
  validateSearch: previewSearchSchema,
  component: PreviewPage,
})

const STORAGE_KEY = 'chameleon:palettes'
const MOBILE_BREAKPOINT = 768

/** 获取模板标签的中文名 */
const TAG_LABELS: Record<string, string> = {
  social: '社交',
  messaging: '即时通讯',
  feed: '信息流',
  system: '系统',
  finder: '文件管理',
}

function getTagLabel(tag: string): string {
  return TAG_LABELS[tag] ?? tag
}

/** 将模板 ID 渲染为对应的组件（缩略模式） */
function renderThumbnail(templateId: string, palette: Palette, mode: PreviewMode) {
  return (
    <div
      className="flex items-center justify-center overflow-hidden"
      style={{ height: templateId === 'macos' ? 480 : 400 }}
    >
      <div className="scale-[0.55] sm:scale-[0.6]">
        {templateId === 'wechat' ? (
          <WeChatTemplate palette={palette} mode={mode} />
        ) : templateId === 'x' ? (
          <XTemplate palette={palette} mode={mode} />
        ) : templateId === 'macos' ? (
          <MacOSTemplate palette={palette} mode={mode} />
        ) : null}
      </div>
    </div>
  )
}

function PreviewPage() {
  const navigate = useNavigate()
  const search = Route.useSearch()
  const [palettes, setPalettes] = useState<Palette[]>([])
  const [selectedPaletteId, setSelectedPaletteId] = useState(search.paletteId ?? '')
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    search.templateId ?? 'wechat',
  )
  const [previewMode, setPreviewMode] = useState<PreviewMode>(search.mode ?? 'light')
  const [isMobile, setIsMobile] = useState(false)

  // 移动端检测
  useEffect(() => {
    function check() {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // 加载色板
  useEffect(() => {
    const stored = readStoredPalettes()
    setPalettes(stored)
    if (!selectedPaletteId && stored.length > 0) {
      setSelectedPaletteId(stored[0].id)
    }
  }, [])

  // 同步 URL
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
  const paletteHasDark = currentPalette ? hasDarkMode(currentPalette) : false

  // 按平台过滤模板（移动端只显示 mobile 模板）
  const availableTemplates = isMobile ? getMobileCompatibleTemplates() : ALL_TEMPLATES

  // 按 tag 分组模板
  const groupedTemplates = availableTemplates.reduce<Record<string, TemplateInfo[]>>((acc, t) => {
    for (const tag of t.tags) {
      if (!acc[tag]) acc[tag] = []
      acc[tag].push(t)
    }
    return acc
  }, {})

  /** 构造跳转到模板沉浸页的链接 */
  function immersiveLink(templateId: string) {
    return {
      to: '/preview/$templateId' as const,
      params: { templateId },
      search: {
        paletteId: selectedPaletteId || undefined,
        mode: previewMode !== 'light' ? previewMode : undefined,
      },
    }
  }

  return (
    <div className="space-y-8">
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
            选择色板与模板，点击「进入」即可在全屏沉浸模式下预览配色效果。
          </p>
        </div>
      </section>

      {/* 色板选择 */}
      <section>
        <label className="mb-3 block text-xs font-semibold uppercase tracking-[0.08em] text-[var(--chm-muted)]">
          选择色板
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
      </section>

      {/* 模板市场 — 应用商店风格 */}
      {currentPalette && (
        <section>
          <label className="mb-3 block text-xs font-semibold uppercase tracking-[0.08em] text-[var(--chm-muted)]">
            {isMobile ? '移动应用' : '模板市场'}
          </label>
          {isMobile && (
            <p className="mb-4 text-sm leading-6 text-[var(--chm-body)]">
              检测到移动设备，已自动过滤桌面端模板。
            </p>
          )}
          <div className="space-y-6">
            {Object.entries(groupedTemplates).map(([tag, templates]) => (
              <div key={tag}>
                <h3 className="mb-3 text-sm font-medium text-[var(--chm-ink)]">
                  {getTagLabel(tag)}
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {templates.map((t) => {
                    const isSelected = t.id === selectedTemplateId
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedTemplateId(t.id)}
                        className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-200 ${
                          isSelected
                            ? 'border-[var(--chm-primary)] shadow-[0_0_0_1px_var(--chm-primary),0_8px_24px_rgb(12_10_9/0.08)]'
                            : 'border-[var(--chm-hairline)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgb(12_10_9/0.06)]'
                        }`}
                        style={{
                          backgroundColor: isSelected
                            ? 'color-mix(in srgb, var(--chm-primary) 8%, var(--chm-surface-card))'
                            : 'var(--chm-surface-card)',
                        }}
                      >
                        {isSelected && (
                          <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--chm-primary)] text-[10px] text-white">
                            ✓
                          </span>
                        )}
                        <div
                          className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl shadow-sm"
                          style={{
                            backgroundColor: 'var(--chm-surface-strong)',
                            color: 'var(--chm-muted)',
                          }}
                        >
                          {t.icon}
                        </div>
                        <p className="text-sm font-medium text-[var(--chm-ink)]">{t.name}</p>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--chm-body)]">
                          {t.description}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {t.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-[var(--chm-surface-strong)] px-2 py-0.5 text-[10px] font-medium text-[var(--chm-muted)]"
                            >
                              {getTagLabel(tag)}
                            </span>
                          ))}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 预览区 */}
      {currentPalette ? (
        <div>
          <div className="mb-6 flex flex-wrap items-center gap-3">
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

            <Link
              to={immersiveLink(selectedTemplateId).to}
              params={immersiveLink(selectedTemplateId).params}
              search={immersiveLink(selectedTemplateId).search}
              className="flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium text-white transition-all"
              style={{ backgroundColor: 'var(--chm-primary)' }}
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              进入模板
            </Link>
          </div>

          <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-center">
            <div className="shrink-0">
              <div className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.08em] text-[var(--chm-muted)]">
                {ALL_TEMPLATES.find((t) => t.id === selectedTemplateId)?.name ?? '未知模板'}
              </div>
              {renderThumbnail(selectedTemplateId, currentPalette, previewMode)}
            </div>

            <div className="w-full shrink-0 max-w-xs">
              <div className="rounded-[24px] border border-[var(--chm-hairline)] bg-[var(--chm-surface-card)] p-5 shadow-[0_18px_48px_rgb(12_10_9/0.05)]">
                <h3 className="text-lg font-medium tracking-[0.01em] text-[var(--chm-ink)]">
                  {currentPalette.name}
                </h3>

                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--chm-muted)]">
                  亮色模式
                </p>
                <PaletteRolesSection roles={currentPalette.roles} />

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
                  {ALL_TEMPLATES.find((t) => t.id === selectedTemplateId)?.description}
                </p>
                <p className="mt-2 text-xs text-[var(--chm-muted)]">
                  💡 {ALL_TEMPLATES.find((t) => t.id === selectedTemplateId)?.previewHint}
                </p>
              </div>
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
