<script setup>
/***
 * Activity detail view with employees and taxes lists.
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
import EmployeeList from '@/components/molecules/EmployeeList.vue'
import TaxList from '@/components/molecules/TaxList.vue'
import CardPagination from '@/components/molecules/CardPagination.vue'
import EmployeeManagerModal from '@/components/organisms/EmployeeManagerModal.vue'
import AddTaxModal from '@/components/organisms/AddTaxModal.vue'

const route = useRoute()
const router = useRouter()
const { session, hasAnyRole, role } = useAuth()
const dialog = useDialog()

const activity = ref(/** @type {import('@/domain/models').Activity|null} */ (null))
const loading = ref(false)
const error = ref(false)
const showEmployeeModal = ref(false)

/** @type {import('vue').Ref<Array<{ employeeUuid: string, role: string, name: string, surname: string }>>} */
const employees = ref([])
/** @type {import('vue').Ref<Array<{ taxAmount: number, declarationDate: string, payed: boolean, managerName: string }>>} */
const taxes = ref([])

/* Employee pagination */
const EMP_PAGE_SIZE = 10
const empPage = ref(0)
const empDirection = ref(1) // 1 forward, -1 backward

const totalEmpPages = computed(() => Math.max(1, Math.ceil(employees.value.length / EMP_PAGE_SIZE)))

const paginatedEmployees = computed(() => {
  const start = empPage.value * EMP_PAGE_SIZE
  return employees.value.slice(start, start + EMP_PAGE_SIZE)
})

function prevEmpPage() {
  if (empPage.value <= 0) return
  empDirection.value = -1
  empPage.value--
}

function nextEmpPage() {
  if (empPage.value >= totalEmpPages.value - 1) return
  empDirection.value = 1
  empPage.value++
}

watch(employees, () => {
  empPage.value = 0
  empDirection.value = 1
})

/* Tax pagination */
const TAX_PAGE_SIZE = 6
const taxPage = ref(0)
const taxDirection = ref(1)

const totalTaxPages = computed(() => Math.max(1, Math.ceil(taxes.value.length / TAX_PAGE_SIZE)))

const paginatedTaxes = computed(() => {
  const start = taxPage.value * TAX_PAGE_SIZE
  return taxes.value.slice(start, start + TAX_PAGE_SIZE)
})

function prevTaxPage() {
  if (taxPage.value <= 0) return
  taxDirection.value = -1
  taxPage.value--
}

function nextTaxPage() {
  if (taxPage.value >= totalTaxPages.value - 1) return
  taxDirection.value = 1
  taxPage.value++
}

watch(taxes, () => {
  taxPage.value = 0
  taxDirection.value = 1
})

/* Add tax modal */
const showAddTaxModal = ref(false)

function onAddTax() {
  showAddTaxModal.value = true
}

function onAddTaxModalSaved() {
  showAddTaxModal.value = false
  load()
}

function onAddTaxModalClosed() {
  showAddTaxModal.value = false
}

const canTogglePayed = computed(() => isAdmin.value || isGovernment.value)

async function onTogglePayed(tax) {
  try {
    const newPayed = !tax.payed
    await api.updateTax(tax.taxId, { payed: newPayed })
    // Update local state immediately
    const found = taxes.value.find((t) => t.taxId === tax.taxId)
    if (found) found.payed = newPayed
  } catch (err) {
    console.error('[ActivityDetail] Errore aggiornamento tassa:', err)
  }
}

const PERSON_CACHE = new Map()

const id = computed(() => route.params.id)

const isManager = computed(() =>
  role.value === 'activity' && activity.value?.manager && session.value?.username === activity.value.manager
)
const isAdmin = computed(() => role.value === 'admin')
const isGovernment = computed(() => hasAnyRole(['government', 'admin']))

/**
 * @param {string} amount
 * @returns {string}
 */
function fmtAmount(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return '—'
  return Number(amount).toLocaleString('it-IT') + ' $'
}

/**
 * @param {string} dateStr
 * @returns {string}
 */
function fmtDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('it-IT')
}

/**
 * @param {string} uuid
 * @returns {Promise<{ name: string, surname: string }|null>}
 */
async function resolvePerson(uuid) {
  if (!uuid) return null
  if (PERSON_CACHE.has(uuid)) return PERSON_CACHE.get(uuid)
  const person = await api.getPersonByUuid(uuid)
  PERSON_CACHE.set(uuid, person)
  return person
}

