<script setup>
/***
 * CategoryDetailView — dettaglio categoria con scaglioni fiscali.
 * Doppio click sul nome o icona matita apre la modifica.
 */
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth.js'
import { useDialog } from '@/composables/useDialog.js'
import { api } from '@/services/api.js'
import DashboardLayout from '@/components/templates/DashboardLayout.vue'
import PageHeader from '@/components/organisms/PageHeader.vue'
import AppCard from '@/components/atoms/AppCard.vue'
import AppIconButton from '@/components/atoms/AppIconButton.vue'
import CategoryEditModal from '@/components/organisms/CategoryEditModal.vue'

/***
 * Formatta un numero come importo senza decimali.
 * @param {number} n
 * @returns {string}
 */
function fmt(n) {
  if (typeof n !== 'number' || Number.isNaN(n)) return '—'
  return n.toLocaleString('it-IT')
}

const route = useRoute()
const router = useRouter()
const { hasAnyRole } = useAuth()
const dialog = useDialog()

const category = ref(/** @type {import('@/domain/models').Category|null} */ (null))
const loading = ref(false)
const error = ref(false)
const showEditModal = ref(false)

const id = computed(() => route.params.id)

const canEdit = computed(() => hasAnyRole(['government', 'admin']))
const canDelete = computed(() => hasAnyRole(['admin']))

/**
 * Descrizione testuale degli scaglioni.
 * @type {import('vue').ComputedRef<Array<{ range: string, rate: number }>>}
 */
const bracketLabels = computed(() => {
  const taxes = category.value?.categoryTaxes || []
  if (taxes.length === 0) return []
  return taxes.map((t, i) => {
    const next = taxes[i + 1]
    const curr = fmt(t.amount)
    let range
    if (i === 0 && t.amount === 0) {
      range = next ? `fino a ${fmt(next.amount)} $` : `${curr} $`
    } else if (!next) {
      range = `oltre ${curr} $`
    } else {
      range = `da ${curr} a ${fmt(next.amount)} $`
    }
    return { range, rate: t.rate }
  })
})

async function load() {
  loading.value = true
  error.value = null
  try {
    category.value = await api.getCategoryById(id.value)
    if (!category.value) {
      router.push({ name: 'dashboard-government' })
    }
  } catch (err) {
    error.value = true
    category.value = null
    console.error('[CategoryDetail] Errore caricamento categoria:', err)
  } finally {
    loading.value = false
  }
}

function onEdit() {
  if (category.value) showEditModal.value = true
}

function onEditSaved() {
  showEditModal.value = false
  load()
}

function onEditClosed() {
  showEditModal.value = false
}

async function onDelete() {
  if (!category.value) return
  const confirmed = await dialog.confirm(
    'Eliminare categoria?',
    `Sei sicuro di voler eliminare la categoria "${category.value.name}"? Questa azione non può essere annullata.`
  )
  if (!confirmed) return
  try {
    await api.deleteCategory(category.value.id)
    await dialog.alert('Successo', 'Categoria eliminata.')
    router.push({ name: 'dashboard-government' })
  } catch (err) {
    console.error('[CategoryDetail] Errore eliminazione categoria:', err)
    await dialog.alert('Errore', 'Impossibile eliminare la categoria. Riprova più tardi.')
  }
}

onMounted(load)
watch(id, load)
</script>

<template>
  <DashboardLayout>
    <div class="category-detail-page">
      <PageHeader
        title="Dettaglio Categoria"
        subtitle="Informazioni sulla categoria e fasce fiscali"
        back-to="/dashboard"
        :show-back="true"
      >
        <template #actions>
          <AppIconButton v-if="canDelete" title="Elimina categoria" @click="onDelete" />
        </template>
      </PageHeader>

      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Caricamento…</span>
        </div>
      </div>

      <AppCard v-else-if="error" class="p-4">
        <div class="alert alert-danger mb-0">
          <i class="bi bi-exclamation-triangle-fill me-2" />Impossibile caricare la categoria. Verifica che il backend sia in esecuzione.
        </div>
      </AppCard>

      <AppCard v-else-if="category" id="category-detail" class="p-4 position-relative">
        <div class="d-flex align-items-start justify-content-between">
          <h3>{{ category.name }}</h3>
          <AppIconButton
            v-if="canEdit"
            icon="pencil-square"
            title="Modifica categoria"
            aria-label="Modifica categoria"
            @click="onEdit"
          />
        </div>

        <div class="tax-brackets-detail mb-3">
          <p class="text-muted small mb-2">
            <i class="bi bi-layers me-1" />Fasce fiscali
          </p>
          <div
            v-for="(b, i) in bracketLabels"
            :key="i"
            class="bracket-row d-flex justify-content-between align-items-center py-1"
          >
            <span class="bracket-range small">{{ b.range }}</span>
            <span class="bracket-rate fw-semibold ms-2">{{ b.rate }}%</span>
          </div>
        </div>
      </AppCard>

      <CategoryEditModal
        v-if="showEditModal && category"
        :category="category"
        @close="onEditClosed"
        @saved="onEditSaved"
      />
    </div>
  </DashboardLayout>
</template>

<style scoped>
.tax-brackets-detail {
  background: var(--bg, #f8fafc);
  border-radius: 8px;
  padding: 12px 16px;
  max-width: 400px;
}

.bracket-row + .bracket-row {
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.bracket-range {
  color: var(--text-muted, #6b7280);
}

.bracket-rate {
  color: var(--text-primary, #111827);
  white-space: nowrap;
}

[data-theme="dark"] .tax-brackets-detail {
  background: rgba(255, 255, 255, 0.04);
}

[data-theme="dark"] .bracket-row + .bracket-row {
  border-top-color: rgba(255, 255, 255, 0.08);
}
</style>
