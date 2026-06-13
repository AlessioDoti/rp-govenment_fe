<script setup>
/***
 * ActivitySummaryCard — card riepilogo per gestore attività.
 * @prop {Object} activity
 * @prop {string} categoryName
 * @prop {string} managerName
 */
import AppCard from '@/components/atoms/AppCard.vue'
import AppIconButton from '@/components/atoms/AppIconButton.vue'

const props = defineProps({
  activity: { type: Object, required: true },
  categoryName: { type: String, required: true },
  managerName: { type: String, required: true }
})

const emit = defineEmits(['add-employee'])
</script>

<template>
  <div class="col-12 d-flex">
    <AppCard class="flex-fill">
      <h3>{{ activity.name }}</h3>
      <p v-if="activity.address != null" class="mb-1">Civico: <strong>{{ activity.address }}</strong></p>
      <p class="mb-2"><span class="fw-semibold">{{ categoryName }}</span></p>
      <p>Manager: <strong>{{ managerName }}</strong></p>
      <p>Tasse pagate: <strong>${{ activity.taxPaid }}</strong></p>
      <p>Tasse dovute: <strong>${{ activity.taxDue }}</strong></p>
      <p>Dipendenti: <strong>{{ activity.employees.length }}</strong></p>
      <ul class="mt-3">
        <li v-for="(emp, idx) in activity.employees" :key="idx">{{ emp }}</li>
      </ul>
      <p class="text-muted small">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
        incididunt ut labore et dolore magna aliqua.
      </p>
      <div class="d-flex gap-2 flex-wrap mt-3">
        <AppIconButton
          icon="pencil-square"
          :absolute="false"
          title="Modifica dipendenti"
          @click="emit('add-employee')"
        />
      </div>
    </AppCard>
  </div>
</template>
