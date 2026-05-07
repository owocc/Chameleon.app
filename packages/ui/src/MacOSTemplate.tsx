import type { TemplateTokenMap } from '@chameleon/shared'
import { mapPaletteToTemplateTokens, type Palette, getRolesForMode } from '@chameleon/shared'

interface MacOSTemplateProps {
  palette: Palette
  mode?: 'light' | 'dark'
  /** 填满容器（用于沉浸模式） */
  fill?: boolean
}

const SIDEBAR_ITEMS = [
  { icon: 'airplay', label: 'AirDrop' },
  { icon: 'clock', label: '最近使用' },
  { icon: 'appstore', label: '应用程序' },
  { icon: 'desktop', label: '桌面' },
  { icon: 'folder', label: '文稿', active: true },
  { icon: 'arrow-down', label: '下载' },
]

const FOLDER_CONTENTS = [
  { name: '设计资源', type: 'folder', size: '--', date: '今天 10:23' },
  { name: '项目文档', type: 'folder', size: '--', date: '昨天 15:45' },
  { name: '色板备份.json', type: 'file', size: '24 KB', date: '2026/5/6' },
  { name: 'Chameleon 设计稿.sketch', type: 'file', size: '4.2 MB', date: '2026/5/5' },
  { name: '模板规范.md', type: 'file', size: '16 KB', date: '2026/5/4' },
  { name: '团队成员', type: 'folder', size: '--', date: '2026/5/3' },
  { name: '配色方案参考', type: 'folder', size: '--', date: '2026/4/28' },
  { name: '灵感截图', type: 'folder', size: '--', date: '2026/4/25' },
  { name: 'icon-set.zip', type: 'file', size: '890 KB', date: '2026/4/20' },
]

function buildTokenCSS(tokens: TemplateTokenMap): React.CSSProperties {
  return {
    '--mac-app-bg': tokens.appBg,
    '--mac-titlebar-bg': tokens.navBg,
    '--mac-titlebar-text': tokens.navText,
    '--mac-surface': tokens.surface,
    '--accent': tokens.accent,
    '--mac-menu-text': tokens.primaryText,
    '--mac-sidebar-bg': tokens.extra?.sidebarBg ?? tokens.surface,
    '--mac-sidebar-selection': tokens.extra?.sidebarSelection ?? tokens.primaryText,
    '--mac-sidebar-text': tokens.extra?.sidebarText ?? tokens.primaryText,
    '--mac-highlight': tokens.extra?.highlight ?? tokens.accent,
    '--mac-border': tokens.border,
    '--mac-secondary-text': tokens.secondaryText,
    '--tl-close': tokens.extra?.trafficLightClose ?? '#ff5f57',
    '--tl-minimize': tokens.extra?.trafficLightMinimize ?? '#febc2e',
    '--tl-maximize': tokens.extra?.trafficLightMaximize ?? '#28c840',
  } as React.CSSProperties
}

