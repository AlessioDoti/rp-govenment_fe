import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import CardPagination from '@/components/molecules/CardPagination.vue'

vi.mock('@/components/atoms/AppIconButton.vue', () => ({
  default: {
    name: 'AppIconButton',
    template: '<button class="mock-icon-btn" :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
    props: ['icon', 'absolute', 'title', 'disabled']
  }
}))

describe('CardPagination', () => {
  it('renders page display as 1 / totalPages', () => {
    const wrapper = mount(CardPagination, {
      props: { page: 0, totalPages: 5 }
    })
    expect(wrapper.text()).toContain('1 / 5')
  })

  it('disables prev button on first page', () => {
    const wrapper = mount(CardPagination, {
      props: { page: 0, totalPages: 5 }
    })
    const buttons = wrapper.findAll('button')
    const prevBtn = buttons[0]
    expect(prevBtn.attributes('disabled')).toBeDefined()
  })

  it('enables prev button after first page', () => {
    const wrapper = mount(CardPagination, {
      props: { page: 2, totalPages: 5 }
    })
    const buttons = wrapper.findAll('button')
    const prevBtn = buttons[0]
    expect(prevBtn.attributes('disabled')).toBeFalsy()
  })

  it('disables next button on last page', () => {
    const wrapper = mount(CardPagination, {
      props: { page: 4, totalPages: 5 }
    })
    const buttons = wrapper.findAll('button')
    const nextBtn = buttons[buttons.length - 1]
    expect(nextBtn.attributes('disabled')).toBeDefined()
  })

  it('emits prev on prev button click', async () => {
    const wrapper = mount(CardPagination, {
      props: { page: 2, totalPages: 5 }
    })
    const buttons = wrapper.findAll('button')
    await buttons[0].trigger('click')
    expect(wrapper.emitted('prev')).toBeTruthy()
  })

  it('emits next on next button click', async () => {
    const wrapper = mount(CardPagination, {
      props: { page: 2, totalPages: 5 }
    })
    const buttons = wrapper.findAll('button')
    await buttons[buttons.length - 1].trigger('click')
    expect(wrapper.emitted('next')).toBeTruthy()
  })

  it('shows correct page number for non-zero page', () => {
    const wrapper = mount(CardPagination, {
      props: { page: 3, totalPages: 10 }
    })
    expect(wrapper.text()).toContain('4 / 10')
  })
})
