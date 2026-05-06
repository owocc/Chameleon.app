import { createRootRoute, Outlet, Link } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen text-[var(--chm-ink)]">
      <header className="sticky top-0 z-40 border-b border-[var(--chm-hairline)] bg-[var(--chm-canvas)]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="font-serif text-2xl font-light tracking-normal hover:opacity-75">
            Chameleon
          </Link>
          <nav className="flex items-center gap-2 text-[15px] font-medium">
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
      <TanStackRouterDevtools />
    </div>
  ),
})
