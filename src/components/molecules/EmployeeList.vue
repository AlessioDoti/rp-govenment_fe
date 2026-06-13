<script setup>
/***
 * Employee list component (molecule).
 * @prop {{ employeeUuid:string, role:string, name:string, surname:string }[]} employees
 */
defineProps({
  employees: { type: Array, required: true }
})
</script>

<template>
  <ul class="list-unstyled">
    <li v-for="(emp,i) in employees" :key="i"
        class="employee-row d-flex justify-content-between align-items-center py-2 px-3 mb-1">
      <span class="employee-name">{{ emp.name }} {{ emp.surname }}</span>
      <span class="employee-role badge bg-secondary">{{ emp.role }}</span>
    </li>
  </ul>
</template>

<style scoped>
.employee-row { background: var(--bg, #f8fafc); border-radius: 8px; }
.employee-row + .employee-row { margin-top: 4px; }
.employee-name { font-weight: 500; }
.employee-role { font-size: 0.75rem; }
[data-theme="dark"] .employee-row { background: rgba(255,255,255,.04); }
</style>
