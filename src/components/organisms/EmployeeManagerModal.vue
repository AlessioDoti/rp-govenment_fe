<script setup>
/***
 * EmployeeManagerModal — modale per aggiungere dipendenti a un'attività.
 *
 * Supporta due modalità:
 * 1. Ricerca persona esistente (da person-service) con infinite scroll.
 * 2. Creazione di una nuova persona tramite person-service.
 *
 * @prop {number|string} activityId — l'attività a cui aggiungere il dipendente.
 * @prop {Array<{ employeeUuid: string, role: string }>} [currentEmployees=[]]
 *   elenco dipendenti correnti per appendere il nuovo.
 *
 * @emit close — chiude la modale senza modifiche.
 * @emit saved — dipendente aggiunto con successo; il parent deve fare refresh.
 */
import { ref, computed, onMounted, watch } from 'vue'
import { api } from '@/services/api.js'
import AppInput from '@/components/atoms/AppInput.vue'
import AppButton from '@/components/atoms/AppButton.vue'
import AppIconButton from '@/components/atoms/AppIconButton.vue'

const props = defineProps({
  activityId: { type: [Number, String], required: true },
  currentEmployees: { type: Array, default: () => [] }
})
const emit = defineEmits(['close', 'saved'])

const resolvedEmployees = ref(/** @type {Array<{ employeeUuid: string, role: string, name: string, surname: string }>} */ ([]))

const selectedEmployeeUuid = ref(/** @type {string|null} */ (null))

onMounted(async () => {
  resolveCurrentEmployees()
  loadPeople()
})

async function resolveCurrentEmployees() {
  const resolved = []
  for (const emp of (props.currentEmployees || [])) {
    try {
      const person = await api.getPersonByUuid(emp.employeeUuid)
      resolved.push({
        employeeUuid: emp.employeeUuid,
        role: emp.role,
        name: person?.name || emp.employeeUuid,
        surname: person?.surname || ''
      })
    } catch {
      resolved.push({
        employeeUuid: emp.employeeUuid,
        role: emp.role,
        name: emp.employeeUuid,
        surname: ''
      })
    }
  }
  resolvedEmployees.value = resolved
}

/***
 * Rimuove il dipendente selezionato e aggiorna il backend.
 */
async function onRemoveSelectedEmployee() {
  if (!selectedEmployeeUuid.value) return
  saving.value = true
  saveError.value = null
  try {
    const updated = (props.currentEmployees || []).filter((e) => e.employeeUuid !== selectedEmployeeUuid.value)
    await api.updateActivity(props.activityId, { employees: updated })
    emit('saved')
  } catch (err) {
    console.error('[EmployeeManagerModal] Errore rimuovendo dipendente:', err)
    saveError.value = 'Impossibile rimuovere il dipendente.'
  } finally {
    saving.value = false
  }
}

/***
 * Seleziona/deseleziona un dipendente dalla lista.
 * @param {string} employeeUuid
 */
function toggleSelectEmployee(employeeUuid) {
  selectedEmployeeUuid.value = selectedEmployeeUuid.value === employeeUuid ? null : employeeUuid
}

const mode = ref('search')

const allPeople = ref(/** @type {Array<{ id: number, name: string, surname: string, externalUuid: string }>} */ ([]))
const loading = ref(false)
const loadError = ref(/** @type {string|null} */ (null))
const filterText = ref('')

/*** Persone filtrate localmente in base alla textbox. */
const filteredPeople = computed(() => {
  const q = filterText.value.trim().toLowerCase()
  if (!q) return allPeople.value
  return allPeople.value.filter((p) =>
    p.name.toLowerCase().includes(q) ||
    p.surname.toLowerCase().includes(q)
  )
})

async function loadPeople() {
  loading.value = true
  try {
    loadError.value = null
    const result = await api.searchPersons({}, { page: 0, size: 100 })
    allPeople.value = result.data
  } catch (err) {
    loadError.value = 'Impossibile caricare la lista delle persone. Verifica che il servizio person-service sia in esecuzione.'
    console.error('[EmployeeManagerModal] Errore caricamento persone:', err)
  } finally {
    loading.value = false
  }
}

const newName = ref('')
const newSurname = ref('')
const newBirthDate = ref('')
const newNameError = ref(false)
const newSurnameError = ref(false)
const newBirthDateError = ref(false)

const saving = ref(false)
const saveError = ref(/** @type {string|null} */ (null))
const selectedRole = ref('')
const roleError = ref(false)

/*** UUID della persona selezionata nella lista di ricerca (non ancora salvata). */
const selectedSearchPerson = ref(/** @type {string|null} */ (null))

/***
 * Aggiunge un UUID persona come dipendente all'attività.
 * @param {string} employeeUuid
 * @param {string} role
 */
async function addEmployeeToActivity(employeeUuid, role) {
  const updatedEmployees = [
    ...(props.currentEmployees || []),
    { employeeUuid, role }
  ]
  await api.updateActivity(props.activityId, { employees: updatedEmployees })
}

