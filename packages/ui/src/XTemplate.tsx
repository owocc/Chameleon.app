import { useState } from 'react'
import type { TemplateTokenMap, Palette } from '@chameleon/shared'
import { mapPaletteToTemplateTokens, getRolesForMode } from '@chameleon/shared'

interface XTemplateProps {
  palette: Palette
  mode?: 'light' | 'dark'
  /** 填满容器（用于移动端沉浸模式） */
  fill?: boolean
}

type XPage = 'home' | 'search' | 'notifications' | 'messages'

const MOCK_TWEETS = [
  {
    name: 'Figma',
    handle: '@figma',
    avatar: '🟣',
    content: 'Introducing AI-powered design suggestions. Let your palette do the talking. 🎨',
    time: '32m',
    replies: 24,
    retweets: 142,
    likes: '1.2K',
  },
  {
    name: 'Vercel',
    handle: '@vercel',
    avatar: '⬛',
    content:
      'Ship faster with instant previews for every branch. Your palette, your brand, deployed in seconds.',
    time: '2h',
    replies: 8,
    retweets: 56,
    likes: 389,
  },
  {
    name: 'Tailwind CSS',
    handle: '@tailwindcss',
    avatar: '🩵',
    content:
      'v4 is here. Zero-config, CSS-first, and ready for your next color system. 🎨\n\nCustom palettes just got a whole lot easier.',
    time: '5h',
    replies: 42,
    retweets: 287,
    likes: '2.8K',
  },
  {
    name: 'Chameleon',
    handle: '@chameleon_app',
    avatar: '🦎',
    content:
      'Your colors, any template. WeChat, X, and more — see how your palette feels in the real world.\n\nTry it now →',
    time: '8h',
    replies: 5,
    retweets: 23,
    likes: 156,
  },
]

function buildTokenCSS(tokens: TemplateTokenMap): React.CSSProperties {
  return {
    '--xt-app-bg': tokens.appBg,
    '--xt-nav-bg': tokens.navBg,
    '--xt-nav-text': tokens.navText,
    '--xt-surface': tokens.surface,
    '--xt-primary-text': tokens.primaryText,
    '--xt-secondary-text': tokens.secondaryText,
    '--xt-accent': tokens.accent,
    '--xt-border': tokens.border,
    '--xt-link': tokens.extra?.link ?? tokens.accent,
    '--xt-icon': tokens.extra?.icon ?? tokens.primaryText,
    '--xt-retweet': tokens.extra?.retweet ?? '#00ba7c',
    '--xt-like': tokens.extra?.like ?? tokens.accent,
  } as React.CSSProperties
}

function formatCount(n: number | string): string {
  if (typeof n === 'string') return n
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return String(n)
}

