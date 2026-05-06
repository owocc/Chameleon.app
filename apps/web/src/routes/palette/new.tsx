import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import type { HexColor, Palette, PaletteRole } from '@chameleon/shared'
import {
  analogousColors,
  complementaryColor,
  createEmptyPalette,
  monochromaticColors,
  PALETTE_ROLE_LABELS,
  PALETTE_ROLES,
  splitComplementaryColors,
  triadicColors,
} from '@chameleon/shared'

export const Route = createFileRoute('/palette/new')({
  component: CreatePalettePage,
})

const STORAGE_KEY = 'chameleon:palettes'

interface CandidateGroup {
  id: string
  title: string
  description: string
  colors: string[]
}

function CreatePalettePage() {
  const navigate = useNavigate()
  const [palette, setPalette] = useState<Palette>(() => createEmptyPalette())
  const [baseColor, setBaseColor] = useState<HexColor>(palette.roles.primary)
  const [selectedColor, setSelectedColor] = useState<HexColor | null>(null)

  const candidateGroups = useMemo<CandidateGroup[]>(
    () => [
      {
        id: 'complementary',
        title: '补色',
        description: '适合制造强对比和强调动作',
        colors: [complementaryColor(baseColor)],
      },
      {
        id: 'split-complementary',
        title: '分裂补色',
        description: '比补色柔和，适合做强调色组合',
        colors: splitComplementaryColors(baseColor),
      },
      {
        id: 'analogous',
        title: '类似色',
        description: '相邻色相，适合做自然过渡',
        colors: analogousColors(baseColor),
      },
      {
        id: 'triadic',
        title: '三元色',
        description: '色环均分，适合做活跃的多色方案',
        colors: triadicColors(baseColor),
      },
      {
        id: 'monochromatic',
        title: '单色阶',
        description: '同色相明度阶梯，适合表面和背景',
        colors: monochromaticColors(baseColor, 5),
      },
    ],
    [baseColor],
  )

  function updatePaletteName(name: string) {
    setPalette((current) => ({
      ...current,
      name,
      updatedAt: new Date().toISOString(),
    }))
  }

  function updateRole(role: PaletteRole, color: HexColor) {
    setPalette((current) => ({
      ...current,
      roles: {
        ...current.roles,
        [role]: color,
      },
      updatedAt: new Date().toISOString(),
    }))
  }

  function updateBaseColor(color: HexColor) {
    setBaseColor(color)
    updateRole('primary', color)
  }

  function applyCandidate(role: PaletteRole) {
    if (!selectedColor) return
    updateRole(role, selectedColor)
    setSelectedColor(null)
  }

  function savePalette() {
    const savedPalette: Palette = {
      ...palette,
      name: palette.name.trim() || '未命名色板',
      updatedAt: new Date().toISOString(),
    }
    const existing = readStoredPalettes()
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([savedPalette, ...existing]))
    void navigate({ to: '/' })
  }

  return (
    <div className="mx-auto max-w-md pb-28">
      <div className="mb-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate({ to: '/' })}
          className="min-h-11 rounded-full px-3 text-sm font-medium text-gray-500 active:bg-gray-100 dark:text-gray-400 dark:active:bg-gray-900"
        >
          返回
        </button>
        <button
          type="button"
          onClick={savePalette}
          className="min-h-11 rounded-full bg-gray-950 px-5 text-sm font-semibold text-white active:scale-[0.98] dark:bg-white dark:text-gray-950"
        >
          保存
        </button>
      </div>

      <section className="mb-6">
        <label className="mb-2 block text-sm font-medium text-gray-500 dark:text-gray-400">
          色板名称
        </label>
        <input
          value={palette.name}
          onChange={(event) => updatePaletteName(event.target.value)}
          className="min-h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-lg font-semibold outline-none transition focus:border-gray-950 dark:border-gray-800 dark:bg-gray-900 dark:focus:border-white"
          placeholder="给这套颜色起个名字"
        />
      </section>

      <section className="mb-6 overflow-hidden rounded-3xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div
          className="flex min-h-32 flex-col justify-end p-5"
          style={{
            background: `linear-gradient(135deg, ${palette.roles.primary}, ${palette.roles.accent})`,
          }}
        >
          <p className="text-sm font-medium text-white/75">主色驱动</p>
          <p className="mt-1 font-mono text-3xl font-semibold text-white">{baseColor}</p>
        </div>
        <div className="p-4">
          <label className="mb-3 block text-sm font-medium text-gray-500 dark:text-gray-400">
            选择主色
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={baseColor}
              onChange={(event) => updateBaseColor(event.target.value as HexColor)}
              className="h-12 w-14 rounded-2xl border border-gray-200 bg-transparent p-1 dark:border-gray-700"
              aria-label="选择主色"
            />
            <input
              value={baseColor}
              onChange={(event) => {
                const next = event.target.value
                if (isHexColor(next)) updateBaseColor(next)
              }}
              className="min-h-12 flex-1 rounded-2xl border border-gray-200 bg-gray-50 px-4 font-mono text-sm uppercase outline-none focus:border-gray-950 dark:border-gray-700 dark:bg-gray-950 dark:focus:border-white"
              aria-label="主色 HEX"
            />
          </div>
        </div>
      </section>

      <section className="mb-6">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">辅助配色</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              点击候选色后选择要填入的色位
            </p>
          </div>
        </div>
        <div className="space-y-3">
          {candidateGroups.map((group) => (
            <div
              key={group.id}
              className="rounded-3xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="mb-3">
                <h3 className="text-sm font-semibold">{group.title}</h3>
                <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
                  {group.description}
                </p>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {group.colors.map((color) => (
                  <button
                    key={`${group.id}-${color}`}
                    type="button"
                    onClick={() => setSelectedColor(color as HexColor)}
                    className="min-h-16 rounded-2xl border border-black/10 p-1 text-left active:scale-[0.97] dark:border-white/10"
                    style={{ backgroundColor: color }}
                    aria-label={`应用候选色 ${color}`}
                  >
                    <span className="block truncate rounded-full bg-white/85 px-1.5 py-0.5 text-[10px] font-medium text-gray-950 shadow-sm">
                      {color}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">色板角色</h2>
        <div className="space-y-3">
          {PALETTE_ROLES.map((role) => (
            <RoleColorField
              key={role}
              role={role}
              value={palette.roles[role]}
              onChange={(color) => updateRole(role, color)}
            />
          ))}
        </div>
      </section>

      {selectedColor && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/35 px-3 pb-3"
          onClick={() => setSelectedColor(null)}
        >
          <div
            className="w-full rounded-3xl bg-white p-4 shadow-2xl dark:bg-gray-950"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center gap-3">
              <div
                className="h-12 w-12 rounded-2xl border border-black/10 dark:border-white/10"
                style={{ backgroundColor: selectedColor }}
              />
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">应用候选色</p>
                <p className="font-mono text-lg font-semibold">{selectedColor}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {PALETTE_ROLES.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => applyCandidate(role)}
                  className="flex min-h-12 items-center justify-between rounded-2xl bg-gray-100 px-4 text-left font-medium active:bg-gray-200 dark:bg-gray-900 dark:active:bg-gray-800"
                >
                  <span>{PALETTE_ROLE_LABELS[role]}</span>
                  <span className="font-mono text-xs text-gray-500">{role}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function RoleColorField({
  role,
  value,
  onChange,
}: {
  role: PaletteRole
  value: HexColor
  onChange: (color: HexColor) => void
}) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-3 flex items-center gap-3">
        <div
          className="h-12 w-12 rounded-2xl border border-black/10 dark:border-white/10"
          style={{ backgroundColor: value }}
        />
        <div className="min-w-0 flex-1">
          <p className="font-medium">{PALETTE_ROLE_LABELS[role]}</p>
          <p className="font-mono text-xs text-gray-500">{role}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value as HexColor)}
          className="h-11 w-12 rounded-xl border border-gray-200 bg-transparent p-1 dark:border-gray-700"
          aria-label={`选择${PALETTE_ROLE_LABELS[role]}`}
        />
        <input
          value={value}
          onChange={(event) => {
            const next = event.target.value
            if (isHexColor(next)) onChange(next)
          }}
          className="min-h-11 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 font-mono text-sm uppercase outline-none focus:border-gray-950 dark:border-gray-700 dark:bg-gray-950 dark:focus:border-white"
          aria-label={`${PALETTE_ROLE_LABELS[role]} HEX`}
        />
      </div>
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

function isHexColor(value: string): value is HexColor {
  return /^#[0-9a-fA-F]{6}$/.test(value)
}
