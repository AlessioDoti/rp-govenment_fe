<script setup>
/***
 * CategoryEditModal — modale per creare o modificare nome e fasce fiscali di una categoria.
 *
 * @prop {import('@/domain/models').Category|null} [category=null]
 *   categoria da modificare; se null/omesso il modale è in modalità "creazione".
 *
 * @emit close — chiude il modale senza salvare
 * @emit saved — operazione completata con successo (il parent può ricaricare)
 */
import { ref, computed } from 'vue'
import { api } from '@/services/api.js'
import { lastClickY } from '@/utils/clickPosition.js'

const props = defineProps({
  category: { type: Object, default: null }
})
const emit = defineEmits(['close', 'saved'])

const isNew = computed(() => !props.category)

const name = ref(props.category?.name ?? '')
const brackets = ref(
  props.category
    ? props.category.categoryTaxes.map((t) => ({ amount: t.amount, rate: t.rate }))
    : [{ amount: 0, rate: 0 }]
)
const saving = ref(false)
const nameError = ref(false)
const bracketErrors = ref(/** @type {boolean[]} */ ([]))
const saveError = ref(/** @type {string|null} */ (null))

const title = computed(() => (isNew.value ? 'Nuova categoria' : 'Modifica categoria'))
const saveLabel = computed(() => (isNew.value ? 'Crea' : 'Salva'))

/*** Stile dinamico per posizionare la modale vicino al punto del click. */
const dialogStyle = computed(() => {
  const y = lastClickY.value
  if (y > 0) {
    const offset = Math.max(20, Math.min(y - 80, window.innerHeight - 300))
    return { position: 'fixed', top: offset + 'px', left: '50%', transform: 'translateX(-50%)', margin: '0' }
  }
  return {}
})

const dialogClass = computed(() => {
  return lastClickY.value > 0 ? 'modal-dialog' : 'modal-dialog modal-dialog-centered'
})

function addBracket() {
  brackets.value.push({ amount: 0, rate: 0 })
}

function removeBracket(index) {
  brackets.value.splice(index, 1)
}

function validate() {
  nameError.value = !name.value.trim()
  bracketErrors.value = brackets.value.map(
    (b) => Number.isNaN(Number(b.amount)) || Number.isNaN(Number(b.rate))
  )
  return !nameError.value && bracketErrors.value.every((e) => !e)
}

async function save() {
  if (!validate()) return
  saving.value = true
  saveError.value = null
  try {
    const payload = {
      name: name.value.trim(),
      categoryTaxes: brackets.value.map((b) => ({
        amount: Number(b.amount),
        rate: Number(b.rate)
      }))
    }
    if (isNew.value) {
      await api.createCategory(payload.name, payload.categoryTaxes)
    } else {
      await api.updateCategory(props.category.id, payload)
    }
    emit('saved')
  } catch (err) {
    console.error('[CategoryEditModal] Errore salvataggio:', err)
    saveError.value = 'Impossibile salvare le modifiche. Riprova più tardi.'
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
        <div :class="dialogClass" :style="dialogStyle" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ title }}</h5>
              <button
                type="button"
                class="btn-close"
                aria-label="Chiudi"
                @click="emit('close')"
              />
            </div>

            <div class="modal-body">

              <div class="mb-3">
                <label for="cat-name" class="form-label">Nome categoria</label>
                <input
                  id="cat-name"
                  v-model="name"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': nameError }"
                  placeholder="es. Ristorazione"
                  @input="nameError = false"
                />
                <div v-if="nameError" class="invalid-feedback">
                  Il nome è obbligatorio.
                </div>
              </div>

              <div class="mb-2">
                <label class="form-label">Fasce fiscali</label>
              </div>

              <div
                v-for="(b, i) in brackets"
                :key="i"
                class="bracket-row mb-2"
              >
                <div class="row g-2 align-items-center">
                  <div class="col-5">
                    <input
                      v-model.number="b.amount"
                      type="number"
                      class="form-control form-control-sm"
                      :class="{ 'is-invalid': bracketErrors[i] }"
                      placeholder="Importo da"
                      min="0"
                      @input="bracketErrors[i] = false"
                    />
                  </div>
                  <div class="col-4">
                    <div class="input-group input-group-sm">
                      <input
                        v-model.number="b.rate"
                        type="number"
                        class="form-control"
                        :class="{ 'is-invalid': bracketErrors[i] }"
                        placeholder="Aliquota"
                        min="0"
                        max="100"
                        @input="bracketErrors[i] = false"
                      />
                      <span class="input-group-text">%</span>
                    </div>
                  </div>
                  <div class="col-3 d-flex gap-1">
                    <button
                      type="button"
                      class="btn btn-outline-danger btn-sm"
                      title="Rimuovi fascia"
                      :disabled="brackets.length <= 1"
                      @click="removeBracket(i)"
                    >
                      <i class="bi bi-trash" />
                    </button>
                    <button
                      v-if="i === brackets.length - 1"
                      type="button"
                      class="btn btn-outline-success btn-sm"
                      title="Aggiungi fascia"
                      @click="addBracket"
                    >
                      <i class="bi bi-plus-lg" />
                    </button>
                  </div>
                </div>
              </div>

              <p v-if="brackets.length === 0" class="text-muted small mb-0">
                Nessuna fascia. Aggiungine almeno una.
              </p>

              <div v-if="saveError" class="alert alert-danger mt-3 mb-0 py-2 small">
                <i class="bi bi-exclamation-triangle-fill me-1" />{{ saveError }}
              </div>
            </div>

            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                :disabled="saving"
                @click="emit('close')"
              >Annulla</button>
              <button
                type="button"
                class="btn btn-primary"
                :disabled="saving"
                @click="save"
              >
                <span
                  v-if="saving"
                  class="spinner-border spinner-border-sm me-1"
                  role="status"
                />
                {{ saveLabel }}
              </button>
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

.bracket-row + .bracket-row {
    margin-top: 0.25rem;
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

.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}
</style>
