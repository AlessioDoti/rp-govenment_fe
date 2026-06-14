import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useDialogStore } from '@/stores/dialog.js'

describe('dialog store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('has default state', () => {
    const store = useDialogStore()
    expect(store.open).toBe(false)
    expect(store.variant).toBe('alert')
    expect(store.title).toBe('')
    expect(store.message).toBe('')
    expect(store.defaultValue).toBe('')
    expect(store.employeeOptions).toEqual([])
    expect(store.activityName).toBe('')
    expect(store.categoryName).toBe('')
    expect(store.categories).toEqual([])
  })

  it('openDialog sets all dialog state and opens it', () => {
    const store = useDialogStore()
    const resolveFn = vi.fn()
    store.openDialog({
      variant: 'confirm',
      title: 'Conferma',
      message: 'Sei sicuro?',
      defaultValue: 'yes',
      employeeOptions: ['a', 'b'],
      activityName: 'Test Activity',
      categoryName: 'Test Category',
      categories: [{ id: 1, name: 'Cat' }],
      resolve: resolveFn
    })
    expect(store.open).toBe(true)
    expect(store.variant).toBe('confirm')
    expect(store.title).toBe('Conferma')
    expect(store.message).toBe('Sei sicuro?')
    expect(store.defaultValue).toBe('yes')
    expect(store.employeeOptions).toEqual(['a', 'b'])
    expect(store.activityName).toBe('Test Activity')
    expect(store.categoryName).toBe('Test Category')
    expect(store.categories).toEqual([{ id: 1, name: 'Cat' }])
  })

  it('openDialog sets defaults for missing fields', () => {
    const store = useDialogStore()
    store.openDialog({
      variant: 'alert',
      title: 'Alert',
      resolve: vi.fn()
    })
    expect(store.message).toBe('')
    expect(store.defaultValue).toBe('')
    expect(store.employeeOptions).toEqual([])
    expect(store.activityName).toBe('')
    expect(store.categoryName).toBe('')
    expect(store.categories).toEqual([])
  })

  it('resolve calls the resolver and closes dialog', () => {
    const store = useDialogStore()
    const resolveFn = vi.fn()
    store.openDialog({ variant: 'alert', title: 'Test', resolve: resolveFn })
    expect(store.open).toBe(true)
    store.resolve('some-value')
    expect(store.open).toBe(false)
    expect(resolveFn).toHaveBeenCalledWith('some-value')
  })

  it('resolve sets resolver to null after calling', () => {
    const store = useDialogStore()
    const resolveFn = vi.fn()
    store.openDialog({ variant: 'alert', title: 'Test', resolve: resolveFn })
    store.resolve('value')
    store.resolve('again')
    expect(resolveFn).toHaveBeenCalledTimes(1)
  })

  it('cancel resolves with null and closes dialog', () => {
    const store = useDialogStore()
    const resolveFn = vi.fn()
    store.openDialog({ variant: 'confirm', title: 'Test', resolve: resolveFn })
    store.cancel()
    expect(store.open).toBe(false)
    expect(resolveFn).toHaveBeenCalledWith(null)
  })

  it('resolve and cancel handle missing resolver gracefully', () => {
    const store = useDialogStore()
    store.open = true
    expect(() => store.resolve('value')).not.toThrow()
    expect(() => store.cancel()).not.toThrow()
  })
})
