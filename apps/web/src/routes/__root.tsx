import { createRootRoute, Outlet, Link } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { useTheme } from '@/stores/useTheme'
import { useSystemTheme } from '@/hooks/useSystemTheme'

export const Route = createRootRoute({
  component: RootLayout,
})

function ThemeToggle() {
  const { mode, toggle } = useTheme()
  return (
    <button
      type="button"
      onClick={toggle}
      className="rounded-full p-2 text-[var(--chm-muted)] transition-colors hover:bg-[var(--chm-surface-strong)] hover:text-[var(--chm-ink)]"
      aria-label={mode === 'light' ? '切换到暗色模式' : '切换到亮色模式'}
    >
      {mode === 'light' ? (
        <svg
          className="h-5 w-5"
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
          className="h-5 w-5"
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
    </button>
  )
}

function RootLayout() {
  useSystemTheme()

  return (
    <div className="min-h-screen text-[var(--chm-ink)]">
      <header className="sticky top-0 z-40 border-b border-[var(--chm-hairline)] bg-[var(--chm-canvas)]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="font-serif text-2xl font-light tracking-normal hover:opacity-75">
            Chameleon
          </Link>
          <nav className="flex items-center gap-1 text-[15px] font-medium">
            <ThemeToggle />
            <Link
              to="/templates"
              className="rounded-full px-4 py-2 text-[var(--chm-body)] transition-colors hover:bg-[var(--chm-surface-strong)] hover:text-[var(--chm-ink)]"
              activeProps={{ className: 'bg-[var(--chm-surface-strong)] text-[var(--chm-ink)]' }}
            >
              模板
            </Link>
            <Link
              to="/palette/new"
              className="rounded-full bg-[var(--chm-primary)] px-4 py-2 text-white transition-colors hover:bg-[var(--chm-primary-active)]"
            >
              新建色板
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
        <Outlet />
      </main>
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </div>
  )
}
