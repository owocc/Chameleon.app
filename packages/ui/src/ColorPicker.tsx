import type { HexColor } from '@chameleon/shared'

interface ColorPickerProps {
  value: HexColor
  onChange: (color: HexColor) => void
  label?: string
}

export function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value as HexColor)}
        className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200 dark:border-gray-700"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value as HexColor)}
        className="w-24 px-2 py-1 text-sm font-mono border border-gray-200 dark:border-gray-700 rounded bg-transparent"
      />
      {label && <span className="text-sm text-gray-500">{label}</span>}
    </div>
  )
}
