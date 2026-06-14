<script setup>
/***
 * Dashboard for Government and System Administrators.
 */
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth.js'
import { useDialog } from '@/composables/useDialog.js'
import { api } from '@/services/api.js'
import DashboardLayout from '@/components/templates/DashboardLayout.vue'
import CategoryCard from '@/components/organisms/CategoryCard.vue'
import CategoryEditModal from '@/components/organisms/CategoryEditModal.vue'
import ActivityCard from '@/components/organisms/ActivityCard.vue'
import AddItemCard from '@/components/organisms/AddItemCard.vue'
import ActivityCreateModal from '@/components/organisms/ActivityCreateModal.vue'
import AppButton from '@/components/atoms/AppButton.vue'
import '@/assets/css/dashboard.css'

const PER_PAGE = 5

const router = useRouter()
const { session, role } = useAuth()
const dialog = useDialog()

/*** @type {import('vue').Ref<import('@/domain/models').Category[]>} */
const categories = ref([])
/*** @type {import('vue').Ref<import('@/domain/models').Activity[]>} */
const activities = ref([])
/*** @type {import('vue').Ref<Record<string|number, Array<{ taxAmount: number, declarationDate: string, payed: boolean }>>>} */
const paymentsByActivity = ref({})

const categoriesLoading = ref(false)
const categoriesError = ref(false)
const activitiesLoading = ref(false)
const activitiesError = ref(false)

const categoryPage = ref(1)
const categoryDirection = ref(1)
const activityPage = ref(1)
const activityDirection = ref(1)

const searchQuery = ref('')

const showCreateCategoryModal = ref(false)

/*** Nome e cognome dell'utente collegato allo User. */
const userFullName = ref('')

const isAdmin = computed(() => role.value === 'admin')

/***
 * Restituisce true se il nome dell'elemento matcha la ricerca.
 * @param {{ name: string }} item
 * @returns {boolean}
 */
function matchesSearch(item) {
  if (!searchQuery.value) return true
  return item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
}

/*** @type {import('vue').ComputedRef<import('@/domain/models').Category[]>} */
const filteredCategories = computed(() => categories.value.filter(matchesSearch))

/*** @type {import('vue').ComputedRef<import('@/domain/models').Activity[]>} */
const filteredActivities = computed(() => activities.value.filter(matchesSearch))

watch(searchQuery, () => {
  categoryPage.value = 1
  activityPage.value = 1
})

/*** @type {import('vue').ComputedRef<number>} */
const totalCategoryPages = computed(() => Math.max(1, Math.ceil(filteredCategories.value.length / PER_PAGE)))

/*** @type {import('vue').ComputedRef<import('@/domain/models').Category[]>} */
const paginatedCategories = computed(() => {
  const start = (categoryPage.value - 1) * PER_PAGE
  return filteredCategories.value.slice(start, start + PER_PAGE)
})

/*** Recede la pagina se supera il totale (es. dopo una eliminazione). */
watch(totalCategoryPages, (tp) => {
  if (categoryPage.value > tp) categoryPage.value = tp
})

function prevCategoryPage() {
  categoryDirection.value = -1
  if (categoryPage.value > 1) categoryPage.value--
}

function nextCategoryPage() {
  categoryDirection.value = 1
  if (categoryPage.value < totalCategoryPages.value) categoryPage.value++
}

/*** @type {import('vue').ComputedRef<number>} */
const totalActivityPages = computed(() => Math.max(1, Math.ceil(filteredActivities.value.length / PER_PAGE)))

/*** @type {import('vue').ComputedRef<import('@/domain/models').Activity[]>} */
const paginatedActivities = computed(() => {
  const start = (activityPage.value - 1) * PER_PAGE
  return filteredActivities.value.slice(start, start + PER_PAGE)
})

watch(totalActivityPages, (tp) => {
  if (activityPage.value > tp) activityPage.value = tp
})

function prevActivityPage() {
  activityDirection.value = -1
  if (activityPage.value > 1) activityPage.value--
}

function nextActivityPage() {
  activityDirection.value = 1
  if (activityPage.value < totalActivityPages.value) activityPage.value++
}

async function refresh() {
  categoriesLoading.value = true
  categoriesError.value = false
  try {
    const list = await api.getCategories()
    categories.value = list.sort((a, b) => a.name.localeCompare(b.name))
    categoryPage.value = 1
  } catch (err) {
    categoriesError.value = true
    categories.value = []
    console.error('[Dashboard] Errore caricamento categorie:', err)
  } finally {
    categoriesLoading.value = false
  }

  activitiesLoading.value = true
  activitiesError.value = false
  try {
    const actList = await api.getActivities()
    activities.value = actList.sort((a, b) => a.name.localeCompare(b.name))
    activityPage.value = 1

    const map = {}
    for (const act of actList) {
      try {
        const taxes = await api.getTaxesByActivity(act.id)
        map[act.id] = taxes || []
      } catch {
        map[act.id] = []
      }
    }
    paymentsByActivity.value = map
  } catch (err) {
    activitiesError.value = true
    activities.value = []
    console.error('[Dashboard] Errore caricamento attività:', err)
  } finally {
    activitiesLoading.value = false
  }
}

