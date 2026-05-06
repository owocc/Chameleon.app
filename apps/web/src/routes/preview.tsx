import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'

const previewSearchSchema = z.object({
  paletteId: z.string().optional(),
  templateId: z.string().optional(),
})

export const Route = createFileRoute('/preview')({
  validateSearch: previewSearchSchema,
  component: PreviewPage,
})

function PreviewPage() {
  const search = Route.useSearch()
  const navigate = useNavigate()

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">模板预览</h2>
      {search.paletteId ? (
        <p className="text-gray-500">
          预览色板 <strong>{search.paletteId}</strong> 在模板
          {search.templateId ? <strong> {search.templateId}</strong> : ' (未选择模板)'}
          上的效果
        </p>
      ) : (
        <p className="text-gray-500">选择一个色板和模板来预览效果</p>
      )}
      <button
        onClick={() => navigate({ to: '/' })}
        className="mt-4 text-sm text-indigo-500 hover:underline"
      >
        返回首页
      </button>
    </div>
  )
}
