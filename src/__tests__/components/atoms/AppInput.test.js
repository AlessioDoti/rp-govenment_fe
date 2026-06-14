import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AppInput from '@/components/atoms/AppInput.vue'

describe('AppInput', () => {
  it('renders input with correct id', () => {
    const wrapper = mount(AppInput, { props: { id: 'username' } })
    const input = wrapper.find('input')
    expect(input.attributes('id')).toBe('username')
  })

  it('sets type, placeholder, and other attributes', () => {
    const wrapper = mount(AppInput, {
      props: { id: 'test', type: 'password', placeholder: 'Enter', required: true, autocomplete: 'off' }
    })
    const input = wrapper.find('input')
    expect(input.attributes('type')).toBe('password')
    expect(input.attributes('placeholder')).toBe('Enter')
    expect(input.attributes('autocomplete')).toBe('off')
  })

  it('displays modelValue as value', () => {
    const wrapper = mount(AppInput, {
      props: { id: 'test', modelValue: 'hello' }
    })
    const input = wrapper.find('input')
    expect(input.element.value).toBe('hello')
  })

  it('applies is-invalid class when invalid is true', () => {
    const wrapper = mount(AppInput, {
      props: { id: 'test', invalid: true }
    })
    expect(wrapper.find('input').classes()).toContain('is-invalid')
  })

  it('does not apply is-invalid when invalid is false', () => {
    const wrapper = mount(AppInput, {
      props: { id: 'test', invalid: false }
    })
    expect(wrapper.find('input').classes()).not.toContain('is-invalid')
  })

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(AppInput, {
      props: { id: 'test', modelValue: '' }
    })
    const input = wrapper.find('input')
    await input.setValue('new value')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['new value'])
  })
})
