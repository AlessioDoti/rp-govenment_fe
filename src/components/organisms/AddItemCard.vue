<script setup>
/***
 * AddItemCard — card "aggiungi" stile mockup.
 * @prop {string} label - testo mostrato nella card
 */
defineProps({
  label: { type: String, default: 'Aggiungi' }
})
const emit = defineEmits(['click'])
</script>

<template>
  <div class="card card-add-item p-4 h-100" @click="emit('click')">
    <div class="d-flex align-items-center justify-content-center h-100">
      <div class="text-center">
        <i class="bi bi-plus-lg" style="font-size: 2.5rem;" />
        <p class="mt-2 mb-0">{{ label }}</p>
      </div>
    </div>
  </div>
</template>