function categoryName(act) {
  if (act.categoryName) return act.categoryName
  return String(act.category)
}

async function load() {
  loading.value = true
  error.value = null
  try {
    const act = await api.getActivityById(id.value)
    if (!act) {
      router.push({ name: 'dashboard-government' })
      return
    }
    activity.value = act

    // Resolve employee names
    const empUuids = (act.employees || []).map((e) => e.employeeUuid).filter(Boolean)
    const empResults = await Promise.all(empUuids.map((uuid) => resolvePerson(uuid)))
    const empMap = new Map()
    empUuids.forEach((uuid, i) => { empMap.set(uuid, empResults[i]) })

    employees.value = (act.employees || []).map((e) => {
      const p = empMap.get(e.employeeUuid)
      return {
        employeeUuid: e.employeeUuid,
        role: e.role || 'EMPLOYEE',
        name: p?.name || e.employeeUuid,
        surname: p?.surname || ''
      }
    })

    // Fetch taxes
    const rawTaxes = await api.getTaxesByActivity(id.value)
    const managerUuids = rawTaxes.map((t) => t.manager).filter(Boolean)
    const taxResults = await Promise.all(managerUuids.map((uuid) => resolvePerson(uuid)))
    const taxManagerMap = new Map()
    managerUuids.forEach((uuid, i) => { taxManagerMap.set(uuid, taxResults[i]) })

    taxes.value = rawTaxes.map((t) => {
      const p = taxManagerMap.get(t.manager)
      const mgrName = p ? `${p.name} ${p.surname}` : t.manager || '—'
      return {
        taxId: t.taxId,
        taxAmount: t.taxAmount,
        declarationDate: t.declarationDate,
        payed: t.payed,
        managerName: mgrName
      }
    })
  } catch (err) {
    error.value = true
    activity.value = null
    employees.value = []
    taxes.value = []
    console.error('[ActivityDetail] Errore caricamento:', err)
  } finally {
    loading.value = false
  }
}

function onAddEmployee() {
  showEmployeeModal.value = true
}

function onEmployeeModalSaved() {
  showEmployeeModal.value = false
  load()
}

function onEmployeeModalClosed() {
  showEmployeeModal.value = false
}

async function onRemoveEmployee() {
  await dialog.alert(
    'Gestione dipendenti',
    'La gestione dei dipendenti sarà integrata col backend in un prossimo step.'
  )
}

async function onEditActivity() {
  if (!activity.value) return
  const result = await dialog.editActivity(
    'Modifica attività',
    activity.value.name,
    categoryName(activity.value)
  )
  if (!result) return

  const allCategories = await api.getCategories()
  const category = allCategories.find((c) => c.name === result.category)
  /** @type {{ name?: string, category?: number }} */
  const patch = { name: result.name }
  if (category) patch.category = category.id

  try {
    await api.updateActivity(activity.value.id, patch)
    await dialog.alert('Successo', 'Attività aggiornata')
    load()
  } catch (err) {
    await dialog.alert('Errore', 'Impossibile aggiornare l\'attività.')
  }
}

async function onDelete() {
  if (!activity.value) return
  const confirmed = await dialog.confirm(
    'Eliminare attività?',
    `Sei sicuro di voler eliminare l'attività "${activity.value.name}"? Questa azione non può essere annullata.`
  )
  if (!confirmed) return
  try {
    await api.deleteActivity(activity.value.id)
    await dialog.alert('Successo', 'Attività eliminata.')
    router.push({ name: 'dashboard-government' })
  } catch (err) {
    await dialog.alert('Errore', 'Impossibile eliminare l\'attività. Riprova più tardi.')
  }
}

onMounted(load)
watch(id, load)
</script>

