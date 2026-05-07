import { createFileRoute, Link } from '@tanstack/react-router'
import { BUILTIN_MOBILE_TEMPLATES } from '@chameleon/shared'

export const Route = createFileRoute('/templates')({
  component: TemplatesPage,
})

function TemplatesPage() {
  return (
    <div className="space-y-10">
      {/* 页面头部 */}
      <section className="relative overflow-hidden rounded-[24px] border border-[var(--chm-hairline)] bg-[var(--chm-surface-card)] p-6 shadow-[0_22px_70px_rgb(12_10_9/0.07)] sm:p-10">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[var(--chm-gradient-sky)] opacity-45 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-12 h-64 w-64 rounded-full bg-[var(--chm-gradient-lavender)] opacity-45 blur-3xl" />
        <div className="relative">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--chm-muted)]">
            Templates
          </p>
          <h1 className="font-serif text-4xl font-light leading-[1.05] tracking-normal text-[var(--chm-ink)] sm:text-5xl">
            模板库
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--chm-body)]">
            选择一个模板，用你的色板进行实时预览，看看配色在真实界面中的效果。
          </p>
        </div>
      </section>

      {/* 移动端模板 */}
      <div>
        <div className="mb-6">
          <h2 className="text-xl font-medium tracking-[0.01em] text-[var(--chm-ink)]">
            📱 移动端
          </h2>
          <p className="mt-1 text-sm leading-6 text-[var(--chm-body)]">
            移动应用模板，覆盖导航栏、列表、交互控件
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {BUILTIN_MOBILE_TEMPLATES.map((template) => (
            <Link
              key={template.id}
              to="/preview"
              search={{ paletteId: undefined, templateId: template.id }}
              className="group block rounded-[24px] border border-[var(--chm-hairline)] bg-[var(--chm-surface-card)] p-6 shadow-[0_18px_48px_rgb(12_10_9/0.05)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgb(12_10_9/0.1)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-xl font-medium tracking-[0.01em] text-[var(--chm-ink)]">
                    {template.name}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--chm-body)]">
                    {template.description}
                  </p>
                  <div className="mt-4 inline-flex items-center gap-1 rounded-full bg-[var(--chm-surface-strong)] px-3 py-1.5 text-xs font-medium text-[var(--chm-ink)] transition-colors group-hover:bg-[var(--chm-primary)] group-hover:text-white">
                    预览色板
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
                {/* 模板小图标 */}
                <div className="shrink-0 rounded-2xl border p-3" style={{ borderColor: 'var(--chm-hairline)', backgroundColor: 'var(--chm-canvas-soft)' }}>
                  <span className="text-2xl">{template.id === 'wechat' ? '💬' : '𝕏'}</span>
                </div>
              </div>
              {/* Token 预览 */}
              <div className="mt-6 flex gap-1">
                {[
                  ['navBg', '#292524'],
                  ['surface', '#f8fafc'],
                  ['accent', '#f59e0b'],
                  ['text', '#1a1a2e'],
                  ['appBg', '#ffffff'],
                ].map(([name, fallback]) => (
                  <div
                    key={name}
                    className="h-4 flex-1 rounded-full first:rounded-l-md last:rounded-r-md"
                    style={{ backgroundColor: `var(--chm-${name === 'navBg' ? 'primary' : name === 'appBg' ? 'canvas' : name === 'text' ? 'ink' : 'muted'}, ${fallback})` }}
                    title={name}
                  />
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 系统模板 - 占位 */}
      <div>
        <div className="mb-6">
          <h2 className="text-xl font-medium tracking-[0.01em] text-[var(--chm-ink)]">
            🖥️ 系统（即将推出）
          </h2>
          <p className="mt-1 text-sm leading-6 text-[var(--chm-body)]">
            Windows / macOS / Ubuntu 桌面系统模板
          </p>
        </div>
        <div className="rounded-[24px] border border-dashed border-[var(--chm-hairline-strong)] bg-[var(--chm-canvas-soft)] px-6 py-12 text-center">
          <p className="font-serif text-2xl font-light text-[var(--chm-muted-soft)]">
            桌面系统模板开发中...
          </p>
          <p className="mt-2 text-sm text-[var(--chm-muted)]">
            下一个阶段将支持 Windows、macOS、Ubuntu 的系统配色预览
          </p>
        </div>
      </div>
    </div>
  )
}
