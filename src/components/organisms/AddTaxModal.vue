<script setup>
/***
 * AddTaxModal — modale per aggiungere una nuova dichiarazione tasse.
 *
 * @prop {number|string} activityId
 * @prop {Array<{ employeeUuid: string, name: string, surname: string }>} employees
 * @prop {string} [fixedEmployeeUuid] — se impostato, il dichiarante non è modificabile
 *
 * @emit close
 * @emit saved
 */
import { ref } from 'vue'
import { api } from '@/services/api.js'
import AddTaxForm from '@/components/molecules/AddTaxForm.vue'

const props = defineProps({
  activityId: { type: [Number, String], required: true },
  employees: { type: Array, default: () => [] },
  fixedEmployeeUuid: { type: String, default: '' }
})

const emit = defineEmits(['close', 'saved'])

const saving = ref(false)
const saveError = ref(/** @type {string|null} */ (null))

/***
 * @param {{ earnings: number, expenses: number, employeeUuid: string }} data
 */
async function onSave(data) {
  saving.value = true
  saveError.value = null
  try {
    await api.createTax(props.activityId, data)
    emit('saved')
  } catch (err) {
    saveError.value = 'Impossibile aggiungere la tassa. Verifica che il backend sia in esecuzione.'
    console.error('[AddTaxModal] Errore aggiunta tassa:', err)
  } finally {
    saving.value = false
  }
}

function onCancel() {
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        class="modal fade show d-block"
        tabindex="-1"
        role="dialog"
        aria-modal="true"
        @click.self="emit('close')"
      >
        <div class="modal-dialog modal-dialog-centered" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Nuova dichiarazione</h5>
              <button
                type="button"
                class="btn-close"
                aria-label="Chiudi"
                @click="emit('close')"
              />
            </div>

            <div class="modal-body">
              <AddTaxForm
                :employees="employees"
                :saving="saving"
                :error="saveError"
                :fixed-employee-uuid="fixedEmployeeUuid"
                @save="onSave"
                @cancel="onCancel"
              />
            </div>
          </div>
        </div>
      </div>
    </Transition>
    <div v-if="true" class="modal-backdrop fade show" @click="emit('close')" />
  </Teleport>
</template>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  background-color: var(--card) !important;
  color: var(--text-primary) !important;
  border: 1px solid rgba(0, 0, 0, 0.1) !important;
}

.modal-header {
  background-color: transparent !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1) !important;
}

.modal-title {
  color: var(--text-primary);
}

.modal-body {
  background-color: transparent !important;
  color: var(--text-primary) !important;
}

.modal-body label {
  color: var(--text-primary);
}

[data-theme="dark"] .modal-content {
  background-color: var(--card) !important;
  color: var(--text-primary) !important;
  border: 1px solid #334155 !important;
}

[data-theme="dark"] .modal-header {
  border-bottom-color: #334155 !important;
}

[data-theme="dark"] .btn-close {
  filter: brightness(0.8);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
