import { describe, it, expect } from 'vitest'
import { roleDisplay, formatCurrency, categoryNameOf } from '@/utils/format.js'

describe('roleDisplay', () => {
  it('returns mapped label for known roles', () => {
    expect(roleDisplay('ADMIN')).toBe('Admin Governo')
    expect(roleDisplay('GOVERNMENT')).toBe('Membro del Governo')
    expect(roleDisplay('ACTIVITY_MANAGER')).toBe('Gestore Attività')
    expect(roleDisplay('CITIZEN')).toBe('Cittadino')
  })

  it('returns the role itself for unknown roles', () => {
    expect(roleDisplay('UNKNOWN')).toBe('UNKNOWN')
  })

  it('handles null or undefined gracefully', () => {
    expect(roleDisplay(null)).toBe(null)
    expect(roleDisplay(undefined)).toBe(undefined)
  })
})

describe('formatCurrency', () => {
  it('formats a number as EUR currency', () => {
    const result = formatCurrency(1000)
    expect(result).toContain('€')
    expect(typeof result).toBe('string')
  })

  it('formats zero', () => {
    const result = formatCurrency(0)
    expect(result).toContain('0')
  })

  it('returns em-dash for non-number values', () => {
    expect(formatCurrency(null)).toBe('—')
    expect(formatCurrency(undefined)).toBe('—')
    expect(formatCurrency('abc')).toBe('—')
    expect(formatCurrency(NaN)).toBe('—')
  })
})

describe('categoryNameOf', () => {
  const categories = [
    { id: 1, name: 'Commercio' },
    { id: 2, name: 'Servizi' }
  ]

  it('returns matching category name', () => {
    expect(categoryNameOf(1, categories)).toBe('Commercio')
    expect(categoryNameOf(2, categories)).toBe('Servizi')
  })

  it('returns the id if no match is found', () => {
    expect(categoryNameOf(999, categories)).toBe(999)
  })

  it('handles empty categories array', () => {
    expect(categoryNameOf(1, [])).toBe(1)
  })


})
