import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import LoginView from '@/views/LoginView.vue'

vi.mock('@/components/templates/AuthLayout.vue', () => ({
  default: {
    name: 'AuthLayout',
    template: '<div class="auth-layout"><slot /></div>'
  }
}))

vi.mock('@/components/organisms/LoginForm.vue', () => ({
  default: {
    name: 'LoginForm',
    template: '<div class="login-form"></div>'
  }
}))

vi.mock('@/assets/css/login.css', () => ({}))

describe('LoginView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders the title', () => {
    const wrapper = mount(LoginView)
    expect(wrapper.text()).toContain('Governo RP')
    expect(wrapper.text()).toContain('Accesso Area Cittadini')
  })

  it('renders LoginForm component', () => {
    const wrapper = mount(LoginView)
    expect(wrapper.find('.login-form').exists()).toBe(true)
  })

  it('renders signup and home links', () => {
    const wrapper = mount(LoginView)
    expect(wrapper.text()).toContain('Registrati')
    expect(wrapper.text()).toContain('Torna alla homepage')
  })

  it('renders AuthLayout', () => {
    const wrapper = mount(LoginView)
    expect(wrapper.find('.auth-layout').exists()).toBe(true)
  })
})
