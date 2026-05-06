import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import type { Palette } from '@chameleon/shared'
import { PaletteCard } from '@chameleon/ui'

export const Route = createFileRoute('/')({
  component: HomePage,
})

const STORAGE_KEY = 'chameleon:palettes'

function HomePage() {
  const [palettes, setPalettes] = useState<Palette[]>([])

  useEffect(() => {
    setPalettes(readStoredPalettes())
  }, [])

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-[24px] border border-[var(--chm-hairline)] bg-[var(--chm-surface-card)] p-6 shadow-[0_22px_70px_rgb(12_10_9/0.07)] sm:p-10">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[var(--chm-gradient-peach)] opacity-50 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-12 h-64 w-64 rounded-full bg-[var(--chm-gradient-mint)] opacity-45 blur-3xl" />
        <div className="relative max-w-2xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--chm-muted)]">
            Palette workspace
          </p>
          <h1 className="font-serif text-5xl font-light leading-[1.05] tracking-normal text-[var(--chm-ink)] sm:text-6xl">
            让颜色先被看见。
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 tracking-[0.01em] text-[var(--chm-body)]">
            创建色板、生成辅助配色，并把每一个色位沉淀成可复用的设计资产。
          </p>
        </div>
      </section>

      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-medium tracking-[0.01em]">色板</h2>
          <p className="mt-1 text-sm text-[var(--chm-muted)]">中性画布会让色卡成为视觉主角。</p>
        </div>
        <Link
          to="/palette/new"
          className="rounded-full bg-[var(--chm-primary)] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--chm-primary-active)]"
        >
          新建色板
        </Link>
      </div>

      {palettes.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-[var(--chm-hairline-strong,#d6d3d1)] bg-[var(--chm-canvas-soft)] px-6 py-16 text-center">
          <h3 className="font-serif text-3xl font-light text-[var(--chm-ink)]">还没有色板</h3>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[var(--chm-body)]">
            从一个主色开始，Chameleon 会帮你生成补色、类似色、三元色和单色阶。
          </p>
          <Link
            to="/palette/new"
            className="mt-8 inline-flex rounded-full bg-[var(--chm-primary)] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--chm-primary-active)]"
          >
            创建色板
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {palettes.map((p) => (
            <PaletteCard key={p.id} palette={p} />
          ))}
        </div>
      )}
    </div>
  )
}

function readStoredPalettes(): Palette[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
