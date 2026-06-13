<script setup>
/***
 * ThemeToggle — toggle light/dark.
 * Delega allo store theme.
 */
import { computed } from 'vue'
import { useTheme } from '@/composables/useTheme.js'

const { isDark, toggle } = useTheme()
const iconName = computed(() => (isDark.value ? 'sun-fill' : 'moon-fill'))
const ariaLabel = computed(() => (isDark.value ? 'Passa al tema chiaro' : 'Passa al tema scuro'))
</script>

<template>
  <button
    id="theme-toggle"
    class="btn btn-theme-toggle"
    type="button"
    :aria-label="ariaLabel"
    @click="toggle"
  >
    <i id="theme-icon" :class="['bi', `bi-${iconName}`]" />
  </button>
</template>
