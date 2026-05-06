import { describe, it, expect } from 'vitest'
import { hexToRgb, contrastRatio, isAccessible } from './index'

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
