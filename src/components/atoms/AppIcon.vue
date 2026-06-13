<script setup>
/***
 * AppIcon — bootstrap-icons wrapper.
 * @prop {string} name - nome icona (es. "moon-fill", "arrow-left", "trash-fill")
 * @prop {string} label - aria-label
 */
defineProps({
  name: { type: String, required: true },
  label: { type: String, default: '' }
})
</script>

<template>
  <i :class="['bi', `bi-${name}`]" :aria-label="label || undefined" />
</template>
