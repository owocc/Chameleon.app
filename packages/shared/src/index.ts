// Chameleon Shared Package
export type HexColor = `#${string}`

export interface PaletteColor {
  id: string
  label: string
  value: HexColor
}

export interface Palette {
  id: string
  name: string
  description?: string
  colors: PaletteColor[]
  createdAt: string
  updatedAt: string
}

export interface TemplateType {
  id: string
  name: string
  category: 'system' | 'app'
  description: string
}

export function hexToRgb(hex: HexColor): { r: number; g: number; b: number } | null {
  const clean = hex.replace('#', '')
  if (!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(clean)) return null
  const full = clean.length === 3
    ? clean.split('').map(c => c + c).join('')
    : clean
  const num = parseInt(full, 16)
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 }
}

export function hexToHsl(hex: HexColor): { h: number; s: number; l: number } | null {
  const rgb = hexToRgb(hex)
  if (!rgb) return null
  const { r, g, b } = rgb
  const r1 = r / 255, g1 = g / 255, b1 = b / 255
  const max = Math.max(r1, g1, b1), min = Math.min(r1, g1, b1)
  const l = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) }
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  switch (max) {
    case r1: h = ((g1 - b1) / d + (g1 < b1 ? 6 : 0)) / 6; break
    case g1: h = ((b1 - r1) / d + 2) / 6; break
    case b1: h = ((r1 - g1) / d + 4) / 6; break
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

export function contrastRatio(hex1: HexColor, hex2: HexColor): number {
  const luminance = (hex: HexColor): number => {
    const rgb = hexToRgb(hex)
    if (!rgb) return 0
    const [r, g, b] = [rgb.r / 255, rgb.g / 255, rgb.b / 255].map(c =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    )
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  const l1 = luminance(hex1), l2 = luminance(hex2)
  const lighter = Math.max(l1, l2), darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

export function isAccessible(hex1: HexColor, hex2: HexColor, level: 'AA' | 'AAA' = 'AA', forText: 'normal' | 'large' = 'normal'): boolean {
  const ratio = contrastRatio(hex1, hex2)
  if (level === 'AAA') return ratio >= (forText === 'normal' ? 7 : 4.5)
  return ratio >= (forText === 'normal' ? 4.5 : 3)
}
