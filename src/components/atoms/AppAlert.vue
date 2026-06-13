<script setup>
/***
 * AppAlert — alert Bootstrap.
 * @prop {string} variant - "danger" | "success" | "warning" | "info"
 * @prop {string} message
 */
defineProps({
  variant: { type: String, default: 'danger' },
  message: { type: String, default: '' }
})
</script>

<template>
  <div
    v-if="message"
    :class="['alert', `alert-${variant}`]"
    role="alert"
  >
    {{ message }}
  </div>
</template>
