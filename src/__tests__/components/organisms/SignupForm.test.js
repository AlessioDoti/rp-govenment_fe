import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import SignupForm from '@/components/organisms/SignupForm.vue'

const mockPush = vi.fn()
const mockAuth = { register: vi.fn(), isLoading: false, error: null }

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush })
}))

vi.mock('@/composables/useAuth.js', () => ({
  useAuth: () => mockAuth
}))

describe('SignupForm', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockPush.mockReset()
    mockAuth.register.mockReset()
    mockAuth.isLoading = false
    mockAuth.error = null
  })

  it('renders all form fields', () => {
    const wrapper = mount(SignupForm)
    expect(wrapper.find('form#signup-form').exists()).toBe(true)
    expect(wrapper.find('#firstname').exists()).toBe(true)
    expect(wrapper.find('#lastname').exists()).toBe(true)
    expect(wrapper.find('#birthDate').exists()).toBe(true)
    expect(wrapper.find('#email').exists()).toBe(true)
    expect(wrapper.find('#username').exists()).toBe(true)
    expect(wrapper.find('#password').exists()).toBe(true)
    expect(wrapper.find('#password-confirm').exists()).toBe(true)
  })

  it('renders submit button with Registrati label', () => {
    const wrapper = mount(SignupForm)
    const btn = wrapper.find('button[type="submit"]')
    expect(btn.exists()).toBe(true)
    expect(btn.text()).toContain('Registrati')
  })

  it('calls register on submit', async () => {
    mockAuth.register.mockResolvedValue({})
    const wrapper = mount(SignupForm)
    await wrapper.find('#firstname').setValue('John')
    await wrapper.find('#lastname').setValue('Doe')
    await wrapper.find('#birthDate').setValue('2000-01-01')
    await wrapper.find('#email').setValue('john@example.com')
    await wrapper.find('#username').setValue('johndoe')
    await wrapper.find('#password').setValue('secret')
    await wrapper.find('#password-confirm').setValue('secret')
    await wrapper.find('form').trigger('submit.prevent')
    expect(mockAuth.register).toHaveBeenCalledWith({
      firstname: 'John',
      lastname: 'Doe',
      birthDate: '2000-01-01',
      email: 'john@example.com',
      username: 'johndoe',
      password: 'secret'
    })
  })

  it('shows validation error when passwords do not match', async () => {
    const wrapper = mount(SignupForm)
    await wrapper.find('#password').setValue('pass1')
    await wrapper.find('#password-confirm').setValue('pass2')
    await wrapper.find('form').trigger('submit.prevent')
    expect(wrapper.text()).toContain('Le password non coincidono')
  })

  it('disables submit button when loading', () => {
    mockAuth.isLoading = true
    const wrapper = mount(SignupForm)
    const btn = wrapper.find('button[type="submit"]')
    expect(btn.attributes('disabled')).toBeDefined()
  })
})