/***
 * Seleziona/deseleziona una persona dalla lista di ricerca (toggle, non salva).
 * @param {{ externalUuid: string, name: string, surname: string }} person
 */
function selectSearchPerson(person) {
  selectedSearchPerson.value = selectedSearchPerson.value === person.externalUuid ? null : person.externalUuid
}

/***
 * Salva la persona selezionata dalla lista di ricerca come dipendente.
 */
async function onAddSearchPerson() {
  if (!selectedSearchPerson.value) return
  if (!selectedRole.value.trim()) {
    roleError.value = true
    return
  }
  roleError.value = false
  saving.value = true
  saveError.value = null
  try {
    await addEmployeeToActivity(selectedSearchPerson.value, selectedRole.value.trim())
    emit('saved')
  } catch (err) {
    console.error('[EmployeeManagerModal] Errore aggiungendo persona:', err)
    saveError.value = 'Impossibile aggiungere il dipendente. Verifica che i servizi siano in esecuzione.'
  } finally {
    saving.value = false
  }
}

/***
 * Gestisce la creazione di una nuova persona e il suo inserimento come dipendente.
 */
async function onCreatePerson() {
  newNameError.value = !newName.value.trim()
  newSurnameError.value = !newSurname.value.trim()
  newBirthDateError.value = !newBirthDate.value.trim()
  if (!selectedRole.value.trim()) {
    roleError.value = true
  } else {
    roleError.value = false
  }

  if (newNameError.value || newSurnameError.value || newBirthDateError.value || roleError.value) return

  saving.value = true
  saveError.value = null
  try {
    const person = await api.createPerson({
      name: newName.value.trim(),
      surname: newSurname.value.trim(),
      birthDate: newBirthDate.value.trim()
    })

    if (!person || !person.externalUuid) {
      throw new Error('La persona creata non ha externalUuid')
    }

    await addEmployeeToActivity(person.externalUuid, selectedRole.value.trim())
    emit('saved')
  } catch (err) {
    console.error('[EmployeeManagerModal] Errore creazione persona:', err)
    saveError.value = 'Impossibile creare la persona. Verifica che il servizio person-service sia in esecuzione.'
  } finally {
    saving.value = false
  }
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
        <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Modifica dipendenti</h5>
              <button
                type="button"
                class="btn-close"
                aria-label="Chiudi"
                @click="emit('close')"
              />
            </div>

            <div class="modal-body">

              <div v-if="resolvedEmployees.length > 0" class="mb-3">
                <p class="fw-semibold mb-2">Dipendenti attuali</p>
                <ul ref="listRef" class="list-group employee-list-scroll">
                  <li
                    v-for="emp in resolvedEmployees"
                    :key="emp.employeeUuid"
                    :class="['list-group-item', 'py-1', selectedEmployeeUuid === emp.employeeUuid ? 'list-group-item-primary' : 'list-group-item-action']"
                    @click="toggleSelectEmployee(emp.employeeUuid)"
                  >
                    <strong>{{ emp.name }} {{ emp.surname }}</strong>
                    <span class="text-muted small ms-2">({{ emp.role || '—' }})</span>
                  </li>
                </ul>
              </div>

              <div v-if="resolvedEmployees.length > 0" class="text-end mb-3">
                <button
                  type="button"
                  class="btn-icon-delete-local"
                  :disabled="!selectedEmployeeUuid || saving"
                  title="Rimuovi selezionato"
                  @click="onRemoveSelectedEmployee"
                >
                  <i class="bi bi-trash-fill" />
                </button>
              </div>

              <div class="btn-group w-100 mb-4" role="group">
                <button
                  type="button"
                  :class="['btn', mode === 'search' ? 'btn-primary' : 'btn-outline-primary']"
                  @click="mode = 'search'; selectedSearchPerson = null"
                >Da persona esistente</button>
                <button
                  type="button"
                  :class="['btn', mode === 'create' ? 'btn-primary' : 'btn-outline-primary']"
                  @click="mode = 'create'; selectedSearchPerson = null"
                >Crea nuova persona</button>
              </div>

              <template v-if="mode === 'search'">
                <div v-if="loading" class="text-center py-4">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Caricamento…</span>
                  </div>
                  <p class="text-muted small mt-2 mb-0">Caricamento persone…</p>
                </div>

                <div v-else-if="loadError" class="alert alert-warning mt-2 mb-0 py-2 small">
                  <i class="bi bi-exclamation-triangle-fill me-1" />{{ loadError }}
                </div>

                <template v-else>
                  <label for="emp-filter" class="form-label">Filtra persone</label>
                  <AppInput
                    id="emp-filter"
                    v-model="filterText"
                    placeholder="Cerca per nome o cognome…"
                    class="mb-2"
                  />

                  <div class="mb-2">
                    <label for="emp-role" class="form-label">Ruolo <span class="text-danger">*</span></label>
                    <input
                      id="emp-role"
                      v-model="selectedRole"
                      type="text"
                      :class="['form-control', roleError ? 'is-invalid' : '']"
                      placeholder="Impiegato"
                      @input="roleError = false"
                    />
                    <div v-if="roleError" class="invalid-feedback">Il ruolo è obbligatorio.</div>
                  </div>

                  <div v-if="filteredPeople.length === 0" class="text-muted small py-2">
                    Nessuna persona trovata.
                  </div>

                  <ul
                    v-else
                    class="list-group person-list-scroll"
                  >
                    <li
                      v-for="person in filteredPeople"
                      :key="person.externalUuid"
                      :class="['list-group-item', 'list-group-item-action', selectedSearchPerson === person.externalUuid ? 'list-group-item-primary' : '']"
                      @click="selectSearchPerson(person)"
                    >
                      <strong>{{ person.name }} {{ person.surname }}</strong>
                    </li>
                  </ul>
                </template>
              </template>

              <template v-if="mode === 'create'">
                <div class="mb-3">
                  <label for="emp-name" class="form-label">Nome <span class="text-danger">*</span></label>
                  <input
                    id="emp-name"
                    v-model="newName"
                    type="text"
                    :class="['form-control', newNameError ? 'is-invalid' : '']"
                    placeholder="Mario"
                    @input="newNameError = false"
                  />
                  <div v-if="newNameError" class="invalid-feedback">Il nome è obbligatorio.</div>
                </div>

                <div class="mb-3">
                  <label for="emp-surname" class="form-label">Cognome <span class="text-danger">*</span></label>
                  <input
                    id="emp-surname"
                    v-model="newSurname"
                    type="text"
                    :class="['form-control', newSurnameError ? 'is-invalid' : '']"
                    placeholder="Rossi"
                    @input="newSurnameError = false"
                  />
                  <div v-if="newSurnameError" class="invalid-feedback">Il cognome è obbligatorio.</div>
                </div>

                <div class="mb-3">
                  <label for="emp-birth" class="form-label">Data di nascita <span class="text-danger">*</span></label>
                  <input
                    id="emp-birth"
                    v-model="newBirthDate"
                    type="date"
                    :class="['form-control', newBirthDateError ? 'is-invalid' : '']"
                    @input="newBirthDateError = false"
                  />
                  <div v-if="newBirthDateError" class="invalid-feedback">La data di nascita è obbligatoria.</div>
                </div>

                <div class="mb-3">
                  <label for="new-emp-role" class="form-label">Ruolo <span class="text-danger">*</span></label>
                  <input
                    id="new-emp-role"
                    v-model="selectedRole"
                    type="text"
                    :class="['form-control', roleError ? 'is-invalid' : '']"
                    placeholder="Impiegato"
                    @input="roleError = false"
                  />
                  <div v-if="roleError" class="invalid-feedback">Il ruolo è obbligatorio.</div>
                </div>
              </template>

              <div v-if="saveError" class="alert alert-danger mt-3 mb-0 py-2 small">
                <i class="bi bi-exclamation-triangle-fill me-1" />{{ saveError }}
              </div>
            </div>

            <div class="modal-footer">
              <AppButton
                variant="secondary"
                :disabled="saving"
                @click="emit('close')"
              >Annulla</AppButton>
              <AppButton
                v-if="mode === 'search'"
                variant="primary"
                :disabled="saving || !selectedSearchPerson || !selectedRole.trim()"
                @click="onAddSearchPerson"
              >
                <span
                  v-if="saving"
                  class="spinner-border spinner-border-sm me-1"
                  role="status"
                />
                Aggiungi
              </AppButton>
              <AppButton
                v-if="mode === 'create'"
                variant="primary"
                :disabled="saving"
                @click="onCreatePerson"
              >
                <span
                  v-if="saving"
                  class="spinner-border spinner-border-sm me-1"
                  role="status"
                />
                Crea e aggiungi
              </AppButton>
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

.modal-footer {
  background-color: transparent !important;
  border-top: 1px solid rgba(0, 0, 0, 0.1) !important;
}

[data-theme="dark"] .modal-content {
  background-color: var(--card) !important;
  color: var(--text-primary) !important;
  border: 1px solid #334155 !important;
}

[data-theme="dark"] .modal-header {
  border-bottom-color: #334155 !important;
}

[data-theme="dark"] .modal-footer {
  border-top-color: #334155 !important;
}

[data-theme="dark"] .btn-close {
  filter: brightness(0.8);
}

.employee-list-scroll,
.person-list-scroll {
  max-height: 132px;
  overflow-y: auto;
}

.employee-list-scroll .list-group-item,
.person-list-scroll .list-group-item {
  cursor: pointer;
}

.btn-icon-delete-local {
  background: transparent !important;
  border: none !important;
  color: var(--icon-color, #dc3545) !important;
  padding: 4px 8px !important;
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.2s ease;
  font-size: 1.2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-icon-delete-local:hover:not(:disabled) {
  opacity: 0.7;
  transform: scale(1.1);
}

.btn-icon-delete-local:disabled {
  opacity: 0.3;
  cursor: default;
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
