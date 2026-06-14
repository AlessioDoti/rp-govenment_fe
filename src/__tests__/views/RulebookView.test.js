import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import RulebookView from '@/views/RulebookView.vue'

vi.mock('@/components/templates/PublicLayout.vue', () => ({
  default: {
    name: 'PublicLayout',
    template: '<div class="public-layout"><slot /></div>'
  }
}))

vi.mock('@/assets/css/rulebook.css', () => ({}))

describe('RulebookView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders the main heading', () => {
    const wrapper = mount(RulebookView)
    expect(wrapper.text()).toContain('Regolamento Tasse Locali')
  })

  it('renders all article sections', () => {
    const wrapper = mount(RulebookView)
    expect(wrapper.text()).toContain('Articolo 1')
    expect(wrapper.text()).toContain('Articolo 2')
    expect(wrapper.text()).toContain('Articolo 3')
    expect(wrapper.text()).toContain('Articolo 4')
  })

  it('renders PublicLayout', () => {
    const wrapper = mount(RulebookView)
    expect(wrapper.find('.public-layout').exists()).toBe(true)
  })
})
