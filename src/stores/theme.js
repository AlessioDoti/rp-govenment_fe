/***
 * Theme store — gestisce il tema light/dark, persistito in localStorage,
 * applicato come attributo `data-theme` sul <body>.
 */

import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const STORAGE_KEY = 'theme'

function readTheme() {
  return localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light'
}

export const useThemeStore = defineStore('theme', () => {
  const theme = ref(readTheme())

  function apply(value) {
    if (typeof document === 'undefined') return
    if (value === 'dark') {
      document.body.setAttribute('data-theme', 'dark')
    } else {
      document.body.removeAttribute('data-theme')
    }
  }

  function toggle() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  watch(
    theme,
    (value) => {
      localStorage.setItem(STORAGE_KEY, value)
      apply(value)
    },
    { immediate: true }
  )

  return { theme, toggle }
})
