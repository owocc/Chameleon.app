import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { useEffect, useState, useCallback, useRef } from 'react'
import type { Palette, TemplateInfo } from '@chameleon/shared'
import {
  ALL_TEMPLATES,
  hasDarkMode,
  PALETTE_ROLES,
  PALETTE_ROLE_LABELS,
  getMobileCompatibleTemplates,
} from '@chameleon/shared'
import { WeChatTemplate, XTemplate, MacOSTemplate } from '@chameleon/ui'

type TemplateId = string

type PreviewMode = 'light' | 'dark'

const previewSearchSchema = z.object({
  paletteId: z.string().optional(),
  templateId: z.string().optional(),
  mode: z.enum(['light', 'dark']).optional(),
})

export const Route = createFileRoute('/preview')({
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

/** 将模板 ID 渲染为对应的组件 */
function renderTemplate(templateId: string, palette: Palette, mode: PreviewMode, fill = false) {
  if (templateId === 'wechat') return <WeChatTemplate palette={palette} mode={mode} fill={fill} />
  if (templateId === 'x') return <XTemplate palette={palette} mode={mode} fill={fill} />
  if (templateId === 'macos') return <MacOSTemplate palette={palette} mode={mode} fill={fill} />
  return null
}

function PreviewPage() {
  const navigate = useNavigate()
  const search = Route.useSearch()
  const templateWrapRef = useRef<HTMLDivElement>(null)
  const [palettes, setPalettes] = useState<Palette[]>([])
  const [selectedPaletteId, setSelectedPaletteId] = useState(search.paletteId ?? '')
  const [selectedTemplateId, setSelectedTemplateId] = useState<TemplateId>(
    search.templateId ?? 'wechat',
  )
  const [previewMode, setPreviewMode] = useState<PreviewMode>(search.mode ?? 'light')
  const [isMobile, setIsMobile] = useState(false)
  const [immersiveMode, setImmersiveMode] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // 移动端检测
  useEffect(() => {
    function check() {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // 浏览器全屏状态监听
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
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
  const currentTemplate = ALL_TEMPLATES.find((t) => t.id === selectedTemplateId)
  const paletteHasDark = currentPalette ? hasDarkMode(currentPalette) : false

  // 按平台过滤模板（移动端只显示 mobile 模板）
  const availableTemplates = isMobile ? getMobileCompatibleTemplates() : ALL_TEMPLATES

  // 如果当前选中的模板被过滤掉了，自动切到第一个可用模板
  useEffect(() => {
    if (selectedTemplateId && !availableTemplates.find((t) => t.id === selectedTemplateId)) {
      setSelectedTemplateId(availableTemplates[0]?.id ?? 'wechat')
    }
  }, [isMobile, availableTemplates, selectedTemplateId])

  const handleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      void document.documentElement.requestFullscreen()
    } else {
      void document.exitFullscreen()
    }
  }, [])

  const enterImmersive = useCallback(() => {
    setImmersiveMode(true)
  }, [])

  const exitImmersive = useCallback(() => {
    if (document.fullscreenElement) {
      void document.exitFullscreen()
    }
    setImmersiveMode(false)
  }, [])

  // 按 tag 分组模板
  const groupedTemplates = availableTemplates.reduce<Record<string, TemplateInfo[]>>((acc, t) => {
    for (const tag of t.tags) {
      if (!acc[tag]) acc[tag] = []
      acc[tag].push(t)
    }
    return acc
  }, {})

  return (
    <>
      {/* ========== 普通预览模式 ========== */}
      {!immersiveMode && (
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
                选择色板与模板，实时预览配色在真实界面中的效果。
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
                        backgroundColor: isActive
                          ? 'var(--chm-primary)'
                          : 'var(--chm-surface-card)',
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
                            {/* 选中指示器 */}
                            {isSelected && (
                              <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--chm-primary)] text-[10px] text-white">
                                ✓
                              </span>
                            )}
                            {/* 图标 */}
                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--chm-hairline)] bg-[var(--chm-canvas-soft)] text-xl">
                              {t.icon}
                            </div>
                            {/* 名称 */}
                            <p className="text-sm font-medium text-[var(--chm-ink)]">{t.name}</p>
                            {/* 描述 */}
                            <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--chm-body)]">
                              {t.description}
                            </p>
                            {/* Tag 标签 */}
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
              {/* 控制栏 */}
              <div className="mb-6 flex flex-wrap items-center gap-3">
                {/* 亮暗切换 */}
                <button
                  type="button"
                  onClick={() => setPreviewMode((m) => (m === 'light' ? 'dark' : 'light'))}
                  disabled={!paletteHasDark}
                  className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-40"
                  style={{
                    borderColor:
                      previewMode === 'dark' ? 'var(--chm-primary)' : 'var(--chm-hairline)',
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

                {/* 进入模板（沉浸模式） */}
                <button
                  type="button"
                  onClick={enterImmersive}
                  className="flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium text-white transition-all"
                  style={{
                    backgroundColor: 'var(--chm-primary)',
                  }}
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
                  <span>进入模板</span>
                </button>
              </div>

              {/* 模板 + 色板侧栏 */}
              <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-center">
                <div className="shrink-0">
                  <div className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.08em] text-[var(--chm-muted)]">
                    {currentTemplate?.name ?? '未知模板'}
                  </div>
                  {renderTemplate(selectedTemplateId, currentPalette, previewMode)}
                </div>

                {/* 色板信息侧栏 */}
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
                      {currentTemplate?.description}
                    </p>
                    <p className="mt-2 text-xs text-[var(--chm-muted)]">
                      💡 {currentTemplate?.previewHint}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-[var(--chm-hairline-strong)] bg-[var(--chm-canvas-soft)] px-6 py-20 text-center">
              <h3 className="font-serif text-3xl font-light text-[var(--chm-ink)]">
                请选择一个色板
              </h3>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[var(--chm-body)]">
                在上方选择一个色板，即可在模板中预览配色效果。
              </p>
            </div>
          )}
        </div>
      )}

      {/* ========== 沉浸模板模式 ========== */}
      {immersiveMode && currentPalette && (
        <div
          ref={templateWrapRef}
          className="fixed inset-0 z-50 flex flex-col"
          style={{ backgroundColor: isMobile ? '#000' : '#0d0d0d' }}
        >
          {/* 顶栏 — 只在桌面端显示 */}
          {!isMobile && (
            <div className="flex items-center justify-between px-6 py-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-white/60">{currentPalette.name}</span>
                <span className="text-sm text-white/30">/</span>
                <span className="flex items-center gap-1.5 text-sm text-white/80">
                  {currentTemplate?.icon} {currentTemplate?.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {/* 亮暗切换 */}
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
                {/* 浏览器全屏 */}
                <button
                  type="button"
                  onClick={handleFullscreen}
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
                      <>
                        <path
                          d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </>
                    ) : (
                      <>
                        <path
                          d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </>
                    )}
                  </svg>
                </button>
                {/* 退出沉浸 */}
                <button
                  type="button"
                  onClick={exitImmersive}
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

          {/* 移动端退出按钮（悬浮） */}
          {isMobile && (
            <button
              type="button"
              onClick={exitImmersive}
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

          {/* 模板主体（居中） */}
          <div className={`flex flex-1 items-center justify-center ${isMobile ? 'p-0' : 'p-6'}`}>
            <div className={isMobile ? 'h-full w-full' : 'scale-[var(--immersive-scale)]'}>
              {renderTemplate(selectedTemplateId, currentPalette, previewMode, isMobile)}
            </div>
          </div>

          {/* 底部提示（桌面端） */}
          {!isMobile && (
            <div className="pb-4 text-center">
              <span className="text-xs text-white/30">ESC 退出 &middot; 亮暗模式可在顶栏切换</span>
            </div>
          )}
        </div>
      )}
    </>
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
              style={{
                backgroundColor: roles[role],
                borderColor: 'var(--chm-hairline)',
              }}
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
