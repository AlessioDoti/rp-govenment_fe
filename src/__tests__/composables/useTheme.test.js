import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTheme } from '@/composables/useTheme.js'

describe('useTheme', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    document.body.removeAttribute('data-theme')
  })

  it('returns theme, isDark, and toggle', () => {
    const theme = useTheme()
    expect(theme).toHaveProperty('theme')
    expect(theme).toHaveProperty('isDark')
    expect(theme).toHaveProperty('toggle')
  })

  it('isDark is false when theme is light', () => {
    const theme = useTheme()
    expect(theme.isDark.value).toBe(false)
  })

  it('isDark is true when theme is dark', () => {
    const theme = useTheme()
    theme.toggle()
    expect(theme.isDark.value).toBe(true)
  })

  it('toggle switches theme', () => {
    const theme = useTheme()
    expect(theme.theme.value).toBe('light')
    theme.toggle()
    expect(theme.theme.value).toBe('dark')
  })
})
