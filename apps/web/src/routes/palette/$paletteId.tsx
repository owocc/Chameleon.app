import { createFileRoute, useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/palette/$paletteId')({
  component: PaletteDetailPage,
})

function PaletteDetailPage() {
  const { paletteId } = Route.useParams()
  const navigate = useNavigate()

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">色板详情</h2>
      <p className="text-gray-500">编辑色板: {paletteId}</p>
      <button
        onClick={() => navigate({ to: '/' })}
        className="mt-4 text-sm text-indigo-500 hover:underline"
      >
        返回首页
      </button>
    </div>
  )
}
