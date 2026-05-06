import { createRootRoute, Outlet, Link } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold hover:opacity-80 transition-opacity">
            Chameleon
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              to="/templates"
              className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              activeProps={{ className: 'text-indigo-500 font-medium' }}
            >
              模板
            </Link>
            <Link
              to="/palette/new"
              className="px-3 py-1.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
            >
              新建色板
            </Link>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Outlet />
      </main>
      <TanStackRouterDevtools />
    </div>
  ),
})
