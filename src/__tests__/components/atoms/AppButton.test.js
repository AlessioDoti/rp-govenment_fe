import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AppButton from '@/components/atoms/AppButton.vue'

describe('AppButton', () => {
  it('renders slot content', () => {
    const wrapper = mount(AppButton, {
      slots: { default: 'Click Me' }
    })
    expect(wrapper.text()).toContain('Click Me')
  })

  it('applies default btn and btn-primary classes', () => {
    const wrapper = mount(AppButton)
    expect(wrapper.classes()).toContain('btn')
    expect(wrapper.classes()).toContain('btn-primary')
  })

  it('applies variant class', () => {
    const wrapper = mount(AppButton, {
      props: { variant: 'secondary' }
    })
    expect(wrapper.classes()).toContain('btn-secondary')
  })

  it('applies size class when size prop is set', () => {
    const wrapper = mount(AppButton, {
      props: { size: 'lg' }
    })
    expect(wrapper.classes()).toContain('btn-lg')
  })

  it('does not apply size class when size is empty', () => {
    const wrapper = mount(AppButton)
    expect(wrapper.classes()).not.toContain('btn-')
  })

  it('applies w-100 when block is true', () => {
    const wrapper = mount(AppButton, {
      props: { block: true }
    })
    expect(wrapper.classes()).toContain('w-100')
  })

  it('sets button type', () => {
    const wrapper = mount(AppButton, {
      props: { type: 'submit' }
    })
    expect(wrapper.attributes('type')).toBe('submit')
  })

  it('disables button when disabled prop is true', () => {
    const wrapper = mount(AppButton, {
      props: { disabled: true }
    })
    expect(wrapper.attributes('disabled')).toBeDefined()
  })

  it('emits click event on click', async () => {
    const wrapper = mount(AppButton)
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('does not emit click when disabled', async () => {
    const wrapper = mount(AppButton, {
      props: { disabled: true }
    })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeFalsy()
  })

  it('applies custom class', () => {
    const wrapper = mount(AppButton, {
      props: { customClass: 'my-custom-class' }
    })
    expect(wrapper.classes()).toContain('my-custom-class')
  })
})
