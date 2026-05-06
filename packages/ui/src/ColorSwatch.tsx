import type { HexColor } from '@chameleon/shared'

interface ColorSwatchProps {
  color: HexColor
  label?: string
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
}

const sizeMap = { sm: 'w-8 h-8', md: 'w-12 h-12', lg: 'w-16 h-16' }

export function ColorSwatch({ color, label, size = 'md', showValue = false }: ColorSwatchProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`${sizeMap[size]} rounded-lg border border-gray-200 dark:border-gray-700`}
        style={{ backgroundColor: color }}
        title={color}
      />
      {label && <span className="text-xs text-gray-500">{label}</span>}
      {showValue && <span className="text-xs font-mono text-gray-400">{color}</span>}
    </div>
  )
}
