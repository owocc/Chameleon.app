import { createFileRoute, useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/palette/new')({
  component: CreatePalettePage,
})

function CreatePalettePage() {
  const navigate = useNavigate()

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">新建色板</h2>
      <p className="text-gray-500">色板编辑器即将到来...</p>
      <button
        onClick={() => navigate({ to: '/' })}
        className="mt-4 text-sm text-indigo-500 hover:underline"
      >
        返回首页
      </button>
    </div>
  )
}
