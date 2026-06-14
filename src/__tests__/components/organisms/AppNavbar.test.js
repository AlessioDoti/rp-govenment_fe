import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, shallowMount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import AppNavbar from '@/components/organisms/AppNavbar.vue'

const mockRoute = { path: '/' }
const mockRouter = { push: vi.fn() }
const mockAuth = { isAuthenticated: false, logout: vi.fn() }

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => mockRouter
}))

vi.mock('@/composables/useAuth.js', () => ({
  useAuth: () => mockAuth
}))

vi.mock('@/components/molecules/ThemeToggle.vue', () => ({
  default: {
    name: 'ThemeToggle',
    template: '<div class="theme-toggle-mock"></div>'
  }
}))

describe('AppNavbar', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockRouter.push.mockReset()
    mockAuth.logout.mockReset()
    mockAuth.isAuthenticated = false
    mockRoute.path = '/'
  })

  it('renders brand link', () => {
    const wrapper = mount(AppNavbar)
    expect(wrapper.text()).toContain('Governo RP')
  })

  it('renders public layout links when publicLayout is true', () => {
    const wrapper = mount(AppNavbar, {
      props: { publicLayout: true }
    })
    expect(wrapper.text()).toContain('Home')
    expect(wrapper.text()).toContain('Regolamento')
  })

  it('shows Login link when not authenticated in public layout', () => {
    const wrapper = mount(AppNavbar, {
      props: { publicLayout: true }
    })
    expect(wrapper.text()).toContain('Login')
  })

  it('shows logout button when authenticated in public layout', () => {
    mockAuth.isAuthenticated = true
    const wrapper = mount(AppNavbar, {
      props: { publicLayout: true }
    })
    expect(wrapper.find('#logout-btn-public').exists()).toBe(true)
  })

  it('shows logout button in dashboard layout', () => {
    const wrapper = mount(AppNavbar, {
      props: { dashboard: true }
    })
    expect(wrapper.find('#logout-btn').exists()).toBe(true)
  })

  it('renders ThemeToggle component in public layout', () => {
    const wrapper = mount(AppNavbar, {
      props: { publicLayout: true }
    })
    expect(wrapper.find('.theme-toggle-mock').exists()).toBe(true)
  })

  it('renders ThemeToggle component in dashboard layout', () => {
    const wrapper = mount(AppNavbar, {
      props: { dashboard: true }
    })
    expect(wrapper.find('.theme-toggle-mock').exists()).toBe(true)
  })

  it('calls logout and redirects on logout click', async () => {
    const wrapper = mount(AppNavbar, {
      props: { dashboard: true }
    })
    await wrapper.find('#logout-btn').trigger('click')
    expect(mockAuth.logout).toHaveBeenCalled()
    expect(mockRouter.push).toHaveBeenCalledWith({ name: 'login' })
  })
})
