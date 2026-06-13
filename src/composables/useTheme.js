/***
 * useTheme — wrapper sul theme store.
 */

import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme.js'

export function useTheme() {
  const store = useThemeStore()
  const { theme } = storeToRefs(store)
  const isDark = computed(() => theme.value === 'dark')
  return { theme, isDark, toggle: store.toggle }
}
