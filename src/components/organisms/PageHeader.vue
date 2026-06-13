<script setup>
/***
 * PageHeader — header per le pagine di dettaglio (titolo + sottotitolo + back opzionale).
 * @prop {string} title
 * @prop {string} subtitle
 * @prop {string} backTo
 * @prop {boolean} showBack
 */
import { computed } from 'vue'
import AppBackButton from '@/components/atoms/AppBackButton.vue'

const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  backTo: { type: String, default: '/dashboard' },
  showBack: { type: Boolean, default: true }
})
</script>

<template>
  <div class="d-flex align-items-flex-start gap-3 mb-4 ps-0 position-relative">
    <AppBackButton v-if="showBack" :to="backTo" />
    <div class="flex-grow-1">
      <h1 class="display-6 mb-2">{{ title }}</h1>
      <p v-if="subtitle" class="text-muted mb-0">{{ subtitle }}</p>
    </div>
    <slot name="actions" />
  </div>
</template>
