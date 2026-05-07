import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import type { HexColor, Palette, PaletteRole } from '@chameleon/shared'
import {
  analogousColors,
  complementaryColor,
  createEmptyPalette,
  monochromaticColors,
  PALETTE_DARK_DEFAULT_COLORS,
  PALETTE_ROLE_LABELS,
  PALETTE_ROLES,
  splitComplementaryColors,
  triadicColors,
} from '@chameleon/shared'

export const Route = createFileRoute('/palette/new')({
  component: CreatePalettePage,
})

const STORAGE_KEY = 'chameleon:palettes'

type EditorMode = 'light' | 'dark'

interface CandidateGroup {
  id: string
  title: string
  description: string
  colors: string[]
}

function CreatePalettePage() {
  const navigate = useNavigate()
  const [palette, setPalette] = useState<Palette>(() => createEmptyPalette())
  const [editorMode, setEditorMode] = useState<EditorMode>('light')
  const [hasDarkMode, setHasDarkMode] = useState(false)
  const [baseColor, setBaseColor] = useState<HexColor>(palette.roles.primary)
  const [darkBaseColor, setDarkBaseColor] = useState<HexColor>(
    palette.darkRoles?.primary ?? PALETTE_DARK_DEFAULT_COLORS.primary,
  )
  const [selectedColor, setSelectedColor] = useState<HexColor | null>(null)

  // 当前正在编辑的角色映射
  const currentRoles =
    editorMode === 'light' ? palette.roles : (palette.darkRoles ?? PALETTE_DARK_DEFAULT_COLORS)
  const currentBaseColor = editorMode === 'light' ? baseColor : darkBaseColor

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
    setPalette((current) => {
      if (editorMode === 'light') {
        return {
          ...current,
          roles: { ...current.roles, [role]: color },
          updatedAt: new Date().toISOString(),
        }
      }
      // dark mode — 如果没有 darkRoles 则先初始化
      const dark = current.darkRoles ?? { ...PALETTE_DARK_DEFAULT_COLORS }
      return {
        ...current,
        darkRoles: { ...dark, [role]: color },
        updatedAt: new Date().toISOString(),
      }
    })
  }

  function updateBaseColor(color: HexColor) {
    if (editorMode === 'light') {
      setBaseColor(color)
    } else {
      setDarkBaseColor(color)
    }
    updateRole('primary', color)
  }

  function toggleHasDarkMode() {
    if (hasDarkMode) {
      // 关闭暗色模式 → 清除 darkRoles
      setPalette((current) => ({
        ...current,
        darkRoles: undefined,
        updatedAt: new Date().toISOString(),
      }))
      setHasDarkMode(false)
    } else {
      // 开启暗色模式 → 用默认值初始化
      setPalette((current) => ({
        ...current,
        darkRoles: { ...PALETTE_DARK_DEFAULT_COLORS },
        updatedAt: new Date().toISOString(),
      }))
      setHasDarkMode(true)
    }
  }

  function applyCandidate(role: PaletteRole) {
    if (!selectedColor) return
    updateRole(role, selectedColor)
    setSelectedColor(null)
  }

  function savePalette() {
    // 如果用户没启用暗色模式，确保 darkRoles 为 undefined
    const cleanPalette: Palette = {
      ...palette,
      name: palette.name.trim() || '未命名色板',
      darkRoles: hasDarkMode ? palette.darkRoles : undefined,
      updatedAt: new Date().toISOString(),
    }
    const existing = readStoredPalettes()
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([cleanPalette, ...existing]))
    void navigate({ to: '/' })
  }

  // 预览落点：保存后跳转预览
  const previewPaletteId = palette.id

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
              navigate({
                to: '/preview',
                search: { paletteId: previewPaletteId, templateId: 'wechat' },
              })
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

      <section className="mb-8 overflow-hidden rounded-[24px] border border-[var(--chm-hairline)] bg-[var(--chm-surface-card)] shadow-[0_22px_70px_rgb(12_10_9/0.07)]">
        <div className="relative overflow-hidden px-6 py-8 sm:px-8">
          <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-[var(--chm-gradient-lavender)] opacity-55 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-12 h-52 w-52 rounded-full bg-[var(--chm-gradient-sky)] opacity-45 blur-3xl" />
          <div className="relative max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--chm-muted)]">
              New palette
            </p>
            <input
              value={palette.name}
              onChange={(event) => updatePaletteName(event.target.value)}
              className="w-full bg-transparent font-serif text-4xl font-light leading-tight tracking-normal text-[var(--chm-ink)] outline-none sm:text-5xl"
              placeholder="给这套颜色起个名字"
            />
            <p className="mt-4 max-w-xl text-sm leading-6 text-[var(--chm-body)]">
              先选一个主色，再把生成的候选色沉淀到五个语义角色里。
            </p>
          </div>
        </div>

        {/* 亮/暗模式切换 Tabs */}
        <div className="flex items-center border-t border-[var(--chm-hairline)] px-4 pt-3 pb-2">
          <div className="flex gap-1 rounded-full bg-[var(--chm-surface-strong)] p-1">
            <button
              type="button"
              onClick={() => setEditorMode('light')}
              className="rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.06em] transition-all"
              style={{
                backgroundColor: editorMode === 'light' ? 'var(--chm-surface-card)' : 'transparent',
                color: editorMode === 'light' ? 'var(--chm-ink)' : 'var(--chm-muted)',
                boxShadow: editorMode === 'light' ? '0 1px 3px rgb(0 0 0 / 0.08)' : 'none',
              }}
            >
              ☀️ 亮色
            </button>
            <button
              type="button"
              onClick={() => setEditorMode('dark')}
              className="rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.06em] transition-all"
              style={{
                backgroundColor: editorMode === 'dark' ? 'var(--chm-surface-card)' : 'transparent',
                color: editorMode === 'dark' ? 'var(--chm-ink)' : 'var(--chm-muted)',
                boxShadow: editorMode === 'dark' ? '0 1px 3px rgb(0 0 0 / 0.08)' : 'none',
              }}
            >
              🌙 暗色
            </button>
          </div>

          {/* 暗色模式开关 */}
          <button
            type="button"
            onClick={toggleHasDarkMode}
            className="ml-auto flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
            style={{
              backgroundColor: hasDarkMode ? 'var(--chm-primary)' : 'var(--chm-surface-strong)',
              color: hasDarkMode ? 'var(--chm-on-primary)' : 'var(--chm-muted)',
            }}
          >
            {hasDarkMode ? '已启用暗色' : '开启暗色模式'}
          </button>
        </div>

        {/* 5 色位色条 */}
        <div className="grid grid-cols-5 border-t border-[var(--chm-hairline)]">
          {PALETTE_ROLES.map((role) => (
            <div
              key={role}
              className="min-h-24 p-3"
              style={{ backgroundColor: currentRoles[role] }}
            >
              <span className="rounded-full bg-white/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--chm-ink)] shadow-sm">
                {role}
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
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

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[24px] border border-[var(--chm-hairline)] bg-[var(--chm-surface-card)] p-5 shadow-[0_18px_48px_rgb(12_10_9/0.05)]">
            <h2 className="text-xl font-medium tracking-[0.01em]">色板角色</h2>
            <p className="mt-1 text-sm leading-6 text-[var(--chm-body)]">
              {editorMode === 'light' ? '编辑亮色模式的 5 个色位。' : '编辑暗色模式的 5 个色位。'}
            </p>
            <div className="mt-5 space-y-3">
              {PALETTE_ROLES.map((role) => (
                <RoleColorField
                  key={role}
                  role={role}
                  value={currentRoles[role]}
                  onChange={(color) => updateRole(role, color)}
                />
              ))}
            </div>
          </div>
        </aside>
      </div>

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
