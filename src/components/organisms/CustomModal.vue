<script setup>
/***
 * CustomModal — unica istanza montata a livello app (in App.vue).
 * Gestisce tutte le varianti: alert, confirm, prompt, addEmployee, removeEmployee, editActivity.
 * Lo stato reattivo vive nello store `dialog`; qui si renderizza e si emettono le risposte.
 */
import { computed, nextTick, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useDialogStore } from '@/stores/dialog.js'
import { lastClickY } from '@/utils/clickPosition.js'
import AppInput from '@/components/atoms/AppInput.vue'
import AppButton from '@/components/atoms/AppButton.vue'

const store = useDialogStore()

const promptInput = ref('')
const employeeInput = ref('')
const employeeSelect = ref('')
const activityNameInput = ref('')
const activityCategoryInput = ref('')
const categories = ref([])
const categorySearch = ref('')

import { api } from '@/services/api.js'
watch(
  () => [store.open, store.variant],
  async ([open, variant]) => {
    if (open && variant === 'editActivity') {
      categories.value = await api.getCategories()
    }
  }
)

const filteredCategories = computed(() => {
  const term = categorySearch.value.toLowerCase()
  return categories.value.filter((c) => c.name.toLowerCase().includes(term))
})
const filteredCategoriesAll = computed(() => filteredCategories.value)
const invalid = ref({ prompt: false, employee: false, select: false, name: false, category: false })

const promptInputRef = ref(/** @type {HTMLInputElement|null} */ (null))
const employeeInputRef = ref(/** @type {HTMLInputElement|null} */ (null))
const employeeSelectRef = ref(/** @type {HTMLSelectElement|null} */ (null))
const activityNameRef = ref(/** @type {HTMLInputElement|null} */ (null))

const showCancel = computed(() => store.variant !== 'alert')
const confirmLabel = computed(() => {
  switch (store.variant) {
    case 'confirm': return 'Sì'
    case 'addEmployee': return 'Aggiungi'
    case 'removeEmployee': return 'Rimuovi'
    case 'editActivity': return 'Salva'
    case 'prompt': return 'Conferma'
    default: return 'OK'
  }
})
const cancelLabel = computed(() => (store.variant === 'confirm' ? 'No' : 'Annulla'))

/*** Posiziona la modale vicino al punto del click. */
const dialogStyle = computed(() => {
  const y = lastClickY.value
  if (y > 0) {
    const offset = Math.max(20, Math.min(y - 80, window.innerHeight - 300))
    return { position: 'fixed', top: offset + 'px', left: '50%', transform: 'translateX(-50%)', margin: '0' }
  }
  return {}
})

  const dialogClass = computed(() => {
    const base = lastClickY.value > 0 ? 'modal-dialog' : 'modal-dialog modal-dialog-centered'
    return store.variant === 'editActivity' ? `${base} modal-xl` : base
  })

function resetLocalState() {
  promptInput.value = store.defaultValue || ''
  employeeInput.value = ''
  employeeSelect.value = ''
  activityNameInput.value = store.activityName || ''
  categorySearch.value = ''
  invalid.value = { prompt: false, employee: false, select: false, name: false, category: false }
}

function handleConfirm() {
  switch (store.variant) {
    case 'alert':
      store.resolve(undefined)
      return
    case 'confirm':
      store.resolve(true)
      return
    case 'prompt': {
      const value = promptInput.value
      if (!value) {
        invalid.value.prompt = true
        promptInputRef.value?.focus()
        return
      }
      store.resolve(value)
      return
    }
    case 'addEmployee': {
      const value = employeeInput.value.trim()
      if (!value) {
        invalid.value.employee = true
        employeeInputRef.value?.focus()
        return
      }
      store.resolve(value)
      return
    }
    case 'removeEmployee': {
      const value = employeeSelect.value
      if (!value) {
        invalid.value.select = true
        employeeSelectRef.value?.focus()
        return
      }
      store.resolve(value)
      return
    }
    case 'editActivity': {
      const name = activityNameInput.value.trim()
      const category = activityCategoryInput.value.trim()
      const nextInvalid = { ...invalid.value, name: !name, category: !category }
      invalid.value = nextInvalid
      if (!name || !category) {
        if (!name) activityNameRef.value?.focus()
        return
      }
      store.resolve({ name, category })
      return
    }
  }
}

function handleCancel() {
  store.cancel()
}

function onKeydown(event) {
  if (event.key === 'Enter') {
    event.preventDefault()
    handleConfirm()
  } else if (event.key === 'Escape') {
    event.preventDefault()
    handleCancel()
  }
}

