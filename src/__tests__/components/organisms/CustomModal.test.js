import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import CustomModal from '@/components/organisms/CustomModal.vue'
import { useDialogStore } from '@/stores/dialog.js'

vi.mock('@/services/api.js', () => ({
  api: {
    getCategories: vi.fn().mockResolvedValue([])
  }
}))

vi.mock('@/components/atoms/AppButton.vue', () => ({
  default: {
    name: 'AppButton',
    template: '<button class="mock-btn" :disabled="disabled"><slot /></button>',
    props: ['variant', 'size', 'type', 'block', 'disabled', 'customClass']
  }
}))

vi.mock('@/components/atoms/AppInput.vue', () => ({
  default: {
    name: 'AppInput',
    template: '<input :id="id" :value="modelValue" />',
    props: ['id', 'type', 'placeholder', 'modelValue', 'required', 'invalid']
  }
}))

describe('CustomModal', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    document.body.innerHTML = ''
  })

  it('is hidden when store.open is false', () => {
    const wrapper = mount(CustomModal)
    expect(wrapper.find('#custom-modal').exists()).toBe(false)
  })

  it('shows when dialog store is opened', async () => {
    const store = useDialogStore()
    store.openDialog({ variant: 'alert', title: 'Test', message: 'Msg', resolve: vi.fn() })
    mount(CustomModal, { attachTo: document.body })
    await new Promise(r => setTimeout(r, 100))
    expect(document.getElementById('custom-modal')).toBeTruthy()
  })

  it('renders title and message for alert variant', async () => {
    const store = useDialogStore()
    store.openDialog({ variant: 'alert', title: 'Alert Title', message: 'Alert Message', resolve: vi.fn() })
    mount(CustomModal, { attachTo: document.body })
    await new Promise(r => setTimeout(r, 100))
    expect(document.body.textContent).toContain('Alert Title')
    expect(document.body.textContent).toContain('Alert Message')
  })

  it('shows cancel button for non-alert variants', async () => {
    const store = useDialogStore()
    store.openDialog({ variant: 'confirm', title: 'Confirm', message: 'Sure?', resolve: vi.fn() })
    mount(CustomModal, { attachTo: document.body })
    await new Promise(r => setTimeout(r, 100))
    const btns = document.body.querySelectorAll('button.mock-btn')
    expect(btns.length).toBeGreaterThanOrEqual(2)
  })

  it('hides cancel button for alert variant', async () => {
    const store = useDialogStore()
    store.openDialog({ variant: 'alert', title: 'Alert', message: 'Msg', resolve: vi.fn() })
    mount(CustomModal, { attachTo: document.body })
    await new Promise(r => setTimeout(r, 100))
    const btns = document.body.querySelectorAll('button.mock-btn')
    expect(btns.length).toBe(1)
  })
})
