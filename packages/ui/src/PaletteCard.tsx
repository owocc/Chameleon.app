import type { Palette, PaletteRole } from '@chameleon/shared'
import { PALETTE_ROLES, PALETTE_ROLE_LABELS } from '@chameleon/shared'

interface PaletteCardProps {
  palette: Palette
  onClick?: () => void
}

export function PaletteCard({ palette, onClick }: PaletteCardProps) {
  return (
    <button
      type="button"
      className="group w-full cursor-pointer overflow-hidden rounded-2xl border border-[var(--chm-hairline)] bg-[var(--chm-surface-card)] p-0 text-left shadow-[0_18px_48px_rgb(12_10_9/0.06)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgb(12_10_9/0.1)]"
      onClick={onClick}
    >
      {/* 顶部：5 色位大色条 */}
      <div className="grid h-28 grid-cols-5">
        {PALETTE_ROLES.filter((role) => palette.roles[role]).map((role) => (
          <div
            key={role}
            className="min-w-0"
            style={{ backgroundColor: palette.roles[role] }}
            title={`${PALETTE_ROLE_LABELS[role as PaletteRole]} ${palette.roles[role]}`}
          />
        ))}
      </div>
      <div className="p-5">
        {/* 名称区域 */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-medium tracking-[0.01em] text-[var(--chm-ink)]">
              {palette.name}
            </h3>
            {palette.description && (
              <p className="mt-1 line-clamp-2 text-sm leading-6 text-[var(--chm-body)]">
                {palette.description}
              </p>
            )}
          </div>
          <span className="shrink-0 rounded-full bg-[var(--chm-surface-strong)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--chm-ink)]">
            5 roles
          </span>
        </div>
        {/* 5 色位色块 + 标签 + hex */}
        <div className="flex gap-2">
          {PALETTE_ROLES.filter((role) => palette.roles[role]).map((role) => (
            <div
              key={role}
              className="flex flex-1 flex-col items-center gap-1.5"
              title={`${PALETTE_ROLE_LABELS[role as PaletteRole]}: ${palette.roles[role]}`}
            >
              <span
                className="h-8 w-full rounded-lg border"
                style={{
                  backgroundColor: palette.roles[role],
                  borderColor: 'var(--chm-hairline)',
                }}
              />
              <span className="text-[10px] font-medium text-[var(--chm-muted)]">
                {PALETTE_ROLE_LABELS[role as PaletteRole]}
              </span>
              <span className="font-mono text-[10px] uppercase text-[var(--chm-muted-soft)]">
                {palette.roles[role]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </button>
  )
}
