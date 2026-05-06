// ═══════════════════════════════════════════
// Chameleon Shared — 色板数据模型 & 颜色工具
// ═══════════════════════════════════════════

// ── 颜色基础 ──

export type HexColor = `#${string}`

// ── 色板角色 (5 语义色位, V1) ──

/** V1 色板的 5 个语义色位 */
export type PaletteRole = 'primary' | 'surface' | 'background' | 'text' | 'accent'

export const PALETTE_ROLES: PaletteRole[] = [
  'primary',
  'surface',
  'background',
  'text',
  'accent',
]

export const PALETTE_ROLE_LABELS: Record<PaletteRole, string> = {
  primary: '主色',
  surface: '表面色',
  background: '背景色',
  text: '文字色',
  accent: '强调色',
}

export const PALETTE_DEFAULT_COLORS: Record<PaletteRole, HexColor> = {
  primary: '#6366f1',
  surface: '#f8fafc',
  background: '#ffffff',
  text: '#1a1a2e',
  accent: '#f59e0b',
}

/** 5 色位 → 颜色值映射 */
export type PaletteRoleMap = Record<PaletteRole, HexColor>

// ── 色板数据模型 ──

export interface Palette {
  id: string
  name: string
  description?: string
  roles: PaletteRoleMap
  createdAt: string
  updatedAt: string
}

// ── 移动模板系统 ──

export type MobileTemplateId = 'wechat' | 'x'

export interface MobileTemplate {
  id: MobileTemplateId
  name: string
  description: string
  previewHint: string
}

export const BUILTIN_MOBILE_TEMPLATES: MobileTemplate[] = [
  {
    id: 'wechat',
    name: '微信',
    description: '聊天列表页 — 导航栏、搜索、聊天列表、底部栏',
    previewHint: '覆盖导航栏、列表项、头像、未读 badge、底部栏',
  },
  {
    id: 'x',
    name: 'X (Twitter)',
    description: '时间线 — 推文卡片、交互按钮、分割线',
    previewHint: '覆盖卡片文本密度、链接色、按钮态和分割线',
  },
]

// ── 模板 Token 映射 ──

/** 渲染模板时用到的 token 集合 */
export interface TemplateTokenMap {
  appBg: string
  navBg: string
  navText: string
  surface: string
  primaryText: string
  secondaryText: string
  accent: string
  border: string
  /** 模板特有 token（微信的气泡色等） */
  extra?: Record<string, string>
}

/**
 * 将色板（5 色位）映射为模板 token 值
 * @param roles 色板的 5 色位
 * @param templateId 目标模板 ID（影响 extra token）
 */
export function mapPaletteToTemplateTokens(
  roles: PaletteRoleMap,
  templateId?: MobileTemplateId,
): TemplateTokenMap {
  // 通用映射：secondaryText 从 text 派生（60% 透明度）
  const textRgb = hexToRgb(roles.text)
  const secondaryText = textRgb
    ? `rgba(${textRgb.r}, ${textRgb.g}, ${textRgb.b}, 0.6)`
    : roles.text

  // border 从 surface 派生（深色模式等场景）
  const border = roles.surface

  const tokens: TemplateTokenMap = {
    appBg: roles.background,
    navBg: roles.primary,
    navText: roles.text,
    surface: roles.surface,
    primaryText: roles.text,
    secondaryText,
    accent: roles.accent,
    border,
  }

  // 模板特有 token
  if (templateId === 'wechat') {
    tokens.extra = {
      // 发送气泡 = primary 较亮版本
      bubbleOutgoing: lighten(roles.primary, 30),
      // 接收气泡 = surface
      bubbleIncoming: roles.surface,
      badge: roles.accent,
    }
  }

  if (templateId === 'x') {
    tokens.extra = {
      link: roles.accent,
      icon: roles.text,
      retweet: '#00ba7c',
      like: roles.accent,
    }
  }

  return tokens
}

/** 辅助：将颜色变亮指定百分比 */
function lighten(hex: HexColor, percent: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  const factor = percent / 100
  const r = Math.min(255, Math.round(rgb.r + (255 - rgb.r) * factor))
  const g = Math.min(255, Math.round(rgb.g + (255 - rgb.g) * factor))
  const b = Math.min(255, Math.round(rgb.b + (255 - rgb.b) * factor))
  return `rgb(${r}, ${g}, ${b})`
}

// ── 空色板 ──

export function createEmptyPalette(name?: string): Palette {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    name: name || '新建色板',
    description: '',
    roles: { ...PALETTE_DEFAULT_COLORS },
    createdAt: now,
    updatedAt: now,
  }
}

// ── 颜色工具 ──

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace('#', '')
  if (!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(clean)) return null
  const full = clean.length === 3
    ? clean.split('').map(c => c + c).join('')
    : clean
  const num = parseInt(full, 16)
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 }
}

export function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
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

export function contrastRatio(hex1: string, hex2: string): number {
  const luminance = (hex: string): number => {
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

export function isAccessible(hex1: string, hex2: string, level: 'AA' | 'AAA' = 'AA', forText: 'normal' | 'large' = 'normal'): boolean {
  const ratio = contrastRatio(hex1, hex2)
  if (level === 'AAA') return ratio >= (forText === 'normal' ? 7 : 4.5)
  return ratio >= (forText === 'normal' ? 4.5 : 3)
}

// ── 配色辅助工具 ──

/** 将 HSL 转换回 HEX */
function hslToHex(h: number, s: number, l: number): string {
  s /= 100
  l /= 100
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

/** 获取颜色的补色（色环 180° 对面） */
export function complementaryColor(hex: string): string {
  const hsl = hexToHsl(hex)
  if (!hsl) return hex
  return hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l)
}

/** 获取分裂补色（主色 ±150°） */
export function splitComplementaryColors(hex: string): [string, string] {
  const hsl = hexToHsl(hex)
  if (!hsl) return ['#ffffff', '#000000']
  return [
    hslToHex((hsl.h + 150) % 360, hsl.s, hsl.l),
    hslToHex((hsl.h + 210) % 360, hsl.s, hsl.l),
  ]
}

/** 获取类似色（主色 ±30°） */
export function analogousColors(hex: string): [string, string, string] {
  const hsl = hexToHsl(hex)
  if (!hsl) return ['#ffffff', hex, '#000000']
  return [
    hslToHex((hsl.h + 330) % 360, hsl.s, hsl.l),
    hex,
    hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l),
  ]
}

/** 获取三元色（色环 120° 均分） */
export function triadicColors(hex: string): [string, string, string] {
  const hsl = hexToHsl(hex)
  if (!hsl) return ['#ffffff', hex, '#000000']
  return [
    hex,
    hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l),
    hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l),
  ]
}

/** 获取单色渐变色阶（同色相，不同饱和度/明度） */
export function monochromaticColors(hex: string, steps: number = 5): string[] {
  const hsl = hexToHsl(hex)
  if (!hsl) return [hex]
  const colors: string[] = []
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1)
    // 明度从 20% 到 80%，饱和度略微变化
    const l = Math.round(20 + t * 60)
    const s = Math.max(10, hsl.s - t * 20)
    colors.push(hslToHex(hsl.h, Math.round(s), l))
  }
  return colors
}
