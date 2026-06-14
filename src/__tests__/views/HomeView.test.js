import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import HomeView from '@/views/HomeView.vue'

vi.mock('@/components/templates/PublicLayout.vue', () => ({
  default: {
    name: 'PublicLayout',
    template: '<div class="public-layout"><slot /></div>'
  }
}))

vi.mock('@/components/atoms/AppCard.vue', () => ({
  default: {
    name: 'AppCard',
    template: '<div class="app-card"><slot /></div>',
    props: ['feature']
  }
}))

vi.mock('@/components/atoms/AppButton.vue', () => ({
  default: {
    name: 'AppButton',
    template: '<button @click="$emit(\'click\')"><slot /></button>',
    props: ['variant', 'size']
  }
}))

const mockLogout = vi.fn()
vi.mock('@/composables/useAuth.js', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    hasRole: () => false,
    logout: mockLogout
  })
}))

describe('HomeView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockLogout.mockReset()
  })

  it('renders the title', () => {
    const wrapper = mount(HomeView)
    expect(wrapper.text()).toContain('Portale Governo RP')
  })

  it('renders feature cards', () => {
    const wrapper = mount(HomeView)
    const cards = wrapper.findAll('.app-card')
    expect(cards.length).toBe(3)
  })

  it('shows login link when not authenticated', () => {
    const wrapper = mount(HomeView)
    expect(wrapper.text()).toContain('Accedi al Portale')
  })
})
