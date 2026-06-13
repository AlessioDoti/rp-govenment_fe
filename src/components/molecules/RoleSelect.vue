<script setup>
/***
 * RoleSelect — select per cambiare ruolo utente (admin).
 * @prop {string} modelValue
 * @prop {string} currentRole
 * @prop {string} id
 */
const props = defineProps({
  modelValue: { type: String, default: '' },
  currentRole: { type: String, default: '' },
  id: { type: String, default: 'role-select' }
})
const emit = defineEmits(['update:modelValue'])

const ROLES = [
  { value: 'CITIZEN', label: 'Cittadino' },
  { value: 'ACTIVITY_MANAGER', label: 'Gestore Attività' },
  { value: 'GOVERNMENT', label: 'Membro del Governo' },
  { value: 'ADMIN', label: 'Admin Governo' }
]

function onChange(event) {
  emit('update:modelValue', event.target.value)
}
</script>

<template>
  <select :id="id" class="form-select" :value="modelValue" @change="onChange">
    <option value="">-- Seleziona ruolo --</option>
    <option
      v-for="r in ROLES"
      :key="r.value"
      :value="r.value"
      :selected="r.value === currentRole"
    >
      {{ r.label }}
    </option>
  </select>
</template>
