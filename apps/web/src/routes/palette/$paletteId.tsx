import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import type { HexColor, Palette, PaletteRole } from '@chameleon/shared'
import {
  analogousColors,
  complementaryColor,
  createEmptyPalette,
  hasDarkMode,
  monochromaticColors,
  PALETTE_DARK_DEFAULT_COLORS,
  PALETTE_ROLE_LABELS,
  PALETTE_ROLES,
  splitComplementaryColors,
  triadicColors,
} from '@chameleon/shared'

export const Route = createFileRoute('/palette/$paletteId')({
  component: EditPalettePage,
})

const STORAGE_KEY = 'chameleon:palettes'

interface CandidateGroup {
  id: string
  title: string
  description: string
  colors: string[]
}

function EditPalettePage() {
  const { paletteId } = Route.useParams()
  const navigate = useNavigate()

  const [palette, setPalette] = useState<Palette>(() => {
    const stored = readStoredPalettes()
    const found = stored.find((p) => p.id === paletteId)
    return found ?? createEmptyPalette()
  })
  const [baseColor, setBaseColor] = useState<HexColor>(palette.roles.primary)
  const [darkBaseColor, setDarkBaseColor] = useState<HexColor>(
    palette.darkRoles?.primary ?? PALETTE_DARK_DEFAULT_COLORS.primary,
  )
  const [selectedColor, setSelectedColor] = useState<HexColor | null>(null)
  const [editingMode, setEditingMode] = useState<'light' | 'dark'>('light')
  const [darkEnabled, setDarkEnabled] = useState(hasDarkMode(palette))

  // current base color depends on editing mode
  const currentBaseColor = editingMode === 'light' ? baseColor : darkBaseColor

  const candidateGroups = useMemo<CandidateGroup[]>(
    () => [
      {
        id: 'complementary',
        title: '补色',
        description: '色环对侧的强对比，适合强调动作。',
        colors: [complementaryColor(currentBaseColor)],
      },
      {
        id: 'split-complementary',
        title: '分裂补色',
        description: '保留对比，但比补色更柔和。',
        colors: splitComplementaryColors(currentBaseColor),
      },
      {
        id: 'analogous',
        title: '类似色',
        description: '相邻色相，适合做自然过渡。',
        colors: analogousColors(currentBaseColor),
      },
      {
        id: 'triadic',
        title: '三元色',
        description: '色环均分，适合更活跃的组合。',
        colors: triadicColors(currentBaseColor),
      },
      {
        id: 'monochromatic',
        title: '单色阶',
        description: '同色相明度阶梯，适合背景和表面。',
        colors: monochromaticColors(currentBaseColor, 5),
      },
    ],
    [currentBaseColor],
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
    if (editingMode === 'light') {
      setBaseColor(color)
    } else {
      setDarkBaseColor(color)
    }
    if (editingMode === 'light') {
      updateRole('primary', color)
    } else {
      updateDarkRole('primary', color)
    }
  }

  function applyCandidate(role: PaletteRole) {
    if (!selectedColor) return
    if (editingMode === 'dark') {
      updateDarkRole(role, selectedColor)
    } else {
      updateRole(role, selectedColor)
    }
    setSelectedColor(null)
  }

  function updateDarkRole(role: PaletteRole, color: HexColor) {
    setPalette((current) => ({
      ...current,
      darkRoles: {
        ...(current.darkRoles ?? { ...PALETTE_DARK_DEFAULT_COLORS }),
        [role]: color,
      },
      updatedAt: new Date().toISOString(),
    }))
  }

  function initDarkRoles() {
    setPalette((current) => ({
      ...current,
      darkRoles: { ...PALETTE_DARK_DEFAULT_COLORS },
      updatedAt: new Date().toISOString(),
    }))
    setDarkEnabled(true)
  }

  function removeDarkRoles() {
    setPalette((current) => ({
      ...current,
      darkRoles: undefined,
      updatedAt: new Date().toISOString(),
    }))
    setDarkEnabled(false)
  }

  function savePalette() {
    const updated: Palette = {
      ...palette,
      name: palette.name.trim() || '未命名色板',
      updatedAt: new Date().toISOString(),
    }
    const all = readStoredPalettes()
    const index = all.findIndex((p) => p.id === paletteId)
    if (index !== -1) {
      all[index] = updated
    } else {
      all.unshift(updated)
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
    void navigate({ to: '/' })
  }

  // 如果找不到对应色板，显示错误状态
  if (!palette.id || !readStoredPalettes().find((p) => p.id === paletteId)) {
    return (
      <div className="rounded-[24px] border border-dashed border-[var(--chm-hairline-strong)] bg-[var(--chm-canvas-soft)] px-6 py-20 text-center">
        <h3 className="font-serif text-3xl font-light text-[var(--chm-ink)]">色板未找到</h3>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[var(--chm-body)]">
          该色板可能已被删除或不存在。
        </p>
        <button
          type="button"
          onClick={() => navigate({ to: '/' })}
          className="mt-8 inline-flex rounded-full bg-[var(--chm-primary)] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--chm-primary-active)]"
        >
          返回首页
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl pb-28">
      <div className="mb-8 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate({ to: '/' })}
            className="min-h-10 rounded-full border border-[var(--chm-hairline)] px-4 text-sm font-medium text-[var(--chm-ink)] active:bg-[var(--chm-surface-strong)]"
          >
            返回
          </button>
          <button
            type="button"
            onClick={() =>
              navigate({ to: '/preview', search: { paletteId, templateId: 'wechat' } })
            }
            className="min-h-10 rounded-full border border-[var(--chm-hairline)] px-4 text-sm font-medium text-[var(--chm-ink)] active:bg-[var(--chm-surface-strong)]"
          >
            预览
          </button>
        </div>
        <button
          type="button"
          onClick={savePalette}
          className="min-h-10 rounded-full bg-[var(--chm-primary)] px-6 text-sm font-medium text-white active:bg-[var(--chm-primary-active)]"
        >
          保存色板
        </button>
      </div>

      {/* 标题 + 色条 */}
      <section className="mb-8 overflow-hidden rounded-[24px] border border-[var(--chm-hairline)] bg-[var(--chm-surface-card)] shadow-[0_22px_70px_rgb(12_10_9/0.07)]">
        <div className="relative overflow-hidden px-6 py-8 sm:px-8">
          <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-[var(--chm-gradient-lavender)] opacity-55 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-12 h-52 w-52 rounded-full bg-[var(--chm-gradient-sky)] opacity-45 blur-3xl" />
          <div className="relative max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--chm-muted)]">
              Edit palette
            </p>
            <input
              value={palette.name}
              onChange={(event) => updatePaletteName(event.target.value)}
              className="w-full bg-transparent font-serif text-4xl font-light leading-tight tracking-normal text-[var(--chm-ink)] outline-none sm:text-5xl"
              placeholder="给这套颜色起个名字"
            />
            <p className="mt-4 max-w-xl text-sm leading-6 text-[var(--chm-body)]">
              调整主色或微调每个角色的颜色值。
            </p>
          </div>
        </div>
        <div className="grid grid-cols-5 border-t border-[var(--chm-hairline)]">
          {PALETTE_ROLES.map((role) => (
            <div
              key={role}
              className="min-h-24 p-3"
              style={{ backgroundColor: palette.roles[role] }}
            >
              <span className="rounded-full bg-white/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--chm-ink)] shadow-sm">
                {role}
              </span>
            </div>
          ))}
        </div>
        {/* 暗色色条（如果已开启） */}
        {darkEnabled && palette.darkRoles && (
          <div className="grid grid-cols-5 border-t border-[var(--chm-hairline)]">
            {PALETTE_ROLES.map((role) => (
              <div
                key={role}
                className="min-h-16 p-2"
                style={{ backgroundColor: palette.darkRoles![role] }}
              >
                <span className="rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-white shadow-sm">
                  dark
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 亮/暗模式切换 Tab */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-1 rounded-full border border-[var(--chm-hairline)] bg-[var(--chm-surface-strong)] p-1">
          <button
            type="button"
            onClick={() => setEditingMode('light')}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
              editingMode === 'light'
                ? 'bg-white text-[var(--chm-ink)] shadow-sm'
                : 'text-[var(--chm-muted)] hover:text-[var(--chm-ink)]'
            }`}
          >
            ☀️ 亮色
          </button>
          <button
            type="button"
            onClick={() => setEditingMode('dark')}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
              editingMode === 'dark'
                ? 'bg-white text-[var(--chm-ink)] shadow-sm'
                : 'text-[var(--chm-muted)] hover:text-[var(--chm-ink)]'
            }`}
          >
            🌙 暗色
          </button>
        </div>
        {!darkEnabled ? (
          <button
            type="button"
            onClick={initDarkRoles}
            className="rounded-full border border-dashed border-[var(--chm-hairline-strong)] px-4 py-2 text-sm text-[var(--chm-muted)] hover:text-[var(--chm-ink)]"
          >
            + 添加暗色模式
          </button>
        ) : (
          <button
            type="button"
            onClick={removeDarkRoles}
            className="rounded-full border border-[var(--chm-hairline)] px-4 py-2 text-sm text-[var(--chm-muted)] hover:text-red-500"
          >
            移除暗色
          </button>
        )}
      </div>

      {/* 主编辑器 */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          {/* 主色 */}
          <section className="rounded-[24px] border border-[var(--chm-hairline)] bg-[var(--chm-surface-card)] p-5 shadow-[0_18px_48px_rgb(12_10_9/0.05)] sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-medium tracking-[0.01em]">主色</h2>
                <p className="mt-1 text-sm leading-6 text-[var(--chm-body)]">
                  所有辅助方案都会跟随主色实时更新。
                </p>
              </div>
              <div className="rounded-full bg-[var(--chm-surface-strong)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--chm-ink)]">
                Primary
              </div>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={currentBaseColor}
                onChange={(event) => updateBaseColor(event.target.value as HexColor)}
                className="h-16 w-16 rounded-2xl border border-[var(--chm-hairline)] bg-transparent p-1"
                aria-label="选择主色"
              />
              <input
                value={currentBaseColor}
                onChange={(event) => {
                  const next = event.target.value
                  if (isHexColor(next)) updateBaseColor(next)
                }}
                className="min-h-12 flex-1 rounded-lg border border-[var(--chm-hairline)] bg-[var(--chm-canvas-soft)] px-4 font-mono text-sm uppercase text-[var(--chm-ink)] outline-none focus:border-[var(--chm-primary)]"
                aria-label="主色 HEX"
              />
            </div>
          </section>

          {/* 辅助配色 */}
          <section>
            <div className="mb-4">
              <h2 className="text-xl font-medium tracking-[0.01em]">辅助配色</h2>
              <p className="mt-1 text-sm leading-6 text-[var(--chm-body)]">
                点击任意候选色，再选择要应用到的色板角色。
              </p>
            </div>
            <div className="space-y-4">
              {candidateGroups.map((group) => (
                <div
                  key={group.id}
                  className="rounded-[24px] border border-[var(--chm-hairline)] bg-[var(--chm-surface-card)] p-5 shadow-[0_18px_48px_rgb(12_10_9/0.05)]"
                >
                  <div className="mb-4">
                    <h3 className="text-lg font-medium tracking-[0.01em]">{group.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-[var(--chm-body)]">
                      {group.description}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                    {group.colors.map((color) => (
                      <button
                        key={`${group.id}-${color}`}
                        type="button"
                        onClick={() => setSelectedColor(color as HexColor)}
                        className="group overflow-hidden rounded-xl border border-[var(--chm-hairline)] bg-[var(--chm-canvas-soft)] p-2 text-left transition active:scale-[0.98]"
                        aria-label={`应用候选色 ${color}`}
                      >
                        <span
                          className="block h-20 rounded-lg border border-black/10"
                          style={{ backgroundColor: color }}
                        />
                        <span className="mt-2 block font-mono text-xs uppercase text-[var(--chm-muted)]">
                          {color}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* 右侧：色板角色 */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[24px] border border-[var(--chm-hairline)] bg-[var(--chm-surface-card)] p-5 shadow-[0_18px_48px_rgb(12_10_9/0.05)]">
            <h2 className="text-xl font-medium tracking-[0.01em]">
              {editingMode === 'light' ? '☀️ 亮色角色' : '🌙 暗色角色'}
            </h2>
            <p className="mt-1 text-sm leading-6 text-[var(--chm-body)]">
              {editingMode === 'light'
                ? '每个角色都可以手动微调，也可以从候选色一键填入。'
                : '配置暗色模式下的颜色值，留空则跟随亮色。'}
            </p>
            <div className="mt-5 space-y-3">
              {editingMode === 'light'
                ? PALETTE_ROLES.map((role) => (
                    <RoleColorField
                      key={role}
                      role={role}
                      value={palette.roles[role]}
                      onChange={(color) => updateRole(role, color)}
                    />
                  ))
                : PALETTE_ROLES.map((role) => (
                    <RoleColorField
                      key={role}
                      role={role}
                      value={palette.darkRoles?.[role] ?? PALETTE_DARK_DEFAULT_COLORS[role]}
                      onChange={(color) => updateDarkRole(role, color)}
                    />
                  ))}
            </div>
          </div>
        </aside>
      </div>

      {/* 底部 Sheet */}
      {selectedColor && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/35 px-3 pb-3 backdrop-blur-sm"
          onClick={() => setSelectedColor(null)}
        >
          <div
            className="mx-auto w-full max-w-md rounded-[24px] bg-[var(--chm-surface-card)] p-5 shadow-[0_28px_80px_rgb(12_10_9/0.25)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-center gap-4">
              <div
                className="h-14 w-14 rounded-xl border border-[var(--chm-hairline)]"
                style={{ backgroundColor: selectedColor }}
              />
              <div>
                <p className="text-sm text-[var(--chm-muted)]">应用候选色</p>
                <p className="font-mono text-xl font-medium uppercase text-[var(--chm-ink)]">
                  {selectedColor}
                </p>
              </div>
            </div>
            <div className="grid gap-2">
              {PALETTE_ROLES.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => applyCandidate(role)}
                  className="flex min-h-12 items-center justify-between rounded-xl bg-[var(--chm-surface-strong)] px-4 text-left font-medium text-[var(--chm-ink)] active:bg-[var(--chm-hairline)]"
                >
                  <span>{PALETTE_ROLE_LABELS[role]}</span>
                  <span className="font-mono text-xs uppercase text-[var(--chm-muted)]">
                    {role}
                  </span>
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
    <div className="rounded-2xl border border-[var(--chm-hairline)] bg-[var(--chm-canvas-soft)] p-3">
      <div className="mb-3 flex items-center gap-3">
        <div
          className="h-11 w-11 rounded-lg border border-black/10"
          style={{ backgroundColor: value }}
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-[var(--chm-ink)]">{PALETTE_ROLE_LABELS[role]}</p>
          <p className="font-mono text-[11px] uppercase text-[var(--chm-muted)]">{role}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value as HexColor)}
          className="h-10 w-11 rounded-lg border border-[var(--chm-hairline)] bg-transparent p-1"
          aria-label={`选择${PALETTE_ROLE_LABELS[role]}`}
        />
        <input
          value={value}
          onChange={(event) => {
            const next = event.target.value
            if (isHexColor(next)) onChange(next)
          }}
          className="min-h-10 min-w-0 flex-1 rounded-lg border border-[var(--chm-hairline)] bg-white px-3 font-mono text-xs uppercase text-[var(--chm-ink)] outline-none focus:border-[var(--chm-primary)]"
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
