<script setup>
/***
 * Dashboard for activity managers.
 *
 * - Se l'utente ha una sola attività → mostra il dettaglio direttamente.
 * - Se ne ha più di una → mostra una griglia di selezione (max 12 card con frecce).
 * - Dal dettaglio si torna indietro con un pulsante.
 */
import { ref, computed, onMounted, watch } from 'vue'
import { useAuth } from '@/composables/useAuth.js'
import { api } from '@/services/api.js'
import DashboardLayout from '@/components/templates/DashboardLayout.vue'
import AppCard from '@/components/atoms/AppCard.vue'
import AppIconButton from '@/components/atoms/AppIconButton.vue'
import EmployeeList from '@/components/molecules/EmployeeList.vue'
import TaxList from '@/components/molecules/TaxList.vue'
import CardPagination from '@/components/molecules/CardPagination.vue'
import EmployeeManagerModal from '@/components/organisms/EmployeeManagerModal.vue'
import AddTaxModal from '@/components/organisms/AddTaxModal.vue'

const MANAGEMENT_ROLES = ['manager', 'direttore', 'proprietario']
const ACT_PER_PAGE = 12

const { session } = useAuth()

/*** @type {'loading'|'no-activity'|'selection'|'detail'} */
const mode = ref('loading')

/*** @type {import('vue').Ref<import('@/domain/models').Activity[]>} */
const activities = ref([])
const actPage = ref(1)
const actDirection = ref(1)

const totalActPages = computed(() => Math.max(1, Math.ceil(activities.value.length / ACT_PER_PAGE)))

const paginatedActivities = computed(() => {
  const start = (actPage.value - 1) * ACT_PER_PAGE
  return activities.value.slice(start, start + ACT_PER_PAGE)
})

function prevActPage() {
  actDirection.value = -1
  if (actPage.value > 1) actPage.value--
}

function nextActPage() {
  actDirection.value = 1
  if (actPage.value < totalActPages.value) actPage.value++
}

watch(totalActPages, (tp) => {
  if (actPage.value > tp) actPage.value = tp
})

const selectedActivityId = ref(/** @type {number|null} */ (null))
const activity = ref(/** @type {import('@/domain/models').Activity|null} */ (null))
const detailLoading = ref(false)
const error = ref(false)
const showEmployeeModal = ref(false)
const canManage = ref(false)
const currentPersonUuid = ref('')

const PERSON_CACHE = new Map()

/* Employees */
/** @type {import('vue').Ref<Array<{ employeeUuid: string, role: string, name: string, surname: string }>>} */
const employees = ref([])

const EMP_PAGE_SIZE = 10
const empPage = ref(0)
const empDirection = ref(1)

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

/* Taxes */
/** @type {import('vue').Ref<Array<{ taxId: number, taxAmount: number, declarationDate: string, payed: boolean, managerName: string }>>} */
const taxes = ref([])

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
  loadDetail()
}

function onAddTaxModalClosed() {
  showAddTaxModal.value = false
}

/* Formatting */
function fmtAmount(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return '—'
  return Number(amount).toLocaleString('it-IT') + ' $'
}

function fmtDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('it-IT')
}

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

/**
 * Carica la lista di tutte le attività collegate all'utente.
 */
async function loadActivities() {
  mode.value = 'loading'
  try {
    const userId = session.value?.userId
    if (!userId) {
      mode.value = 'no-activity'
      return
    }
    const acts = await api.getActivitiesByUserId(userId)
    if (acts.length === 0) {
      mode.value = 'no-activity'
      return
    }
    activities.value = acts

    if (acts.length === 1) {
      selectedActivityId.value = acts[0].id
      await loadDetail()
      mode.value = 'detail'
    } else {
      mode.value = 'selection'
    }
  } catch {
    error.value = true
    mode.value = 'no-activity'
  }
}

/***
 * Carica il dettaglio dell'attività selezionata.
 * @param {boolean} [keepMode=false]
 */
async function loadDetail(keepMode = false) {
  const id = selectedActivityId.value
  if (!id) return
  detailLoading.value = true
  error.value = false
  try {
    const act = await api.getActivityById(id)
    if (!act) {
      error.value = true
      return
    }
    activity.value = act

    canManage.value = false
    currentPersonUuid.value = ''
    const userId = session.value?.userId
    const currentPerson = userId ? await api.getPersonByUserId(userId).catch(() => null) : null
    if (currentPerson?.externalUuid) {
      currentPersonUuid.value = currentPerson.externalUuid
      const empEntry = (act.employees || []).find(
        (e) => e.employeeUuid === currentPerson.externalUuid
      )
      if (empEntry) {
        const role = (empEntry.role || '').toLowerCase()
        canManage.value = MANAGEMENT_ROLES.includes(role)
      }
    }

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

    const rawTaxes = await api.getTaxesByActivity(id)
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

    if (!keepMode) mode.value = 'detail'
  } catch (err) {
    error.value = true
    activity.value = null
    employees.value = []
    taxes.value = []
  } finally {
    detailLoading.value = false
  }
}

/*** Seleziona un'attività dalla griglia e carica il dettaglio. */
function selectActivity(actId) {
  selectedActivityId.value = actId
  loadDetail()
}

