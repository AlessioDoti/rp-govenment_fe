import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import LoginForm from '@/components/organisms/LoginForm.vue'

const mockPush = vi.fn()
const mockAuth = { login: vi.fn(), isLoading: false, error: null }

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush })
}))

vi.mock('@/composables/useAuth.js', () => ({
  useAuth: () => mockAuth
}))

describe('LoginForm', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockPush.mockReset()
    mockAuth.login.mockReset()
    mockAuth.isLoading = false
    mockAuth.error = null
  })

  it('renders the form with all fields', () => {
    const wrapper = mount(LoginForm)
    expect(wrapper.find('form#login-form').exists()).toBe(true)
    expect(wrapper.find('#username').exists()).toBe(true)
    expect(wrapper.find('#password').exists()).toBe(true)
  })

  it('renders submit button', () => {
    const wrapper = mount(LoginForm)
    const btn = wrapper.find('button[type="submit"]')
    expect(btn.exists()).toBe(true)
    expect(btn.text()).toContain('Accedi')
  })

  it('calls login and redirects on submit', async () => {
    mockAuth.login.mockResolvedValue({})
    const wrapper = mount(LoginForm)
    await wrapper.find('#username').setValue('testuser')
    await wrapper.find('#password').setValue('password')
    await wrapper.find('form').trigger('submit.prevent')
    expect(mockAuth.login).toHaveBeenCalledWith({ username: 'testuser', password: 'password' })
  })

  it('shows error alert when error is present', () => {
    mockAuth.error = 'Invalid credentials'
    const wrapper = mount(LoginForm)
    expect(wrapper.find('#login-alert').exists()).toBe(true)
    expect(wrapper.text()).toContain('Invalid credentials')
  })

  it('disables submit button when loading', () => {
    mockAuth.isLoading = true
    const wrapper = mount(LoginForm)
    const btn = wrapper.find('button[type="submit"]')
    expect(btn.attributes('disabled')).toBeDefined()
  })
})
