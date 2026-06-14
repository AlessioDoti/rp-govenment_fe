import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import SearchBar from '@/components/molecules/SearchBar.vue'

describe('SearchBar', () => {
  it('renders input with default placeholder', () => {
    const wrapper = mount(SearchBar)
    const input = wrapper.find('input')
    expect(input.attributes('placeholder')).toBe('Cerca...')
  })

  it('renders custom placeholder', () => {
    const wrapper = mount(SearchBar, {
      props: { placeholder: 'Search users...' }
    })
    expect(wrapper.find('input').attributes('placeholder')).toBe('Search users...')
  })

  it('renders button with default label', () => {
    const wrapper = mount(SearchBar)
    expect(wrapper.find('button').text()).toBe('Cerca')
  })

  it('renders custom button label', () => {
    const wrapper = mount(SearchBar, {
      props: { buttonLabel: 'Find' }
    })
    expect(wrapper.find('button').text()).toBe('Find')
  })

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(SearchBar, {
      props: { modelValue: '' }
    })
    const input = wrapper.find('input')
    await input.setValue('test')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['test'])
  })

  it('emits search on button click with current modelValue', async () => {
    const wrapper = mount(SearchBar, {
      props: { modelValue: 'search term' }
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('search')).toBeTruthy()
    expect(wrapper.emitted('search')[0]).toEqual(['search term'])
  })

  it('emits search on Enter keypress', async () => {
    const wrapper = mount(SearchBar, {
      props: { modelValue: 'enter search' }
    })
    const input = wrapper.find('input')
    await input.trigger('keypress', { key: 'Enter' })
    expect(wrapper.emitted('search')).toBeTruthy()
    expect(wrapper.emitted('search')[0]).toEqual(['enter search'])
  })

  it('does not emit search on non-Enter keypress', async () => {
    const wrapper = mount(SearchBar, {
      props: { modelValue: 'test' }
    })
    const input = wrapper.find('input')
    await input.trigger('keypress', { key: 'Space' })
    expect(wrapper.emitted('search')).toBeFalsy()
  })
})
