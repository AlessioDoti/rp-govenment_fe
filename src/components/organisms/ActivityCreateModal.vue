<script setup>
/***
 * ActivityCreateModal — modale per creare una nuova attività con nome, categoria e dipendenti.
 * Riutilizza i pattern delle modali di modifica (CategoryEditModal, EmployeeManagerModal).
 *
 * @emit close — chiude la modale senza salvare
 * @emit saved — attività creata con successo (il parent può ricaricare la lista)
 */
import { ref, computed, onMounted } from 'vue'
import { api } from '@/services/api.js'

import AppInput from '@/components/atoms/AppInput.vue'
import AppButton from '@/components/atoms/AppButton.vue'

const emit = defineEmits(['close', 'saved'])

/* ── Stato ──────────────────────────────────────────── */
const name = ref('')
const nameError = ref(false)

const address = ref('')
const addressError = ref(false)

const categories = ref(/** @type {import('@/domain/models').Category[]} */ ([]))
const categoriesLoading = ref(false)
const selectedCategoryId = ref(null)
const categoryError = ref(false)

/** @type {import('vue').Ref<Array<{ employeeUuid: string, role: string, name: string, surname: string, temporary: boolean }>>} */
const pendingEmployees = ref([])

const saving = ref(false)
const saveError = ref(/** @type {string|null} */ (null))

/* ── Employee search/create state (riusa pattern EmployeeManagerModal) ── */
const mode = ref('search')

const allPeople = ref(/** @type {Array<{ id: number, name: string, surname: string, externalUuid: string }>} */ ([]))
const loading = ref(false)
const loadError = ref(/** @type {string|null} */ (null))
const filterText = ref('')
const selectedSearchPerson = ref(/** @type {string|null} */ (null))
const selectedRole = ref('')
const roleError = ref(false)

const newName = ref('')
const newSurname = ref('')
const newBirthDate = ref('')
const newNameError = ref(false)
const newSurnameError = ref(false)
const newBirthDateError = ref(false)

/* ── Computed ────────────────────────────────────────── */
const dialogClass = 'modal-dialog modal-lg modal-dialog-centered'

const filteredPeople = computed(() => {
  const q = filterText.value.trim().toLowerCase()
  if (!q) return allPeople.value
  return allPeople.value.filter((p) =>
    p.name.toLowerCase().includes(q) || p.surname.toLowerCase().includes(q)
  )
})

const canSave = computed(() => {
  return name.value.trim() && selectedCategoryId.value && !saving.value
})

/* ── Lifecycle ───────────────────────────────────────── */
onMounted(async () => {
  categoriesLoading.value = true
  try {
    categories.value = await api.getCategories()
  } catch {
    categories.value = []
  } finally {
    categoriesLoading.value = false
  }
  loadPeople()
})

async function loadPeople() {
  loading.value = true
  loadError.value = null
  try {
    const result = await api.searchPersons({}, { page: 0, size: 100 })
    allPeople.value = result.data
  } catch (err) {
    loadError.value = 'Impossibile caricare la lista delle persone.'
    console.error('[ActivityCreateModal] Errore caricamento persone:', err)
  } finally {
    loading.value = false
  }
}

/* ── Employee management ─────────────────────────────── */

/*** Aggiunge una persona esistente alla lista pending. */
function addExistingPerson() {
  if (!selectedSearchPerson.value) return
  if (!selectedRole.value.trim()) {
    roleError.value = true
    return
  }
  roleError.value = false

  const person = allPeople.value.find((p) => p.externalUuid === selectedSearchPerson.value)
  if (!person) return

  // Evita duplicati
  if (pendingEmployees.value.some((e) => e.employeeUuid === person.externalUuid)) return

  pendingEmployees.value.push({
    employeeUuid: person.externalUuid,
    role: selectedRole.value.trim(),
    name: person.name,
    surname: person.surname,
    temporary: false
  })

  // Reset selezione
  selectedSearchPerson.value = null
  selectedRole.value = ''
}

/*** Crea una nuova persona e la aggiunge alla lista pending. */
async function createAndAddPerson() {
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

    pendingEmployees.value.push({
      employeeUuid: person.externalUuid,
      role: selectedRole.value.trim(),
      name: newName.value.trim(),
      surname: newSurname.value.trim(),
      temporary: false
    })

    // Reset form
    newName.value = ''
    newSurname.value = ''
    newBirthDate.value = ''
    selectedRole.value = ''
    mode.value = 'search'
  } catch (err) {
    console.error('[ActivityCreateModal] Errore creazione persona:', err)
    saveError.value = 'Impossibile creare la persona.'
  } finally {
    saving.value = false
  }
}