export function XTemplate({ palette, mode = 'light', fill = false }: XTemplateProps) {
  const roles = getRolesForMode(palette.roles, mode, palette.darkRoles)
  const tokens = mapPaletteToTemplateTokens(roles, 'x')
  const [page, setPage] = useState<XPage>('home')

  return (
    <div
      className={`mx-auto flex flex-col overflow-hidden ${
        fill ? 'h-full w-full rounded-none' : 'h-[700px] w-[375px] rounded-[28px] border shadow-xl'
      }`}
      style={{
        borderColor: 'var(--xt-border)',
        background: 'var(--xt-app-bg)',
        ...buildTokenCSS(tokens),
      }}
    >
      {/* 状态栏 */}
      <div
        className="flex items-center justify-between px-6 py-2 text-[11px] font-semibold"
        style={{ color: 'var(--xt-nav-text)', backgroundColor: 'var(--xt-nav-bg)' }}
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
        style={{ backgroundColor: 'var(--xt-nav-bg)' }}
      >
        <button
          type="button"
          className="rounded-full p-1.5"
          style={{ color: 'var(--xt-accent)' }}
          aria-label="个人资料"
        >
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
              transform="scale(0.85) translate(2,2)"
            />
          </svg>
        </button>
        <span className="text-lg font-bold" style={{ color: 'var(--xt-primary-text)' }}>
          {page === 'home'
            ? 'For you'
            : page === 'search'
              ? '搜索'
              : page === 'notifications'
                ? '通知'
                : '消息'}
        </span>
        <button
          type="button"
          className="rounded-full p-1.5"
          style={{ color: 'var(--xt-accent)' }}
          aria-label="设置"
        >
          <svg
            className="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx={12} cy={12} r={1} />
            <circle cx={12} cy={5} r={1} />
            <circle cx={12} cy={19} r={1} />
          </svg>
        </button>
      </div>

      {/* Tab 条（仅首页） */}
      {page === 'home' && (
        <div
          className="flex border-b text-sm font-medium"
          style={{ borderColor: 'var(--xt-border)', backgroundColor: 'var(--xt-nav-bg)' }}
        >
          {['For you', 'Following'].map((tab) => (
            <button
              key={tab}
              type="button"
              className="flex-1 py-3 text-center text-[15px] font-semibold"
              style={{
                color: tab === 'For you' ? 'var(--xt-primary-text)' : 'var(--xt-secondary-text)',
                borderBottom:
                  tab === 'For you' ? `2px solid var(--xt-accent)` : '2px solid transparent',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      {/* 内容 */}
      {page === 'home' && <HomePage />}
      {page === 'search' && <SearchPage />}
      {page === 'notifications' && <NotificationsPage />}
      {page === 'messages' && <MessagesPage />}

      {/* 底部 Tab */}
      <div
        className="flex border-t py-1"
        style={{ borderColor: 'var(--xt-border)', backgroundColor: 'var(--xt-surface)' }}
      >
        {[
          {
            page: 'home' as XPage,
            icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
          },
          { page: 'search' as XPage, icon: 'M3 3h18v18H3V3zm6 6h6M9 12h6M9 15h4' },
          {
            page: 'notifications' as XPage,
            icon: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 14v-4m0-4h.01',
          },
          {
            page: 'messages' as XPage,
            icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
          },
        ].map((tab) => (
          <button
            key={tab.page}
            type="button"
            onClick={() => setPage(tab.page)}
            className="flex flex-1 flex-col items-center py-1"
            style={{ color: tab.page === page ? 'var(--xt-accent)' : 'var(--xt-secondary-text)' }}
          >
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path d={tab.icon} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ── 子页面 ── */

function HomePage() {
  return (
    <div className="flex-1 overflow-y-auto" style={{ backgroundColor: 'var(--xt-app-bg)' }}>
      {MOCK_TWEETS.map((tweet, i) => (
        <div key={tweet.handle + tweet.time}>
          <div className="px-4 py-3" style={{ backgroundColor: 'var(--xt-app-bg)' }}>
            <div className="flex gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base"
                style={{ backgroundColor: 'var(--xt-surface)' }}
              >
                {tweet.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-1">
                  <span
                    className="truncate text-[15px] font-bold"
                    style={{ color: 'var(--xt-primary-text)' }}
                  >
                    {tweet.name}
                  </span>
                  <span
                    className="shrink-0 text-[13px]"
                    style={{ color: 'var(--xt-secondary-text)' }}
                  >
                    {tweet.handle} · {tweet.time}
                  </span>
                </div>
                <p
                  className="mt-1 whitespace-pre-line text-[15px] leading-5"
                  style={{ color: 'var(--xt-primary-text)' }}
                >
                  {tweet.content}
                </p>
                <div className="mt-3 flex justify-between" style={{ maxWidth: '85%' }}>
                  <ActionButton
                    icon={
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.8}
                      >
                        <path
                          d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    }
                    count={tweet.replies}
                    color="var(--xt-secondary-text)"
                  />
                  <ActionButton
                    icon={
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.8}
                      >
                        <path
                          d="M17 2v4M7 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    }
                    count={tweet.retweets}
                    color="var(--xt-retweet)"
                  />
                  <ActionButton
                    icon={
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.8}
                      >
                        <path
                          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    }
                    count={tweet.likes}
                    color="var(--xt-like)"
                  />
                  <ActionButton
                    icon={
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.8}
                      >
                        <path
                          d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7M16 6l-4-4-4 4M12 2v13"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    }
                    color="var(--xt-secondary-text)"
                  />
                </div>
              </div>
            </div>
          </div>
          {i < MOCK_TWEETS.length - 1 && (
            <div className="h-px" style={{ backgroundColor: 'var(--xt-border)' }} />
          )}
        </div>
      ))}
    </div>
  )
}

function SearchPage() {
  const trends = ['#设计系统', '#配色灵感', '#UI设计', '#暗色模式', '#Chameleon']
  return (
    <div className="flex-1 overflow-y-auto p-4" style={{ backgroundColor: 'var(--xt-app-bg)' }}>
      <div
        className="rounded-xl px-3 py-2.5 text-sm"
        style={{ backgroundColor: 'var(--xt-surface)', color: 'var(--xt-secondary-text)' }}
      >
        <svg
          className="mr-2 inline h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <circle cx={11} cy={11} r={7} />
          <path d="M16.5 16.5 21 21" strokeLinecap="round" />
        </svg>
        搜索话题或用户
      </div>
      <div className="mt-4 space-y-3">
        {trends.map((t) => (
          <div key={t} className="flex items-center gap-3 py-2">
            <span className="text-sm font-medium" style={{ color: 'var(--xt-primary-text)' }}>
              {t}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function NotificationsPage() {
  const items = [
    { icon: '❤️', text: 'Figma 赞了你的推文', time: '1h' },
    { icon: '🔁', text: 'Vercel 转发了你的推文', time: '3h' },
    { icon: '💬', text: 'Tailwind CSS 回复了你', time: '5h' },
  ]
  return (
    <div className="flex-1 overflow-y-auto" style={{ backgroundColor: 'var(--xt-app-bg)' }}>
      {items.map((item) => (
        <div
          key={item.text}
          className="flex items-center gap-3 px-4 py-3.5"
          style={{ backgroundColor: 'var(--xt-app-bg)' }}
        >
          <span className="text-lg">{item.icon}</span>
          <div className="min-w-0 flex-1">
            <span className="text-[14px]" style={{ color: 'var(--xt-primary-text)' }}>
              {item.text}
            </span>
            <span className="ml-2 text-[12px]" style={{ color: 'var(--xt-secondary-text)' }}>
              {item.time}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

function MessagesPage() {
  const msgs = [
    { name: 'Figma', text: 'Thanks for the feedback!', time: '1h' },
    { name: 'Vercel Team', text: 'Your preview is ready', time: '3h' },
  ]
  return (
    <div className="flex-1 overflow-y-auto" style={{ backgroundColor: 'var(--xt-app-bg)' }}>
      {msgs.map((msg) => (
        <div
          key={msg.name}
          className="flex items-center gap-3 px-4 py-3"
          style={{ backgroundColor: 'var(--xt-app-bg)' }}
        >
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full text-base"
            style={{ backgroundColor: 'var(--xt-surface)' }}
          >
            {msg.name[0]}
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[15px] font-medium" style={{ color: 'var(--xt-primary-text)' }}>
              {msg.name}
            </span>
            <span className="ml-2 text-[13px]" style={{ color: 'var(--xt-secondary-text)' }}>
              {msg.text}
            </span>
          </div>
          <span className="text-[11px]" style={{ color: 'var(--xt-secondary-text)' }}>
            {msg.time}
          </span>
        </div>
      ))}
    </div>
  )
}

function ActionButton({
  icon,
  count,
  color,
}: {
  icon: React.ReactNode
  count?: number | string
  color: string
}) {
  return (
    <button
      type="button"
      className="flex items-center gap-1 text-[13px] transition-opacity hover:opacity-70"
      style={{ color }}
    >
      {icon}
      {count != null && <span>{formatCount(count)}</span>}
    </button>
  )
}
