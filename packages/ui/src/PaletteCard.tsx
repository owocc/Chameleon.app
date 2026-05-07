import type { Palette, PaletteRole } from '@chameleon/shared'
import { PALETTE_ROLES, PALETTE_ROLE_LABELS, hasDarkMode } from '@chameleon/shared'

interface PaletteCardProps {
  palette: Palette
  onClick?: () => void
}

export function PaletteCard({ palette, onClick }: PaletteCardProps) {
  const showDark = hasDarkMode(palette)

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
      {/* 暗色色条 */}
      {showDark && palette.darkRoles && (
        <div className="grid h-10 grid-cols-5 border-t border-white/20">
          {PALETTE_ROLES.filter((role) => palette.darkRoles![role]).map((role) => (
            <div
              key={`dark-top-${role}`}
              className="min-w-0"
              style={{ backgroundColor: palette.darkRoles![role] }}
              title={`暗色 ${PALETTE_ROLE_LABELS[role as PaletteRole]} ${palette.darkRoles![role]}`}
            />
          ))}
        </div>
      )}
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
          <div className="flex shrink-0 items-center gap-1.5">
            {showDark && (
              <span className="rounded-full bg-[var(--chm-surface-strong)] px-2 py-1 text-[10px] font-semibold uppercase">
                🌙
              </span>
            )}
            <span className="rounded-full bg-[var(--chm-surface-strong)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--chm-ink)]">
              5 roles
            </span>
          </div>
        </div>
        {/* 亮色色点 */}
        <div className="flex gap-1.5">
          {PALETTE_ROLES.filter((role) => palette.roles[role]).map((role) => (
            <div
              key={role}
              className="h-5 w-full rounded-md border"
              style={{
                backgroundColor: palette.roles[role],
                borderColor: 'var(--chm-hairline)',
              }}
              title={`亮色 ${PALETTE_ROLE_LABELS[role as PaletteRole]} ${palette.roles[role]}`}
            />
          ))}
        </div>
        {/* 暗色色点 */}
        {showDark && palette.darkRoles && (
          <div className="mt-1.5 flex gap-1.5">
            {PALETTE_ROLES.filter((role) => palette.darkRoles![role]).map((role) => (
              <div
                key={`dark-${role}`}
                className="h-3 w-full rounded-sm border"
                style={{
                  backgroundColor: palette.darkRoles![role],
                  borderColor: 'rgba(255,255,255,0.15)',
                }}
                title={`暗色 ${PALETTE_ROLE_LABELS[role as PaletteRole]} ${palette.darkRoles![role]}`}
              />
            ))}
          </div>
        )}
      </div>
    </button>
  )
}