/***
 * Risolve il nome categoria da un'attività.
 * @param {import('@/domain/models').Activity} activity
 * @returns {string}
 */
function categoryNameOf(activity) {
  if (activity.categoryName) return activity.categoryName
  const id = activity.category
  const c = categories.value.find((x) => x.id === id)
  return c ? c.name : String(id)
}

async function onDeleteCategory(category) {
  const confirmed = await dialog.confirm(
    'Eliminare categoria?',
    `Sei sicuro di voler eliminare la categoria "${category.name}"? Questa azione non può essere annullata.`
  )
  if (!confirmed) return
  try {
    await api.deleteCategory(category.id)
    await dialog.alert('Successo', `Categoria "${category.name}" eliminata.`)
    refresh()
  } catch (err) {
    console.error('[Dashboard] Errore eliminazione categoria:', err)
    await dialog.alert('Errore', 'Impossibile eliminare la categoria. Riprova più tardi.')
  }
}

async function onDeleteActivity(activity) {
  const confirmed = await dialog.confirm(
    'Eliminare attività?',
    `Sei sicuro di voler eliminare l'attività "${activity.name}"? Questa azione non può essere annullata.`
  )
  if (!confirmed) return
  try {
    await api.deleteActivity(activity.id)
    await dialog.alert('Successo', `Attività "${activity.name}" eliminata.`)
    refresh()
  } catch (err) {
    console.error('[Dashboard] Errore eliminazione attività:', err)
    await dialog.alert('Errore', 'Impossibile eliminare l\'attività. Riprova più tardi.')
  }
}

function createCategory() {
  showCreateCategoryModal.value = true
}

async function onCategoryCreated() {
  showCreateCategoryModal.value = false
  await refresh()
}

const showCreateActivityModal = ref(false)

function createActivity() {
  showCreateActivityModal.value = true
}

async function onActivityCreated() {
  showCreateActivityModal.value = false
  await refresh()
}

onMounted(async () => {
  await refresh()

  if (session.value?.userId) {
    const person = await api.getPersonByUserId(session.value.userId)
    if (person && person.name && person.surname) {
      userFullName.value = `${person.name} ${person.surname}`
    } else {
      userFullName.value = session.value.name || ''
    }
  } else {
    userFullName.value = session.value?.name || ''
  }
})
</script>

