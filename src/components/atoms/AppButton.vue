<script setup>
/***
 * AppButton — generic button.
 * @prop {string} variant - Bootstrap variant class (e.g. "primary", "secondary", "outline-light")
 * @prop {string} size - Bootstrap size modifier ("sm" | "lg" | "")
 * @prop {string} type - button type
 * @prop {boolean} block - w-100
 * @prop {boolean} disabled
 * @prop {string} customClass - extra classi aggiuntive
 */
defineProps({
  variant: { type: String, default: 'primary' },
  size: { type: String, default: '' },
  type: { type: String, default: 'button' },
  block: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  customClass: { type: String, default: '' }
})
</script>

<template>
  <button
    :type="type"
    :class="[
      'btn',
      variant ? `btn-${variant}` : '',
      size ? `btn-${size}` : '',
      block ? 'w-100' : '',
      customClass
    ]"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>
