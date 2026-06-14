import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useDialog } from '@/composables/useDialog.js'

const mockStore = {
  openDialog: vi.fn()
}

vi.mock('@/stores/dialog.js', () => ({
  useDialogStore: () => mockStore
}))

describe('useDialog', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('exposes alert, confirm, prompt, addEmployee, removeEmployee, editActivity', () => {
    const dialog = useDialog()
    expect(typeof dialog.alert).toBe('function')
    expect(typeof dialog.confirm).toBe('function')
    expect(typeof dialog.prompt).toBe('function')
    expect(typeof dialog.addEmployee).toBe('function')
    expect(typeof dialog.removeEmployee).toBe('function')
    expect(typeof dialog.editActivity).toBe('function')
  })

  it('alert opens dialog with variant alert', async () => {
    const dialog = useDialog()
    const promise = dialog.alert('Title', 'Message')
    expect(mockStore.openDialog).toHaveBeenCalledWith({
      variant: 'alert',
      title: 'Title',
      message: 'Message',
      resolve: expect.any(Function)
    })
    const resolveFn = mockStore.openDialog.mock.calls[0][0].resolve
    resolveFn()
    await promise
  })

  it('confirm opens dialog with variant confirm', async () => {
    const dialog = useDialog()
    const promise = dialog.confirm('Title', 'Sure?')
    expect(mockStore.openDialog).toHaveBeenCalledWith({
      variant: 'confirm',
      title: 'Title',
      message: 'Sure?',
      resolve: expect.any(Function)
    })
    const resolveFn = mockStore.openDialog.mock.calls[0][0].resolve
    resolveFn(true)
    const result = await promise
    expect(result).toBe(true)
  })

  it('prompt opens dialog with variant prompt and defaultValue', async () => {
    const dialog = useDialog()
    const promise = dialog.prompt('Title', 'Enter value', 'default')
    expect(mockStore.openDialog).toHaveBeenCalledWith({
      variant: 'prompt',
      title: 'Title',
      message: 'Enter value',
      defaultValue: 'default',
      resolve: expect.any(Function)
    })
    const resolveFn = mockStore.openDialog.mock.calls[0][0].resolve
    resolveFn('my value')
    const result = await promise
    expect(result).toBe('my value')
  })

  it('prompt uses empty string as default defaultValue', async () => {
    const dialog = useDialog()
    dialog.prompt('Title', 'Enter value')
    expect(mockStore.openDialog.mock.calls[0][0].defaultValue).toBe('')
  })

  it('addEmployee opens dialog with variant addEmployee', () => {
    const dialog = useDialog()
    dialog.addEmployee('Add Employee')
    expect(mockStore.openDialog).toHaveBeenCalledWith({
      variant: 'addEmployee',
      title: 'Add Employee',
      resolve: expect.any(Function)
    })
  })

  it('removeEmployee opens dialog with variant removeEmployee', () => {
    const dialog = useDialog()
    dialog.removeEmployee('Remove', ['emp1', 'emp2'])
    expect(mockStore.openDialog).toHaveBeenCalledWith({
      variant: 'removeEmployee',
      title: 'Remove',
      employeeOptions: ['emp1', 'emp2'],
      resolve: expect.any(Function)
    })
  })
})