<template>
  <DashboardLayout>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="display-6">Dashboard Governo</h1>
        <p class="mb-0">Benvenuto, <strong>{{ session?.name }}</strong></p>
        <p class="text-muted mb-0">{{ userFullName }}</p>
      </div>
      <div v-if="isAdmin" id="admin-section">
        <router-link to="/dashboard/users" class="btn btn-primary">
          <i class="bi bi-people-fill" /> Gestione Utenti
        </router-link>
      </div>
    </div>

    <div class="search-bar mb-4">
      <div class="input-group">
        <span class="input-group-text search-icon">
          <i class="bi bi-search" />
        </span>
        <input
          v-model="searchQuery"
          type="text"
          class="form-control search-input"
          placeholder="Filtra categorie e attività per nome…"
          aria-label="Filtra categorie e attività"
        />
        <button
          v-if="searchQuery"
          class="btn search-clear"
          @click="searchQuery = ''"
          aria-label="Cancella filtro"
        >
          <i class="bi bi-x-lg" />
        </button>
      </div>
    </div>

    <section class="dashboard-section mb-5">
      <h2>Categorie</h2>

      <div v-if="categoriesLoading" class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Caricamento categorie…</span>
        </div>
        <p class="text-muted mt-2 mb-0">Caricamento categorie…</p>
      </div>

      <div v-else-if="categoriesError" class="alert alert-danger d-flex align-items-center gap-2">
        <i class="bi bi-exclamation-triangle-fill" />
        <span>Impossibile caricare le categorie. Verifica che il backend sia in esecuzione.</span>
      </div>

      <div v-else class="d-flex align-items-stretch gap-0">
        <div class="pagination-arrow-wrapper">
          <button
            class="pagination-arrow"
            :class="{ disabled: categoryPage <= 1 }"
            :disabled="categoryPage <= 1"
            @click="prevCategoryPage"
          >
            <i class="bi bi-chevron-left" />
          </button>
        </div>
        <Transition
          :name="'slide-' + (categoryDirection > 0 ? 'fwd' : 'bwd')"
          mode="out-in"
        >
          <div
            :key="'cat-page-' + categoryPage"
            id="category-list"
            class="row g-4 flex-grow-1"
          >
            <CategoryCard
              v-for="c in paginatedCategories"
              :key="c.id"
              :category="c"
              :can-delete="isAdmin"
              @delete="onDeleteCategory"
            />
            <div v-if="isAdmin" class="col-md-4">
              <AddItemCard
                label="Aggiungi categoria"
                @click="createCategory"
              />
            </div>
          </div>
        </Transition>
        <div class="pagination-arrow-wrapper">
          <button
            class="pagination-arrow"
            :class="{ disabled: categoryPage >= totalCategoryPages }"
            :disabled="categoryPage >= totalCategoryPages"
            @click="nextCategoryPage"
          >
            <i class="bi bi-chevron-right" />
          </button>
        </div>
      </div>
    </section>

    <section class="dashboard-section">
      <h2>Attività</h2>

      <div v-if="activitiesLoading" class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Caricamento attività…</span>
        </div>
        <p class="text-muted mt-2 mb-0">Caricamento attività…</p>
      </div>

      <div v-else-if="activitiesError" class="alert alert-danger d-flex align-items-center gap-2">
        <i class="bi bi-exclamation-triangle-fill" />
        <span>Impossibile caricare le attività. Verifica che il backend sia in esecuzione.</span>
      </div>

      <div v-else class="d-flex align-items-stretch gap-0">
        <div class="pagination-arrow-wrapper">
          <button
            class="pagination-arrow"
            :class="{ disabled: activityPage <= 1 }"
            :disabled="activityPage <= 1"
            @click="prevActivityPage"
          >
            <i class="bi bi-chevron-left" />
          </button>
        </div>
        <Transition
          :name="'slide-' + (activityDirection > 0 ? 'fwd' : 'bwd')"
          mode="out-in"
        >
          <div
            :key="'act-page-' + activityPage"
            id="activity-list"
            class="row g-4 flex-grow-1"
          >
            <ActivityCard
              v-for="a in paginatedActivities"
              :key="a.id"
              :activity="a"
              :category-name="categoryNameOf(a)"
              :payments="paymentsByActivity[a.id] || []"
              :can-delete="isAdmin"
              @delete="onDeleteActivity"
            />
            <div v-if="isAdmin" class="col-md-6">
              <AddItemCard
                label="Aggiungi attività"
                @click="createActivity"
              />
            </div>
          </div>
        </Transition>
        <div class="pagination-arrow-wrapper">
          <button
            class="pagination-arrow"
            :class="{ disabled: activityPage >= totalActivityPages }"
            :disabled="activityPage >= totalActivityPages"
            @click="nextActivityPage"
          >
            <i class="bi bi-chevron-right" />
          </button>
        </div>
      </div>
    </section>

    <CategoryEditModal
      v-if="showCreateCategoryModal"
      @close="showCreateCategoryModal = false"
      @saved="onCategoryCreated"
    />

    <ActivityCreateModal
      v-if="showCreateActivityModal"
      @close="showCreateActivityModal = false"
      @saved="onActivityCreated"
    />
  </DashboardLayout>
</template>

<style scoped>

.search-bar .input-group {
    border: var(--bs-border-width, 1px) solid var(--bs-border-color, #dee2e6);
    border-radius: var(--bs-border-radius, 6px);
    overflow: hidden;
    transition: box-shadow 0.2s ease;
}

.search-bar .search-icon,
.search-bar .search-input,
.search-bar .search-clear {
    border: none !important;
    background: transparent;
    outline: none !important;
    box-shadow: none !important;
}

.search-bar .search-icon {
    color: var(--text-secondary, #6c757d);
    padding-right: 0.5rem;
}

.search-bar .search-input {
    padding-left: 0.25rem;
}

.search-bar .search-input:focus {
    box-shadow: none;
}

.search-bar .search-clear {
    color: #eab308;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
}

.search-bar .search-clear:hover {
    color: #facc15;
}

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

.slide-fwd-enter-active,
.slide-fwd-leave-active,
.slide-bwd-enter-active,
.slide-bwd-leave-active {
    transition: all 0.2s ease;
}

.slide-fwd-enter-from {
    transform: translateX(30px);
    opacity: 0;
}
.slide-fwd-leave-to {
    transform: translateX(-30px);
    opacity: 0;
}

.slide-bwd-enter-from {
    transform: translateX(-30px);
    opacity: 0;
}
.slide-bwd-leave-to {
    transform: translateX(30px);
    opacity: 0;
}
</style>