watch(
  () => store.open,
  async (open) => {
    if (open) {
      resetLocalState()
      await nextTick()
      if (store.variant === 'prompt') promptInputRef.value?.focus()
      else if (store.variant === 'addEmployee') employeeInputRef.value?.focus()
      else if (store.variant === 'removeEmployee') employeeSelectRef.value?.focus()
      else if (store.variant === 'editActivity') activityNameRef.value?.focus()
    }
  }
)

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="store.open"
        id="custom-modal"
        class="modal fade show d-block"
        tabindex="-1"
        role="dialog"
        aria-modal="true"
        @click.self="handleCancel"
      >
        <div :class="dialogClass" :style="dialogStyle" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ store.title }}</h5>
              <button
                type="button"
                class="btn-close"
                aria-label="Chiudi"
                @click="handleCancel"
              />
            </div>

            <div class="modal-body">

              <p v-if="store.variant === 'alert' || store.variant === 'confirm'">
                {{ store.message }}
              </p>

              <div v-else-if="store.variant === 'prompt'">
                <label for="prompt-input" class="form-label">{{ store.message }}</label>
                <AppInput
                  id="prompt-input"
                  ref="promptInputRef"
                  v-model="promptInput"
                  :invalid="invalid.prompt"
                />
              </div>

              <div v-else-if="store.variant === 'addEmployee'">
                <label for="employee-input" class="form-label">Nome del dipendente</label>
                <AppInput
                  id="employee-input"
                  ref="employeeInputRef"
                  v-model="employeeInput"
                  placeholder="Inserisci il nome"
                  :invalid="invalid.employee"
                  @input="invalid.employee = false"
                />
              </div>

              <div v-else-if="store.variant === 'removeEmployee'">
                <label for="employee-select" class="form-label">Seleziona dipendente</label>
                <select
                  id="employee-select"
                  ref="employeeSelectRef"
                  v-model="employeeSelect"
                  :class="['form-select', invalid.select ? 'is-invalid' : '']"
                  @change="invalid.select = false"
                >
                  <option value="">-- Seleziona --</option>
                  <option v-for="emp in store.employeeOptions" :key="emp" :value="emp">
                    {{ emp }}
                  </option>
                </select>
              </div>

              <template v-else-if="store.variant === 'editActivity'">
                <div class="row g-4">
                  <div class="col-md-6">
                    <label for="activity-name-input" class="form-label">Nome attività</label>
                    <AppInput
                      id="activity-name-input"
                      ref="activityNameRef"
                      v-model="activityNameInput"
                      :invalid="invalid.name"
                      @input="invalid.name = false"
                    />
                  </div>
                  <div class="col-md-6">
                    <label for="activity-category-search" class="form-label">Categoria</label>
                    <AppInput
                      id="activity-category-search"
                      v-model="categorySearch"
                      placeholder="Cerca…"
                      :invalid="invalid.category"
                      @input="invalid.category = false"
                    />
                    <ul class="list-group mt-1 activity-category-list">
                      <li
                        v-for="cat in filteredCategoriesAll"
                        :key="cat.id"
                        class="list-group-item list-group-item-action"
                        @click="activityCategoryInput = cat.name; categorySearch = cat.name; invalid.category = false"
                      >{{ cat.name }}</li>
                    </ul>
                  </div>
                </div>
              </template>
            </div>

            <div class="modal-footer">
              <AppButton
                v-if="showCancel"
                variant="secondary"
                @click="handleCancel"
              >{{ cancelLabel }}</AppButton>
              <AppButton variant="primary" @click="handleConfirm">{{ confirmLabel }}</AppButton>
            </div>
          </div>
        </div>
      </div>
    </Transition>
    <div v-if="store.open" class="modal-backdrop fade show" @click="handleCancel" />
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

:global([data-theme="dark"]) .modal-content {
    background-color: var(--card) !important;
    color: var(--text-primary) !important;
    border: 1px solid #334155 !important;
}

:global([data-theme="dark"]) .modal-header {
    background-color: transparent !important;
    border-bottom-color: #334155 !important;
}

:global([data-theme="dark"]) .modal-title {
    color: #f8fafc;
}

:global([data-theme="dark"]) .modal-body {
    background-color: transparent !important;
    color: #f8fafc !important;
}

:global([data-theme="dark"]) .modal-body label {
    color: #f8fafc;
}

:global([data-theme="dark"]) .btn-close {
    filter: brightness(0.8);
}

:global([data-theme="dark"]) .modal-footer {
    background-color: transparent !important;
    border-top-color: #334155 !important;
}

.activity-category-list {
    max-height: 150px;
    overflow-y: auto;
    -ms-overflow-style: none;
    scrollbar-width: none;
}
.activity-category-list::-webkit-scrollbar {
    display: none;
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
