import { describe, it, expect } from 'vitest'
import {
  hexToRgb,
  contrastRatio,
  isAccessible,
  mapPaletteToTemplateTokens,
  createEmptyPalette,
  complementaryColor,
  splitComplementaryColors,
} from './index'
import type { PaletteRoleMap } from './index'

describe('hexToRgb', () => {
  it('converts hex to rgb', () => {
    expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 })
    expect(hexToRgb('#00ff00')).toEqual({ r: 0, g: 255, b: 0 })
    expect(hexToRgb('#0000ff')).toEqual({ r: 0, g: 0, b: 255 })
  })

  it('handles shorthand hex', () => {
    expect(hexToRgb('#f00')).toEqual({ r: 255, g: 0, b: 0 })
  })

  it('returns null for invalid hex', () => {
    expect(hexToRgb('#zzz')).toBeNull()
  })
})

describe('contrastRatio', () => {
  it('calculates WCAG contrast ratio', () => {
    const ratio = contrastRatio('#000000', '#ffffff')
    expect(ratio).toBeCloseTo(21, 0)
  })

  it('returns 1 for same colors', () => {
    const ratio = contrastRatio('#ff0000', '#ff0000')
    expect(ratio).toBeCloseTo(1, 0)
  })
})

describe('isAccessible', () => {
  it('passes AA for black on white', () => {
    expect(isAccessible('#000000', '#ffffff', 'AA')).toBe(true)
  })

  it('fails AAA for gray on white', () => {
    expect(isAccessible('#999999', '#ffffff', 'AAA')).toBe(false)
  })
})

describe('createEmptyPalette', () => {
  it('creates palette with 5 roles', () => {
    const p = createEmptyPalette('测试色板')
    expect(p.name).toBe('测试色板')
    expect(Object.keys(p.roles).length).toBe(5)
    expect(p.roles.primary).toBe('#6366f1')
    expect(p.roles.background).toBe('#ffffff')
  })
})

describe('mapPaletteToTemplateTokens', () => {
  const roles: PaletteRoleMap = {
    primary: '#6366f1',
    surface: '#f8fafc',
    background: '#ffffff',
    text: '#1a1a2e',
    accent: '#f59e0b',
  }

  it('maps basic tokens correctly', () => {
    const tokens = mapPaletteToTemplateTokens(roles)
    expect(tokens.appBg).toBe('#ffffff')
    expect(tokens.navBg).toBe('#6366f1')
    expect(tokens.surface).toBe('#f8fafc')
    expect(tokens.accent).toBe('#f59e0b')
  })

  it('derives secondaryText from text with opacity', () => {
    const tokens = mapPaletteToTemplateTokens(roles)
    expect(tokens.secondaryText).toBe('rgba(26, 26, 46, 0.6)')
  })

  it('adds wechat extra tokens', () => {
    const tokens = mapPaletteToTemplateTokens(roles, 'wechat')
    expect(tokens.extra).toBeDefined()
    expect(tokens.extra!.badge).toBe('#f59e0b')
    expect(tokens.extra!.bubbleOutgoing).toBeDefined()
  })

  it('adds x extra tokens', () => {
    const tokens = mapPaletteToTemplateTokens(roles, 'x')
    expect(tokens.extra).toBeDefined()
    expect(tokens.extra!.link).toBe('#f59e0b')
  })
})

describe('complementaryColor', () => {
  it('returns complementary hue (+180deg)', () => {
    const comp = complementaryColor('#ff0000')
    expect(comp).toBe('#00ffff')
  })

  it('complement of blue is yellow', () => {
    const comp = complementaryColor('#0000ff')
    expect(comp).toBe('#ffff00')
  })
})

describe('splitComplementaryColors', () => {
  it('returns two split complementary colors', () => {
    const [c1, c2] = splitComplementaryColors('#ff0000')
    expect(c1).toBeDefined()
    expect(c2).toBeDefined()
    expect(c1).not.toBe(c2)
  })
})
