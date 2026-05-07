import { createFileRoute, Link } from '@tanstack/react-router'
import { ALL_TEMPLATES, getMobileCompatibleTemplates } from '@chameleon/shared'
import { useIsMobile } from '@/hooks/useIsMobile'

export const Route = createFileRoute('/templates')({
  component: TemplatesPage,
})

/** 模板标签的中文映射 */
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

function TemplatesPage() {
  const isMobile = useIsMobile()
  const availableTemplates = isMobile ? getMobileCompatibleTemplates() : ALL_TEMPLATES

  // 按平台分组
  const mobileTemplates = availableTemplates.filter((t) => t.platform === 'mobile')
  const desktopTemplates = availableTemplates.filter((t) => t.platform === 'desktop')

  // 收集所有唯一的 tag
  const allTags = [...new Set(availableTemplates.flatMap((t) => t.tags))]

  return (
    <div className="space-y-10">
      {/* 页面头部 */}
      <section className="relative overflow-hidden rounded-[16px] border border-[var(--chm-hairline)] bg-[var(--chm-surface-card)] p-6 shadow-[0_22px_70px_rgb(12_10_9/0.07)] sm:p-10">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[var(--chm-gradient-sky)] opacity-45 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-12 h-64 w-64 rounded-full bg-[var(--chm-gradient-lavender)] opacity-45 blur-3xl" />
        <div className="relative">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--chm-muted)]">
            App Store
          </p>
          <h1 className="font-serif text-4xl font-light leading-[1.05] tracking-normal text-[var(--chm-ink)] sm:text-5xl">
            模板市场
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--chm-body)]">
            选择一个模板，用你的色板进行实时预览，看看配色在真实界面中的效果。
          </p>

          {isMobile && (
            <p className="mt-4 text-sm leading-6 text-[var(--chm-body)]">
              检测到移动设备，已自动过滤桌面端模板。
            </p>
          )}

          {/* 可用标签一览 */}
          <div className="mt-6 flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-[var(--chm-muted)]"
                style={{ backgroundColor: 'var(--chm-surface-strong)' }}
              >
                {getTagLabel(tag)}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 移动端模板 */}
      {mobileTemplates.length > 0 && (
        <section>
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📱</span>
              <h2 className="text-xl font-medium tracking-[0.01em] text-[var(--chm-ink)]">
                移动应用
              </h2>
              <span className="rounded-full bg-[var(--chm-surface-strong)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--chm-muted)]">
                {mobileTemplates.length} 个模板
              </span>
            </div>
            <p className="mt-1 text-sm leading-6 text-[var(--chm-body)]">
              社交、即时通讯、信息流 — 覆盖移动端常见界面模式
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {mobileTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </section>
      )}

      {/* 桌面端模板 */}
      {desktopTemplates.length > 0 && (
        <section>
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🖥️</span>
              <h2 className="text-xl font-medium tracking-[0.01em] text-[var(--chm-ink)]">
                桌面系统
              </h2>
              <span className="rounded-full bg-[var(--chm-surface-strong)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--chm-muted)]">
                {desktopTemplates.length} 个模板
              </span>
            </div>
            <p className="mt-1 text-sm leading-6 text-[var(--chm-body)]">
              系统界面、窗口管理、文件浏览 — 覆盖桌面端典型场景
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {desktopTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
            {/* 占位：更多即将推出 */}
            <PlaceholderCard count={Math.max(0, 3 - desktopTemplates.length)} />
          </div>
        </section>
      )}
    </div>
  )
}

function TemplateCard({
  template,
}: {
  template: {
    id: string
    name: string
    icon: string
    description: string
    tags: string[]
    platform: string
  }
}) {
  return (
    <Link
      to="/preview/$templateId"
      params={{ templateId: template.id }}
      search={{ paletteId: undefined }}
      className="group relative block overflow-hidden rounded-[16px] border border-[var(--chm-hairline)] bg-[var(--chm-surface-card)] p-6 shadow-[0_4px_16px_rgb(12_10_9/0.04)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgb(12_10_9/0.08)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            {/* 图标 */}
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl shadow-sm"
              style={{
                backgroundColor: 'var(--chm-surface-strong)',
                color: 'var(--chm-muted)',
              }}
            >
              {template.icon}
            </div>
            <div>
              <h3 className="text-lg font-medium tracking-[0.01em] text-[var(--chm-ink)]">
                {template.name}
              </h3>
              {/* 标签 */}
              <div className="mt-1 flex flex-wrap gap-1">
                {template.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[var(--chm-surface-strong)] px-2 py-0.5 text-[10px] font-medium text-[var(--chm-muted)]"
                  >
                    {getTagLabel(tag)}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-[var(--chm-body)] line-clamp-2">
            {template.description}
          </p>
          <div
            className="mt-4 inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-xs font-medium text-white transition-colors"
            style={{
              backgroundColor: 'var(--chm-primary)',
            }}
          >
            预览色板
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  )
}

function PlaceholderCard({ count }: { count: number }) {
  if (count <= 0) return null
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-[16px] border border-dashed border-[var(--chm-hairline-strong)] bg-[var(--chm-canvas-soft)] p-6 text-center flex flex-col items-center justify-center min-h-[200px]"
        >
          <p className="text-4xl opacity-30">+</p>
          <p className="mt-3 font-serif text-lg font-light text-[var(--chm-muted-soft)]">
            更多模板即将推出
          </p>
        </div>
      ))}
    </>
  )
}
