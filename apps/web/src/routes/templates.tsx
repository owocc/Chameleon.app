import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/templates')({
  component: TemplatesPage,
})

function TemplatesPage() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">模板库</h2>
      <p className="text-gray-500">系统模板和应用模板列表即将到来...</p>
    </div>
  )
}
