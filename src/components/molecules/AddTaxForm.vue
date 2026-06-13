<script setup>
/***
 * AddTaxForm — form inline per aggiungere una nuova dichiarazione tasse.
 *
 * @prop {Array<{ employeeUuid: string, name: string, surname: string }>} employees
 * @prop {boolean} saving
 * @prop {string} [error]
 * @prop {string} [fixedEmployeeUuid] — se impostato, il dichiarante è fissato e non modificabile
 *
 * @emit save — con payload { earnings: number, expenses: number, employeeUuid: string }
 * @emit cancel
 */
import { ref, watch, computed } from 'vue'
import AppButton from '@/components/atoms/AppButton.vue'

const props = defineProps({
  employees: { type: Array, default: () => [] },
  saving: { type: Boolean, default: false },
  error: { type: String, default: '' },
  fixedEmployeeUuid: { type: String, default: '' }
})

const emit = defineEmits(['save', 'cancel'])

const earnings = ref(0)
const expenses = ref(0)
const employeeUuid = ref('')

const fixedEmployeeName = computed(() => {
  if (!props.fixedEmployeeUuid) return ''
  const emp = props.employees.find((e) => e.employeeUuid === props.fixedEmployeeUuid)
  return emp ? `${emp.name} ${emp.surname}` : props.fixedEmployeeUuid
})

watch(
  () => props.fixedEmployeeUuid || props.employees,
  () => {
    if (props.fixedEmployeeUuid) {
      employeeUuid.value = props.fixedEmployeeUuid
    } else if (props.employees.length > 0 && !employeeUuid.value) {
      employeeUuid.value = props.employees[0].employeeUuid
    }
  },
  { immediate: true }
)

function onSave() {
  emit('save', {
    earnings: Number(earnings.value) || 0,
    expenses: Number(expenses.value) || 0,
    employeeUuid: employeeUuid.value
  })
}

function onCancel() {
  earnings.value = 0
  expenses.value = 0
  employeeUuid.value = props.fixedEmployeeUuid || props.employees[0]?.employeeUuid || ''
  emit('cancel')
}
</script>

<template>
  <div class="add-tax-form mt-3 p-3 border rounded">
    <p class="fw-semibold mb-2">Nuova dichiarazione</p>
    <div class="mb-2">
      <label class="form-label small">Fatturato (€)</label>
      <input
        v-model.number="earnings"
        type="number"
        class="form-control form-control-sm"
        min="0"
        step="0.01"
        placeholder="0.00"
      />
    </div>
    <div class="mb-2">
      <label class="form-label small">Spese (€)</label>
      <input
        v-model.number="expenses"
        type="number"
        class="form-control form-control-sm"
        min="0"
        step="0.01"
        placeholder="0.00"
      />
    </div>
    <div class="mb-2">
      <label class="form-label small">Dipendente dichiarante</label>
      <template v-if="fixedEmployeeUuid">
        <p class="form-control-plaintext form-control-sm py-1 mb-0">{{ fixedEmployeeName }}</p>
      </template>
      <select v-else v-model="employeeUuid" class="form-select form-select-sm">
        <option v-for="emp in employees" :key="emp.employeeUuid" :value="emp.employeeUuid">
          {{ emp.name }} {{ emp.surname }}
        </option>
      </select>
    </div>
    <div v-if="error" class="alert alert-danger py-1 px-2 small mb-2">{{ error }}</div>
    <div class="d-flex gap-2">
      <AppButton variant="primary" size="sm" :disabled="saving" @click="onSave">
        <span v-if="saving" class="spinner-border spinner-border-sm me-1" role="status" />
        Salva
      </AppButton>
      <AppButton variant="secondary" size="sm" :disabled="saving" @click="onCancel">
        Annulla
      </AppButton>
    </div>
  </div>
</template>

<style scoped>
.form-control-plaintext {
  color: #fff !important;
}
</style>
