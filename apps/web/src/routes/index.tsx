import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import type { Palette } from '@chameleon/shared'
import { PaletteCard } from '@chameleon/ui'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const [palettes] = useState<Palette[]>([])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">色板</h2>
        <Link
          to="/palette/new"
          className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm hover:bg-indigo-600 transition-colors"
        >
          新建色板
        </Link>
      </div>

      {palettes.length === 0 ? (
        <div className="text-center py-20">
          <h3 className="text-lg font-medium mb-2">欢迎使用 Chameleon</h3>
          <p className="text-gray-500 mb-6">创建你的第一个色板开始管理色彩</p>
          <Link
            to="/palette/new"
            className="px-6 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors"
          >
            创建色板
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {palettes.map(p => (
            <PaletteCard key={p.id} palette={p} />
          ))}
        </div>
      )}
    </div>
  )
}
