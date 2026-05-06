import type { Palette, PaletteRole } from '@chameleon/shared'
import { PALETTE_ROLES, PALETTE_ROLE_LABELS } from '@chameleon/shared'
import { ColorSwatch } from './ColorSwatch'

interface PaletteCardProps {
  palette: Palette
  onClick?: () => void
}

export function PaletteCard({ palette, onClick }: PaletteCardProps) {
  return (
    <div
      className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <h3 className="text-sm font-semibold mb-2">{palette.name}</h3>
      {palette.description && (
        <p className="text-xs text-gray-500 mb-3">{palette.description}</p>
      )}
      <div className="flex gap-2 flex-wrap">
        {PALETTE_ROLES.filter(r => palette.roles[r]).map(role => (
          <ColorSwatch
            key={role}
            color={palette.roles[role]}
            label={PALETTE_ROLE_LABELS[role as PaletteRole]}
            size="sm"
          />
        ))}
      </div>
    </div>
  )
}
