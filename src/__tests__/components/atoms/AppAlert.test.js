import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppAlert from '@/components/atoms/AppAlert.vue'

describe('AppAlert', () => {
  it('renders message when provided', () => {
    const wrapper = mount(AppAlert, {
      props: { message: 'Error occurred' }
    })
    expect(wrapper.text()).toContain('Error occurred')
    expect(wrapper.find('.alert').exists()).toBe(true)
  })

  it('does not render when message is empty', () => {
    const wrapper = mount(AppAlert, {
      props: { message: '' }
    })
    expect(wrapper.find('.alert').exists()).toBe(false)
  })

  it('does not render when message is null', () => {
    const wrapper = mount(AppAlert, {
      props: { message: null }
    })
    expect(wrapper.find('.alert').exists()).toBe(false)
  })

  it('applies default danger variant', () => {
    const wrapper = mount(AppAlert, {
      props: { message: 'Error' }
    })
    expect(wrapper.classes()).toContain('alert-danger')
  })

  it('applies custom variant', () => {
    const wrapper = mount(AppAlert, {
      props: { message: 'Success', variant: 'success' }
    })
    expect(wrapper.classes()).toContain('alert-success')
  })

  it('has role="alert"', () => {
    const wrapper = mount(AppAlert, {
      props: { message: 'Alert!' }
    })
    expect(wrapper.attributes('role')).toBe('alert')
  })
})
