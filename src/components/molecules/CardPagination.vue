<script setup>
/***
 * CardPagination — frecce di navigazione per card con paginazione.
 *
 * @prop {number} page — pagina corrente (0-based)
 * @prop {number} totalPages — numero totale pagine
 *
 * @emit prev — pagina precedente
 * @emit next — pagina successiva
 */
import AppIconButton from '@/components/atoms/AppIconButton.vue'

defineProps({
  page: { type: Number, required: true },
  totalPages: { type: Number, required: true }
})

const emit = defineEmits(['prev', 'next'])
</script>

<template>
  <div class="d-flex align-items-center justify-content-center gap-3 mt-auto pt-3 border-top">
    <AppIconButton
      icon="chevron-left"
      :absolute="false"
      title="Pagina precedente"
      :disabled="page <= 0"
      @click="emit('prev')"
    />
    <span class="small text-muted">{{ page + 1 }} / {{ totalPages }}</span>
    <AppIconButton
      icon="chevron-right"
      :absolute="false"
      title="Pagina successiva"
      :disabled="page >= totalPages - 1"
      @click="emit('next')"
    />
  </div>
</template>
