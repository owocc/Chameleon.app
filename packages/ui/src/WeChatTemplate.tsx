import { useState } from 'react'
import type { TemplateTokenMap, Palette } from '@chameleon/shared'
import { mapPaletteToTemplateTokens, getRolesForMode } from '@chameleon/shared'

interface WeChatTemplateProps {
  palette: Palette
  mode?: 'light' | 'dark'
}

type WeChatPage = 'chats' | 'contacts' | 'discover' | 'profile'

const MOCK_CHATS = [
  {
    name: '产品小组',
    message: '好的，那我们就定这个配色方案了',
    time: '09:45',
    unread: 3,
    avatar: '👥',
  },
  {
    name: 'Lisa Chen',
    message: 'Preview 的链接我发你了～',
    time: '09:30',
    unread: 0,
    avatar: '👩‍💻',
  },
  { name: '设计资源', message: '本周灵感合集已更新', time: '昨天', unread: 1, avatar: '🎨' },
  {
    name: '周一的会议',
    message: '会议纪要：V2 功能优先级讨论',
    time: '昨天',
    unread: 0,
    avatar: '📋',
  },
  { name: 'GitHub', message: '[GitHub] 有人提到了你', time: '周三', unread: 5, avatar: '🐙' },
  { name: '快递助手', message: '您的包裹已放入快递柜', time: '周三', unread: 0, avatar: '📦' },
  { name: '妈妈', message: '周末回来吃饭吗？', time: '周二', unread: 2, avatar: '💬' },
]

function buildTokenCSS(tokens: TemplateTokenMap): React.CSSProperties {
  return {
    '--wt-app-bg': tokens.appBg,
    '--wt-nav-bg': tokens.navBg,
    '--wt-nav-text': tokens.navText,
    '--wt-surface': tokens.surface,
    '--wt-primary-text': tokens.primaryText,
    '--wt-secondary-text': tokens.secondaryText,
    '--wt-accent': tokens.accent,
    '--wt-border': tokens.border,
    '--wt-bubble-outgoing': tokens.extra?.bubbleOutgoing ?? tokens.primaryText,
    '--wt-bubble-incoming': tokens.extra?.bubbleIncoming ?? tokens.surface,
    '--wt-badge': tokens.extra?.badge ?? tokens.accent,
  } as React.CSSProperties
}

export function WeChatTemplate({ palette, mode = 'light' }: WeChatTemplateProps) {
  const roles = getRolesForMode(palette.roles, mode, palette.darkRoles)
  const tokens = mapPaletteToTemplateTokens(roles, 'wechat')
  const [page, setPage] = useState<WeChatPage>('chats')

  return (
    <div
      className="mx-auto flex h-[700px] w-[375px] flex-col overflow-hidden rounded-[28px] border shadow-xl"
      style={{
        borderColor: 'var(--wt-border)',
        background: 'var(--wt-app-bg)',
        ...buildTokenCSS(tokens),
      }}
    >
      {/* 状态栏 */}
      <div
        className="flex items-center justify-between px-6 py-2 text-[11px] font-semibold"
        style={{ color: 'var(--wt-nav-text)', backgroundColor: 'var(--wt-nav-bg)' }}
      >
        <span>9:41</span>
        <div className="flex items-center gap-1">
          <svg className="h-3 w-4" viewBox="0 0 16 12" fill="currentColor">
            <path d="M1 9h2V5H1v4zm3 2h2V3H4v8zm3-4h2V1H7v6zm3 2h2V5h-2v4z" />
          </svg>
          <svg className="h-3 w-4" viewBox="0 0 16 12" fill="currentColor">
            <path d="M11 2.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" />
          </svg>
        </div>
      </div>

      {/* 导航栏 */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ backgroundColor: 'var(--wt-nav-bg)' }}
      >
        <span className="text-lg font-medium" style={{ color: 'var(--wt-nav-text)' }}>
          微信
        </span>
        <button
          type="button"
          className="rounded-full p-1.5"
          style={{ color: 'var(--wt-nav-text)' }}
          aria-label="添加"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* 搜索栏（仅聊天页） */}
      {page === 'chats' && (
        <div className="px-3 py-2" style={{ backgroundColor: 'var(--wt-nav-bg)' }}>
          <div
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--wt-app-bg) 85%, transparent)',
              color: 'var(--wt-secondary-text)',
            }}
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx={11} cy={11} r={7} />
              <path d="M16.5 16.5 21 21" strokeLinecap="round" />
            </svg>
            <span>搜索</span>
          </div>
        </div>
      )}

      {/* 内容区域 */}
      {page === 'chats' && <ChatsPage />}
      {page === 'contacts' && <ContactsPage />}
      {page === 'discover' && <DiscoverPage />}
      {page === 'profile' && <ProfilePage />}

      {/* 底部 Tab */}
      <TabBar active={page} onTabChange={setPage} />
    </div>
  )
}

/* ── 子页面组件 ── */

function ChatsPage() {
  return (
    <div className="flex-1 overflow-y-auto" style={{ backgroundColor: 'var(--wt-app-bg)' }}>
      {MOCK_CHATS.map((chat, i) => (
        <div key={chat.name}>
          <div
            className="flex items-center gap-3 px-4 py-3 active:opacity-80"
            style={{ backgroundColor: 'var(--wt-app-bg)' }}
          >
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg"
              style={{ backgroundColor: 'var(--wt-surface)' }}
            >
              {chat.avatar}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span
                  className="truncate text-[15px] font-medium"
                  style={{ color: 'var(--wt-primary-text)' }}
                >
                  {chat.name}
                </span>
                <span
                  className="shrink-0 text-[11px]"
                  style={{ color: 'var(--wt-secondary-text)' }}
                >
                  {chat.time}
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-2">
                <span
                  className="truncate text-[13px]"
                  style={{ color: 'var(--wt-secondary-text)' }}
                >
                  {chat.message}
                </span>
                {chat.unread > 0 && (
                  <span
                    className="flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-semibold text-white"
                    style={{ backgroundColor: 'var(--wt-badge)' }}
                  >
                    {chat.unread}
                  </span>
                )}
              </div>
            </div>
          </div>
          {i < MOCK_CHATS.length - 1 && (
            <div className="ml-[72px] h-px" style={{ backgroundColor: 'var(--wt-border)' }} />
          )}
        </div>
      ))}
    </div>
  )
}