function removePendingEmployee(uuid) {
  pendingEmployees.value = pendingEmployees.value.filter((e) => e.employeeUuid !== uuid)
}

/* ── Save ────────────────────────────────────────────── */
async function save() {
  nameError.value = !name.value.trim()
  categoryError.value = !selectedCategoryId.value
  if (nameError.value || categoryError.value) return

  saving.value = true
  saveError.value = null
  try {
    const activity = await api.createActivity(name.value.trim(), Number(selectedCategoryId.value), Number(address.value) || 0)

    if (pendingEmployees.value.length > 0) {
      const employeesPayload = pendingEmployees.value.map((e) => ({
        employeeUuid: e.employeeUuid,
        role: e.role
      }))
      await api.updateActivity(activity.id, { employees: employeesPayload })
    }

    emit('saved')
  } catch (err) {
    console.error('[ActivityCreateModal] Errore creazione attività:', err)
    saveError.value = 'Impossibile creare l\'attività. Verifica che i servizi siano in esecuzione.'
  } finally {
    saving.value = false
  }
}

defineExpose({
  pendingEmployees,
  filterText,
  selectedRole,
  selectedSearchPerson,
  mode,
  addExistingPerson,
  removePendingEmployee,
  createAndAddPerson
})
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
        <div :class="dialogClass" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Nuova attività</h5>
              <button
                type="button"
                class="btn-close"
                aria-label="Chiudi"
                @click="emit('close')"
              />
            </div>

            <div class="modal-body">

              <!-- Nome attività -->
              <div class="mb-3">
                <label for="act-name" class="form-label">Nome attività <span class="text-danger">*</span></label>
                <AppInput
                  id="act-name"
                  v-model="name"
                  placeholder="es. Ristorante Bella Vita"
                  :invalid="nameError"
                  @input="nameError = false"
                />
              </div>

              <!-- Civico -->
              <div class="mb-3">
                <label for="act-address" class="form-label">Civico</label>
                <AppInput
                  id="act-address"
                  v-model="address"
                  type="number"
                  placeholder="es. 12"
                  :invalid="addressError"
                  @input="addressError = false"
                />
              </div>

              <!-- Categoria (stile lista persone) -->
              <div class="mb-3">
                <label class="form-label">Categoria <span class="text-danger">*</span></label>
                <div v-if="categoriesLoading" class="text-center py-2">
                  <div class="spinner-border spinner-border-sm text-primary" role="status">
                    <span class="visually-hidden">Caricamento…</span>
                  </div>
                </div>
                <div v-else-if="categories.length === 0" class="text-muted small py-2">
                  Nessuna categoria disponibile.
                </div>
                <template v-else>
                  <div v-if="categoryError" class="text-danger small mb-1">Seleziona una categoria.</div>
                  <ul id="act-category" class="list-group person-list-scroll">
                    <li
                      v-for="cat in categories"
                      :key="cat.id"
                      :class="['list-group-item', 'list-group-item-action', selectedCategoryId === cat.id ? 'list-group-item-primary' : '']"
                      @click="selectedCategoryId = selectedCategoryId === cat.id ? null : cat.id; categoryError = false"
                    >
                      <strong>{{ cat.name }}</strong>
                    </li>
                  </ul>
                </template>
              </div>

              <!-- Dipendenti -->
              <div class="mb-2 mt-4">
                <label class="form-label fw-semibold">Dipendenti</label>
              </div>

              <!-- Lista dipendenti pending -->
              <div v-if="pendingEmployees.length > 0" class="mb-3">
                <ul class="list-group">
                  <li
                    v-for="emp in pendingEmployees"
                    :key="emp.employeeUuid"
                    class="list-group-item d-flex justify-content-between align-items-center py-1"
                  >
                    <span>
                      <strong>{{ emp.name }} {{ emp.surname }}</strong>
                      <span class="text-muted small ms-2">({{ emp.role }})</span>
                    </span>
                    <button
                      type="button"
                      class="btn btn-outline-danger btn-sm"
                      title="Rimuovi dipendente"
                      :disabled="saving"
                      @click="removePendingEmployee(emp.employeeUuid)"
                    >
                      <i class="bi bi-trash" />
                    </button>
                  </li>
                </ul>
              </div>

              <!-- Tab selector: esistente / nuova -->
              <div class="btn-group w-100 mb-3" role="group">
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

              <!-- Ricerca persona esistente -->
              <template v-if="mode === 'search'">
                <div v-if="loading" class="text-center py-3">
                  <div class="spinner-border spinner-border-sm text-primary" role="status">
                    <span class="visually-hidden">Caricamento…</span>
                  </div>
                  <p class="text-muted small mt-1 mb-0">Caricamento persone…</p>
                </div>

                <div v-else-if="loadError" class="alert alert-warning mb-2 py-2 small">
                  <i class="bi bi-exclamation-triangle-fill me-1" />{{ loadError }}
                </div>

                <template v-else>
                  <div class="mb-2">
                    <label for="emp-filter" class="form-label">Filtra persone</label>
                    <AppInput
                      id="emp-filter"
                      v-model="filterText"
                      placeholder="Cerca per nome o cognome…"
                    />
                  </div>

                  <div class="mb-2">
                    <label for="emp-search-role" class="form-label">Ruolo <span class="text-danger">*</span></label>
                    <input
                      id="emp-search-role"
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

                  <ul v-else class="list-group person-list-scroll mb-2">
                    <li
                      v-for="person in filteredPeople"
                      :key="person.externalUuid"
                      :class="['list-group-item', 'list-group-item-action', selectedSearchPerson === person.externalUuid ? 'list-group-item-primary' : '']"
                      @click="selectedSearchPerson = selectedSearchPerson === person.externalUuid ? null : person.externalUuid"
                    >
                      <strong>{{ person.name }} {{ person.surname }}</strong>
                    </li>
                  </ul>

                  <AppButton
                    variant="outline-primary"
                    size="sm"
                    :disabled="!selectedSearchPerson || !selectedRole.trim()"
                    @click="addExistingPerson"
                  >
                    <i class="bi bi-plus-lg me-1" />Aggiungi dipendente
                  </AppButton>
                </template>
              </template>

              <!-- Crea nuova persona -->
              <template v-if="mode === 'create'">
                <div class="mb-2">
                  <label for="new-emp-name" class="form-label">Nome <span class="text-danger">*</span></label>
                  <input
                    id="new-emp-name"
                    v-model="newName"
                    type="text"
                    :class="['form-control', newNameError ? 'is-invalid' : '']"
                    placeholder="Mario"
                    @input="newNameError = false"
                  />
                  <div v-if="newNameError" class="invalid-feedback">Il nome è obbligatorio.</div>
                </div>

                <div class="mb-2">
                  <label for="new-emp-surname" class="form-label">Cognome <span class="text-danger">*</span></label>
                  <input
                    id="new-emp-surname"
                    v-model="newSurname"
                    type="text"
                    :class="['form-control', newSurnameError ? 'is-invalid' : '']"
                    placeholder="Rossi"
                    @input="newSurnameError = false"
                  />
                  <div v-if="newSurnameError" class="invalid-feedback">Il cognome è obbligatorio.</div>
                </div>

                <div class="mb-2">
                  <label for="new-emp-birth" class="form-label">Data di nascita <span class="text-danger">*</span></label>
                  <input
                    id="new-emp-birth"
                    v-model="newBirthDate"
                    type="date"
                    :class="['form-control', newBirthDateError ? 'is-invalid' : '']"
                    @input="newBirthDateError = false"
                  />
                  <div v-if="newBirthDateError" class="invalid-feedback">La data di nascita è obbligatoria.</div>
                </div>

                <div class="mb-2">
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

                <AppButton
                  variant="outline-primary"
                  size="sm"
                  :disabled="saving"
                  @click="createAndAddPerson"
                >
                  <span
                    v-if="saving"
                    class="spinner-border spinner-border-sm me-1"
                    role="status"
                  />
                  <i class="bi bi-plus-lg me-1" />Crea e aggiungi
                </AppButton>
              </template>

              <!-- Error save -->
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
                variant="primary"
                :disabled="!canSave"
                @click="save"
              >
                <span
                  v-if="saving"
                  class="spinner-border spinner-border-sm me-1"
                  role="status"
                />
                Crea attività
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

.person-list-scroll {
    max-height: 132px;
    overflow-y: auto;
}

.person-list-scroll .list-group-item {
    cursor: pointer;
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
