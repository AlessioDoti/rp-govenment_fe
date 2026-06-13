<script setup>
/***
 * FormField — label + slot per input, allineato al layout mockup.
 * @prop {string} label
 * @prop {string} forId
 * @prop {string} marginBottom - "mb-3" | "mb-4" | ...
 */
defineProps({
  label: { type: String, required: true },
  forId: { type: String, default: '' },
  marginBottom: { type: String, default: 'mb-3' }
})
</script>

<template>
  <div :class="marginBottom">
    <label :for="forId || undefined" class="form-label">{{ label }}</label>
    <slot />
  </div>
</template>
