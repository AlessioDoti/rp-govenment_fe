import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { nextTick } from 'vue'
import { useThemeStore } from '@/stores/theme.js'

describe('theme store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    document.body.removeAttribute('data-theme')
  })

  it('has default theme light', () => {
    const store = useThemeStore()
    expect(store.theme).toBe('light')
  })

  it('reads persisted theme from localStorage', () => {
    localStorage.setItem('theme', 'dark')
    const store = useThemeStore()
    expect(store.theme).toBe('dark')
  })

  it('toggle switches from light to dark', async () => {
    const store = useThemeStore()
    store.toggle()
    await nextTick()
    expect(store.theme).toBe('dark')
  })

  it('toggle switches from dark to light', async () => {
    localStorage.setItem('theme', 'dark')
    const store = useThemeStore()
    expect(store.theme).toBe('dark')
    store.toggle()
    await nextTick()
    expect(store.theme).toBe('light')
  })

  it('persists theme to localStorage on toggle', async () => {
    const store = useThemeStore()
    store.toggle()
    await nextTick()
    expect(localStorage.getItem('theme')).toBe('dark')
    store.toggle()
    await nextTick()
    expect(localStorage.getItem('theme')).toBe('light')
  })

  it('applies data-theme attribute to body when dark', async () => {
    const store = useThemeStore()
    store.toggle()
    await nextTick()
    expect(document.body.getAttribute('data-theme')).toBe('dark')
  })

  it('removes data-theme attribute when light', async () => {
    const store = useThemeStore()
    store.toggle()
    await nextTick()
    expect(document.body.getAttribute('data-theme')).toBe('dark')
    store.toggle()
    await nextTick()
    expect(document.body.getAttribute('data-theme')).toBeNull()
  })
})
