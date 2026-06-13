<script setup>
/***
 * AppCard — base card riusabile.
 * @prop {string} customClass
 * @prop {boolean} clickable
 * @prop {boolean} addItem
 * @prop {boolean} feature
 */
defineProps({
  customClass: { type: String, default: '' },
  clickable: { type: Boolean, default: false },
  addItem: { type: Boolean, default: false },
  feature: { type: Boolean, default: false }
})
</script>

<template>
  <div
    :class="[
      'card',
      'p-4',
      'h-100',
      clickable ? 'card-clickable' : '',
      addItem ? 'card-add-item' : '',
      feature ? 'card-feature' : '',
      customClass
    ]"
  >
    <slot />
  </div>
</template>