export function MacOSTemplate({ palette, mode = 'light', fill = false }: MacOSTemplateProps) {
  const roles = getRolesForMode(palette.roles, mode, palette.darkRoles)
  const tokens = mapPaletteToTemplateTokens(roles, 'macos')

  return (
    <div
      className={`mx-auto flex flex-col overflow-hidden ${
        fill ? 'h-full w-full rounded-none' : 'h-[700px] w-[780px] rounded-[16px] border shadow-2xl'
      }`}
      style={{
        borderColor: 'var(--mac-border)',
        background: 'var(--mac-app-bg)',
        ...buildTokenCSS(tokens),
      }}
    >
      {/* ── 标题栏 ── */}
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{ backgroundColor: 'var(--mac-titlebar-bg)' }}
      >
        {/* 三色交通灯 */}
        <div className="flex items-center gap-[6px]">
          <span
            className="block h-3 w-3 rounded-full"
            style={{ backgroundColor: 'var(--tl-close)' }}
          />
          <span
            className="block h-3 w-3 rounded-full"
            style={{ backgroundColor: 'var(--tl-minimize)' }}
          />
          <span
            className="block h-3 w-3 rounded-full"
            style={{ backgroundColor: 'var(--tl-maximize)' }}
          />
        </div>
        {/* 窗口标题 */}
        <div
          className="mx-auto flex items-center gap-2 rounded-md px-3 py-1 text-[13px] font-medium"
          style={{
            color: 'var(--mac-titlebar-text)',
            backgroundColor: 'color-mix(in srgb, var(--mac-app-bg) 70%, transparent)',
            opacity: 0.8,
          }}
        >
          <svg
            className="h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          <span>文稿</span>
        </div>
      </div>

      {/* ── 菜单栏 ── */}
      <div
        className="flex items-center gap-1 px-4 py-1 text-[13px]"
        style={{
          backgroundColor: 'var(--mac-titlebar-bg)',
          color: 'var(--mac-titlebar-text)',
          opacity: 0.9,
        }}
      >
        {['Finder', '文件', '编辑', '显示', '前往', '窗口', '帮助'].map((item) => (
          <span
            key={item}
            className="rounded px-2 py-0.5 transition-opacity hover:opacity-80"
            style={{
              fontWeight: item === 'Finder' ? 600 : 400,
            }}
          >
            {item}
          </span>
        ))}
      </div>

      {/* ── 工具栏 ── */}
      <div
        className="flex items-center gap-2 border-b px-4 py-2"
        style={{
          borderColor: 'var(--mac-border)',
          backgroundColor: 'var(--mac-titlebar-bg)',
        }}
      >
        {/* 导航按钮 */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="rounded p-1 opacity-60 transition-opacity hover:opacity-100"
            style={{ color: 'var(--mac-titlebar-text)' }}
            aria-label="后退"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            className="rounded p-1 opacity-60 transition-opacity hover:opacity-100"
            style={{ color: 'var(--mac-titlebar-text)' }}
            aria-label="前进"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        {/* 视图切换 */}
        <div
          className="flex items-center gap-1 rounded-md border px-1 py-0.5"
          style={{ borderColor: 'var(--mac-border)' }}
        >
          {[
            {
              icon: 'M4 4h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 10h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 16h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4z',
              active: true,
            },
            {
              icon: 'M3 3h7v7H3zm1 1h5v5H4zM3 13h7v7H3zm1 1h5v5H4zM14 3h7v7h-7zm1 1h5v5h-5zM14 13h7v7h-7zm1 1h5v5h-5z',
              active: false,
            },
            { icon: 'M4 4h16v2H4zm0 5h16v2H4zm0 5h16v2H4zm0 5h16v2H4z', active: false },
          ].map((btn, i) => (
            <button
              key={i}
              type="button"
              className="rounded p-1"
              style={{
                color: 'var(--mac-titlebar-text)',
                backgroundColor: btn.active
                  ? 'color-mix(in srgb, var(--mac-app-bg) 70%, transparent)'
                  : 'transparent',
                opacity: btn.active ? 1 : 0.5,
              }}
              aria-label="视图切换"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d={btn.icon} />
              </svg>
            </button>
          ))}
        </div>
        {/* 搜索 */}
        <div
          className="ml-auto flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px]"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--mac-app-bg) 60%, transparent)',
          }}
        >
          <svg
            className="h-3 w-3"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            style={{ color: 'var(--mac-secondary-text)' }}
          >
            <circle cx={11} cy={11} r={7} />
            <path d="M16.5 16.5 21 21" strokeLinecap="round" />
          </svg>
          <span style={{ color: 'var(--mac-secondary-text)' }}>搜索</span>
        </div>
      </div>

      {/* ── 主体：侧栏 + 内容 ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* 侧栏 */}
        <div
          className="w-48 shrink-0 overflow-y-auto border-r py-2"
          style={{
            borderColor: 'var(--mac-border)',
            backgroundColor: 'var(--mac-sidebar-bg)',
          }}
        >
          {SIDEBAR_ITEMS.map((item) => (
            <button
              key={item.label}
              type="button"
              className="flex w-full items-center gap-2 px-4 py-1.5 text-left text-[13px] transition-colors"
              style={{
                color: 'var(--mac-sidebar-text)',
                backgroundColor: item.active ? 'var(--mac-sidebar-selection)' : 'transparent',
                opacity: item.active ? 1 : 0.7,
              }}
            >
              <SidebarIcon name={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* 文件内容 */}
        <div className="flex-1 overflow-y-auto" style={{ backgroundColor: 'var(--mac-app-bg)' }}>
          {/* 列标题 */}
          <div
            className="flex items-center gap-4 border-b px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.05em]"
            style={{
              borderColor: 'var(--mac-border)',
              color: 'var(--mac-secondary-text)',
              backgroundColor: 'var(--mac-surface)',
            }}
          >
            <span className="flex-1">名称</span>
            <span className="w-20 text-right">大小</span>
            <span className="w-28 text-right">修改日期</span>
          </div>
          {/* 文件行 */}
          {FOLDER_CONTENTS.map((file) => (
            <div
              key={file.name}
              className="flex cursor-pointer items-center gap-4 px-4 py-2 text-[13px] transition-colors hover:opacity-80"
              style={{
                color: 'var(--mac-primary-text, var(--mac-sidebar-text))',
                ...(file.name === 'Chameleon 设计稿.sketch'
                  ? { backgroundColor: 'var(--mac-highlight)', opacity: 0.15 }
                  : {}),
              }}
            >
              <div className="flex flex-1 items-center gap-2.5">
                {file.type === 'folder' ? (
                  <svg
                    className="h-4 w-4 shrink-0"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    style={{ color: 'var(--mac-accent, #6366f1)' }}
                  >
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                ) : (
                  <svg
                    className="h-4 w-4 shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path d="M14 2v6h6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                <span
                  className="truncate"
                  style={{
                    fontWeight: file.type === 'folder' ? 500 : 400,
                    color: 'var(--mac-primary-text, var(--mac-sidebar-text))',
                  }}
                >
                  {file.name}
                </span>
              </div>
              <span
                className="w-20 shrink-0 text-right text-[12px]"
                style={{ color: 'var(--mac-secondary-text)' }}
              >
                {file.size}
              </span>
              <span
                className="w-28 shrink-0 text-right text-[12px]"
                style={{ color: 'var(--mac-secondary-text)' }}
              >
                {file.date}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 状态栏 ── */}
      <div
        className="flex items-center justify-between border-t px-4 py-1 text-[11px]"
        style={{
          borderColor: 'var(--mac-border)',
          backgroundColor: 'var(--mac-titlebar-bg)',
          color: 'var(--mac-titlebar-text)',
          opacity: 0.7,
        }}
      >
        <span>9 个项目</span>
        <span>{palette.name}</span>
      </div>
    </div>
  )
}

function SidebarIcon({ name }: { name: string }) {
  const size = 'h-4 w-4'
  const strokeProps = { stroke: 'currentColor', strokeWidth: 1.5, fill: 'none' }
  switch (name) {
    case 'airplay':
      return (
        <svg className={size} viewBox="0 0 24 24" {...strokeProps}>
          <path
            d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M12 15l5 6H7l5-6z" />
        </svg>
      )
    case 'clock':
      return (
        <svg className={size} viewBox="0 0 24 24" {...strokeProps}>
          <circle cx={12} cy={12} r={10} />
          <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'appstore':
      return (
        <svg className={size} viewBox="0 0 24 24" {...strokeProps}>
          <rect x={3} y={3} width={7} height={7} rx={1} />
          <rect x={14} y={3} width={7} height={7} rx={1} />
          <rect x={3} y={14} width={7} height={7} rx={1} />
          <rect x={14} y={14} width={7} height={7} rx={1} />
        </svg>
      )
    case 'desktop':
      return (
        <svg className={size} viewBox="0 0 24 24" {...strokeProps}>
          <rect x={2} y={3} width={20} height={14} rx={2} />
          <path d="M8 21h8M12 17v4" strokeLinecap="round" />
        </svg>
      )
    case 'folder':
      return (
        <svg className={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      )
    case 'arrow-down':
      return (
        <svg className={size} viewBox="0 0 24 24" {...strokeProps}>
          <path d="M12 5v14M19 12l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    default:
      return (
        <svg className={size} viewBox="0 0 24 24" {...strokeProps}>
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      )
  }
}
