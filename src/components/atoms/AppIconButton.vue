<script setup>
/***
 * AppIconButton — pulsante icona con stile "delete" (position-absolute, icona trash).
 * Il colore usa --icon-color che cambia automaticamente con il tema (variabili.css).
 * @prop {string} icon
 * @prop {string} title
 * @prop {string} ariaLabel
 * @prop {boolean} absolute - se true, position absolute top-right (default true)
 * @prop {string} customClass
 */
defineProps({
  icon: { type: String, default: 'trash-fill' },
  title: { type: String, default: '' },
  ariaLabel: { type: String, default: '' },
  absolute: { type: Boolean, default: true },
  customClass: { type: String, default: '' },
})
const emit = defineEmits(['click'])
</script>

<template>
  <button
    type="button"
    :class="['btn-icon-delete', absolute ? 'position-absolute' : '', customClass]"
    :title="title || undefined"
    :aria-label="ariaLabel || title || undefined"
    :style="absolute ? { top: '15px', right: '15px' } : undefined"
    @click="emit('click', $event)"
  >
    <i :class="['bi', `bi-${icon}`]" />
  </button>
</template>

<style scoped>
.btn-icon-delete {
    background: transparent !important;
    border: none !important;
    color: var(--icon-color, #111827) !important;
    padding: 4px 8px !important;
    cursor: pointer;
    transition: opacity 0.2s ease, transform 0.2s ease;
    font-size: 1.2rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.btn-icon-delete:hover {
    opacity: 0.7;
    transform: scale(1.1);
}

.btn-icon-delete:active {
    transform: scale(0.95);
}
</style>
