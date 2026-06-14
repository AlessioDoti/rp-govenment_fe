import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FormField from '@/components/molecules/FormField.vue'

describe('FormField', () => {
  it('renders label text', () => {
    const wrapper = mount(FormField, {
      props: { label: 'Username' }
    })
    expect(wrapper.find('label').text()).toBe('Username')
  })

  it('sets for attribute when forId is provided', () => {
    const wrapper = mount(FormField, {
      props: { label: 'Username', forId: 'username-input' }
    })
    expect(wrapper.find('label').attributes('for')).toBe('username-input')
  })

  it('does not set for attribute when forId is empty', () => {
    const wrapper = mount(FormField, {
      props: { label: 'Username' }
    })
    expect(wrapper.find('label').attributes('for')).toBeUndefined()
  })

  it('renders slot content', () => {
    const wrapper = mount(FormField, {
      props: { label: 'Name' },
      slots: { default: '<input id="name-input" />' }
    })
    expect(wrapper.find('#name-input').exists()).toBe(true)
  })

  it('applies default margin-bottom class', () => {
    const wrapper = mount(FormField, {
      props: { label: 'Name' }
    })
    expect(wrapper.classes()).toContain('mb-3')
  })

  it('applies custom margin-bottom class', () => {
    const wrapper = mount(FormField, {
      props: { label: 'Name', marginBottom: 'mb-4' }
    })
    expect(wrapper.classes()).toContain('mb-4')
  })

  it('has form-label class on label', () => {
    const wrapper = mount(FormField, {
      props: { label: 'Name' }
    })
    expect(wrapper.find('label').classes()).toContain('form-label')
  })
})