function ContactsPage() {
  const contacts = [
    { name: 'Lisa Chen', avatar: '👩‍💻', status: '在线' },
    { name: '产品小组', avatar: '👥', status: '3 条消息' },
    { name: '妈妈', avatar: '💬', status: '在线' },
    { name: '设计资源', avatar: '🎨', status: '离线' },
    { name: '快递助手', avatar: '📦', status: '在线' },
  ]
  return (
    <div className="flex-1 overflow-y-auto" style={{ backgroundColor: 'var(--wt-app-bg)' }}>
      <div
        className="px-4 py-2 text-xs font-semibold uppercase tracking-wider"
        style={{
          color: 'var(--wt-secondary-text)',
          backgroundColor: 'color-mix(in srgb, var(--wt-app-bg) 95%, black)',
        }}
      >
        联系人
      </div>
      {contacts.map((c) => (
        <div
          key={c.name}
          className="flex items-center gap-3 px-4 py-2.5"
          style={{ backgroundColor: 'var(--wt-app-bg)' }}
        >
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base"
            style={{ backgroundColor: 'var(--wt-surface)' }}
          >
            {c.avatar}
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[15px] font-medium" style={{ color: 'var(--wt-primary-text)' }}>
              {c.name}
            </span>
            <span className="ml-2 text-[12px]" style={{ color: 'var(--wt-secondary-text)' }}>
              {c.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

function DiscoverPage() {
  const items = [
    { icon: '🔄', label: '朋友圈', desc: '和朋友分享生活点滴' },
    { icon: '📺', label: '视频号', desc: '关注你感兴趣的创作者' },
    { icon: '🔍', label: '扫一扫', desc: '扫描二维码' },
    { icon: '🤝', label: '摇一摇', desc: '认识新朋友' },
    { icon: '📍', label: '附近的人', desc: '查看附近的人' },
  ]
  return (
    <div className="flex-1 overflow-y-auto" style={{ backgroundColor: 'var(--wt-app-bg)' }}>
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-3 px-4 py-3 active:opacity-80"
          style={{ backgroundColor: 'var(--wt-app-bg)' }}
        >
          <span className="text-xl">{item.icon}</span>
          <div className="min-w-0 flex-1">
            <div className="text-[15px] font-medium" style={{ color: 'var(--wt-primary-text)' }}>
              {item.label}
            </div>
            <div className="text-[12px]" style={{ color: 'var(--wt-secondary-text)' }}>
              {item.desc}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function ProfilePage() {
  return (
    <div className="flex-1 overflow-y-auto" style={{ backgroundColor: 'var(--wt-app-bg)' }}>
      <div
        className="flex flex-col items-center px-4 py-8"
        style={{ backgroundColor: 'var(--wt-surface)' }}
      >
        <div
          className="mb-3 flex h-20 w-20 items-center justify-center rounded-full text-3xl"
          style={{ backgroundColor: 'var(--wt-surface)', border: '2px solid var(--wt-border)' }}
        >
          🦎
        </div>
        <div className="text-lg font-medium" style={{ color: 'var(--wt-primary-text)' }}>
          Chameleon 用户
        </div>
        <div className="mt-1 text-[13px]" style={{ color: 'var(--wt-secondary-text)' }}>
          微信号: chameleon_user
        </div>
      </div>
      <div className="mt-3 space-y-px px-4" style={{ backgroundColor: 'var(--wt-app-bg)' }}>
        {[
          { icon: '📷', label: '相册' },
          { icon: '💾', label: '收藏' },
          { icon: '💳', label: '钱包' },
          { icon: '😊', label: '表情' },
          { icon: '⚙️', label: '设置' },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 rounded-xl px-4 py-3.5 active:opacity-80"
            style={{ backgroundColor: 'var(--wt-surface)' }}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-[15px]" style={{ color: 'var(--wt-primary-text)' }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function TabBar({
  active,
  onTabChange,
}: {
  active: WeChatPage
  onTabChange: (p: WeChatPage) => void
}) {
  const tabs = [
    {
      label: '微信',
      page: 'chats' as WeChatPage,
      icon: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5-5 5 5M12 15V5',
    },
    {
      label: '通讯录',
      page: 'contacts' as WeChatPage,
      icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    },
    {
      label: '发现',
      page: 'discover' as WeChatPage,
      icon: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z',
    },
    {
      label: '我',
      page: 'profile' as WeChatPage,
      icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    },
  ]
  return (
    <div
      className="flex justify-around border-t px-2 py-1.5"
      style={{ borderColor: 'var(--wt-border)', backgroundColor: 'var(--wt-surface)' }}
    >
      {tabs.map((tab) => {
        const isActive = tab.page === active
        return (
          <button
            key={tab.label}
            type="button"
            onClick={() => onTabChange(tab.page)}
            className="flex flex-col items-center gap-0.5 px-4 py-1 text-[10px]"
            style={{ color: isActive ? 'var(--wt-accent)' : 'var(--wt-secondary-text)' }}
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path d={tab.icon} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}