<template>
  <DashboardLayout>
    <div class="activity-detail-page">
      <PageHeader
        title="Dettaglio Attività"
        subtitle="Informazioni attività"
        back-to="/dashboard"
        :show-back="true"
      >
        <template #actions>
          <AppIconButton v-if="isAdmin" title="Elimina attività" @click="onDelete" />
        </template>
      </PageHeader>

      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Caricamento…</span>
        </div>
      </div>

      <AppCard v-else-if="error" class="p-4">
        <div class="alert alert-danger mb-0">
          <i class="bi bi-exclamation-triangle-fill me-2" />Impossibile caricare l'attività. Verifica che il backend sia in esecuzione.
        </div>
      </AppCard>

      <template v-else-if="activity">

        <AppCard id="activity-info" class="p-4 mb-4">
          <h3>{{ activity.name }}</h3>
          <p>Categoria: <strong>{{ categoryName(activity) }}</strong></p>
          <p v-if="activity.address != null">Civico: <strong>{{ activity.address }}</strong></p>

          <div class="mt-3 d-flex gap-2 flex-wrap">
          <AppIconButton
            v-if="isAdmin"
            icon="pencil-square"
            title="Modifica attività"
            @click="onEditActivity"
          />
          </div>
        </AppCard>

        <div class="row g-4">

          <div class="col-md-6">
            <AppCard class="p-4 h-100 d-flex flex-column">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h4 class="mb-0">
                  <i class="bi bi-people-fill me-2" />Dipendenti
                  <span class="badge bg-secondary ms-2">{{ employees.length }}</span>
                </h4>
                <AppIconButton
                  v-if="isAdmin"
                  icon="pencil-square"
                  :absolute="false"
                  title="Modifica dipendenti"
                  @click="onAddEmployee"
                />
              </div>
              <div v-if="employees.length === 0" class="text-muted small">
                Nessun dipendente assegnato.
              </div>
              <template v-else>
                <Transition :name="'slide-' + (empDirection > 0 ? 'fwd' : 'bwd')" mode="out-in">
                  <div :key="'emp-' + empPage">
                    <EmployeeList :employees="paginatedEmployees" />
                  </div>
                </Transition>
              </template>
              <CardPagination
                :page="empPage"
                :total-pages="totalEmpPages"
                @prev="prevEmpPage"
                @next="nextEmpPage"
              />
            </AppCard>
          </div>

          <div class="col-md-6">
            <AppCard class="p-4 h-100 d-flex flex-column">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h4 class="mb-0">
                  <i class="bi bi-currency-dollar me-2" />Tasse
                  <span class="badge bg-secondary ms-2">{{ taxes.length }}</span>
                </h4>
                <AppIconButton
                  v-if="isAdmin"
                  icon="plus"
                  title="Aggiungi tassa"
                  @click="onAddTax"
                />
              </div>
              <div v-if="taxes.length === 0" class="text-muted small">
                Nessuna tassa registrata.
              </div>
              <template v-else>
                <Transition :name="'slide-' + (taxDirection > 0 ? 'fwd' : 'bwd')" mode="out-in">
                  <div :key="'tax-' + taxPage">
                    <TaxList :taxes="paginatedTaxes" :can-toggle-payed="canTogglePayed" @toggle-payed="onTogglePayed" />
                  </div>
                </Transition>
              </template>

              <AddTaxModal
                v-if="showAddTaxModal"
                :activity-id="id"
                :employees="employees"
                @saved="onAddTaxModalSaved"
                @close="onAddTaxModalClosed"
              />

              <CardPagination
                :page="taxPage"
                :total-pages="totalTaxPages"
                @prev="prevTaxPage"
                @next="nextTaxPage"
              />
            </AppCard>
          </div>
        </div>
      </template>
    </div>

    <EmployeeManagerModal
      v-if="showEmployeeModal && activity"
      :activity-id="activity.id"
      :current-employees="activity.employees || []"
      @close="onEmployeeModalClosed"
      @saved="onEmployeeModalSaved"
    />
  </DashboardLayout>
</template>

<style scoped>
.employee-row {
  background: var(--bg, #f8fafc);
  border-radius: 8px;
}

.employee-row + .employee-row {
  margin-top: 4px;
}

.employee-name {
  font-weight: 500;
}

.employee-role {
  background: var(--bs-primary, #0d6efd);
  color: #fff;
  font-size: 0.75rem;
  padding: 2px 10px;
  border-radius: 12px;
}

[data-theme="dark"] .employee-row {
  background: rgba(255, 255, 255, 0.04);
}

/* Slide transitions */
.slide-fwd-enter-active,
.slide-fwd-leave-active,
.slide-bwd-enter-active,
.slide-bwd-leave-active {
  transition: all 0.25s ease;
}

.slide-fwd-enter-from {
  opacity: 0;
  transform: translateX(24px);
}

.slide-fwd-leave-to {
  opacity: 0;
  transform: translateX(-24px);
}

.slide-bwd-enter-from {
  opacity: 0;
  transform: translateX(-24px);
}

.slide-bwd-leave-to {
  opacity: 0;
  transform: translateX(24px);
}
</style>
