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
      <div className="grid h-32 grid-cols-5">
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
          <span className="rounded-full bg-[var(--chm-surface-strong)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--chm-ink)]">
            5 roles
          </span>
        </div>
        <div className="grid gap-2">
          {PALETTE_ROLES.filter((role) => palette.roles[role]).map((role) => (
            <div key={role} className="flex items-center justify-between gap-3">
              <span className="text-xs text-[var(--chm-muted)]">
                {PALETTE_ROLE_LABELS[role as PaletteRole]}
              </span>
              <span className="font-mono text-xs uppercase text-[var(--chm-muted-soft)]">
                {palette.roles[role]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </button>
  )
}