/*** Torna alla schermata di selezione. */
function backToSelection() {
  selectedActivityId.value = null
  activity.value = null
  employees.value = []
  taxes.value = []
  mode.value = 'selection'
}

function onAddEmployee() {
  showEmployeeModal.value = true
}

function onEmployeeModalSaved() {
  showEmployeeModal.value = false
  loadDetail(true)
}

function onEmployeeModalClosed() {
  showEmployeeModal.value = false
}

onMounted(loadActivities)
</script>

<template>
  <DashboardLayout>
    <div class="activity-dashboard">

      <div v-if="mode === 'loading'" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Caricamento…</span>
        </div>
      </div>

      <AppCard v-else-if="mode === 'no-activity'" class="p-4">
        <div class="text-center py-4">
          <i class="bi bi-building fs-1 text-muted mb-3 d-block" />
          <h5>Nessuna attività associata</h5>
          <p class="text-muted">Non risulti associato ad alcuna attività. Contatta un amministratore.</p>
        </div>
      </AppCard>

      <template v-else-if="mode === 'selection'">
        <div class="mb-4 d-flex align-items-center gap-3">
          <h1 class="display-6 mb-0">Le tue attività</h1>
          <span class="badge bg-secondary fs-6">{{ activities.length }}</span>
        </div>

        <div class="d-flex align-items-stretch gap-0">
          <div class="pagination-arrow-wrapper">
            <button
              class="pagination-arrow"
              :class="{ disabled: actPage <= 1 }"
              :disabled="actPage <= 1"
              @click="prevActPage"
            >
              <i class="bi bi-chevron-left" />
            </button>
          </div>

          <Transition
            :name="'slide-' + (actDirection > 0 ? 'fwd' : 'bwd')"
            mode="out-in"
          >
            <div :key="'act-page-' + actPage" class="row g-4 flex-grow-1">
              <div
                v-for="a in paginatedActivities"
                :key="a.id"
                class="col-md-6"
              >
                <AppCard clickable class="p-4 h-100" @click="selectActivity(a.id)">
                  <h4 class="mb-2">{{ a.name }}</h4>
                  <p class="text-muted small mb-1">
                    <i class="bi bi-tag me-1" />{{ categoryName(a) }}
                  </p>
                  <p v-if="a.address != null" class="text-muted small mb-0">
                    <i class="bi bi-geo-alt me-1" />Civico {{ a.address }}
                  </p>
                </AppCard>
              </div>
            </div>
          </Transition>

          <div class="pagination-arrow-wrapper">
            <button
              class="pagination-arrow"
              :class="{ disabled: actPage >= totalActPages }"
              :disabled="actPage >= totalActPages"
              @click="nextActPage"
            >
              <i class="bi bi-chevron-right" />
            </button>
          </div>
        </div>
      </template>

      <template v-else-if="mode === 'detail'">
        <div class="d-flex align-items-flex-start gap-3 mb-4 ps-0 position-relative">
          <button class="back-btn" aria-label="Torna indietro" @click="backToSelection">
            <i class="bi bi-arrow-left" />
          </button>
          <div class="flex-grow-1">
            <h1 class="display-6 mb-0">{{ activity?.name }}</h1>
          </div>
        </div>

        <div v-if="detailLoading && !activity" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Caricamento…</span>
          </div>
        </div>

        <AppCard v-else-if="error && !activity" class="p-4">
          <div class="alert alert-danger mb-0">
            <i class="bi bi-exclamation-triangle-fill me-2" />Impossibile caricare l'attività. Verifica che il backend sia in esecuzione.
          </div>
        </AppCard>

        <template v-else-if="activity">

          <AppCard id="activity-info" class="p-4 mb-4">
            <h3>{{ activity.name }}</h3>
            <p>Categoria: <strong>{{ categoryName(activity) }}</strong></p>
            <p v-if="activity.address != null">Civico: <strong>{{ activity.address }}</strong></p>
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
                    v-if="canManage"
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
                    v-if="canManage"
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
                      <TaxList :taxes="paginatedTaxes" :can-toggle-payed="false" />
                    </div>
                  </Transition>
                </template>

                <AddTaxModal
                  v-if="showAddTaxModal"
                  :activity-id="activity.id"
                  :employees="employees"
                  :fixed-employee-uuid="currentPersonUuid"
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
.pagination-arrow-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 40px;
}

.pagination-arrow {
  background: none !important;
  border: none !important;
  color: var(--text-primary, #111827) !important;
  font-size: 1.75rem;
  line-height: 1;
  padding: 8px 4px;
  cursor: pointer;
  transition: opacity 0.2s ease;
  border-radius: 4px;
}

.pagination-arrow:hover:not(:disabled) {
  opacity: 0.6;
}

.pagination-arrow:disabled,
.pagination-arrow.disabled {
  opacity: 0.2;
  cursor: default;
}

.back-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border: 1px solid transparent;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-primary);
  font-size: 1.2rem;
  transition: all 0.2s ease;
  flex-shrink: 0;
  margin-left: -5.8rem;
  margin-top: 1.5rem;
  margin-right: 2rem;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateX(-2px);
  color: var(--text-primary);
}

.back-btn i {
  line-height: 1;
}

@media (max-width: 768px) {
  .back-btn {
    width: 42px;
    height: 42px;
    font-size: 1rem;
  }
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
