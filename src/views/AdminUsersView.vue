<script setup>
/***
 * System users management view.
 */
import { ref, computed, onMounted, watch } from 'vue'
import { api } from '@/services/api.js'
import DashboardLayout from '@/components/templates/DashboardLayout.vue'
import PageHeader from '@/components/organisms/PageHeader.vue'
import UserCard from '@/components/organisms/UserCard.vue'
import '@/assets/css/dashboard.css'

const PER_PAGE = 12

/*** @type {import('vue').Ref<Array<{ userId: number, uuid: string, username: string, email: string, roles: string[] }>>} */
const users = ref([])
const personMap = ref(/** @type {Record<number, { name: string, surname: string }>} */ ({}))
const searchQuery = ref('')
const loading = ref(true)

const page = ref(1)
const direction = ref(1)

/*** @param {{ userId: number }} user @returns {{ name: string, surname: string }|null} */
function getPerson(user) {
  return personMap.value[user.userId] || null
}

const enrichedUsers = computed(() => {
  return users.value.map((u) => ({
    ...u,
    person: getPerson(u)
  }))
})

const displayedUsers = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return enrichedUsers.value
  return enrichedUsers.value.filter((u) => {
    const p = u.person
    if (!p) return false
    return p.name.toLowerCase().includes(q) || p.surname.toLowerCase().includes(q)
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(displayedUsers.value.length / PER_PAGE)))

const paginatedUsers = computed(() => {
  const start = (page.value - 1) * PER_PAGE
  return displayedUsers.value.slice(start, start + PER_PAGE)
})

function prevPage() {
  direction.value = -1
  if (page.value > 1) page.value--
}

function nextPage() {
  direction.value = 1
  if (page.value < totalPages.value) page.value++
}

watch(totalPages, (tp) => {
  if (page.value > tp) page.value = tp
})

watch(searchQuery, () => {
  page.value = 1
})

async function refresh() {
  loading.value = true
  try {
    users.value = await api.getAllUsers()

    const peopleResult = await api.searchPersons({}, { page: 0, size: 1000 })
    const map = /** @type {Record<number, { name: string, surname: string }>} */ ({})
    for (const p of (peopleResult.data || [])) {
      if (p.userId != null) {
        map[p.userId] = { name: p.name, surname: p.surname }
      }
    }
    personMap.value = map
  } catch {
    personMap.value = {}
  } finally {
    loading.value = false
  }
}

onMounted(refresh)
</script>

<template>
  <DashboardLayout>
    <div class="admin-users">
      <PageHeader
        title="Gestione Utenti"
        subtitle="Ricerca, gestisci utenti e ruoli"
        back-to="/dashboard"
      />

      <div class="search-bar mb-4">
        <div class="input-group">
          <span class="input-group-text search-icon">
            <i class="bi bi-search" />
          </span>
          <input
            v-model="searchQuery"
            type="text"
            class="form-control search-input"
            placeholder="Cerca per nome o cognome…"
          />
          <button
            v-if="searchQuery"
            class="btn search-clear"
            @click="searchQuery = ''"
          >&times;</button>
        </div>
      </div>

      <div v-if="loading" class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Caricamento…</span>
        </div>
        <p class="text-muted mt-2 mb-0">Caricamento utenti…</p>
      </div>

      <div v-else id="users-list" class="d-flex align-items-stretch gap-0">
        <div class="pagination-arrow-wrapper">
          <button
            class="pagination-arrow"
            :class="{ disabled: page <= 1 }"
            :disabled="page <= 1"
            @click="prevPage"
          >
            <i class="bi bi-chevron-left" />
          </button>
        </div>

        <Transition
          :name="'slide-' + (direction > 0 ? 'fwd' : 'bwd')"
          mode="out-in"
        >
          <div :key="'users-page-' + page" class="row g-4 flex-grow-1">
            <template v-if="paginatedUsers.length === 0">
              <p class="text-muted col-12">Nessun utente trovato</p>
            </template>
            <UserCard
              v-for="u in paginatedUsers"
              :key="u.username"
              :user="u"
              :get-person="getPerson"
            />
          </div>
        </Transition>

        <div class="pagination-arrow-wrapper">
          <button
            class="pagination-arrow"
            :class="{ disabled: page >= totalPages }"
            :disabled="page >= totalPages"
            @click="nextPage"
          >
            <i class="bi bi-chevron-right" />
          </button>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<style scoped>
.search-bar .input-group {
  max-width: 480px;
}

.search-bar .search-icon,
.search-bar .search-input,
.search-bar .search-clear {
  background: transparent !important;
  border: 1px solid var(--border-color, #d1d5db) !important;
  color: var(--text-primary, #111827) !important;
}

.search-bar .search-icon {
  border-right: none !important;
  color: var(--text-muted, #6b7280) !important;
}

.search-bar .search-input {
  border-left: none !important;
  border-right: none !important;
  outline: none !important;
  box-shadow: none !important;
}

.search-bar .search-input:focus {
  border-color: var(--border-color, #d1d5db) !important;
}

.search-bar .search-clear {
  border-left: none !important;
  font-size: 1.2rem;
  line-height: 1;
  cursor: pointer;
}

[data-theme="dark"] .search-bar .search-icon,
[data-theme="dark"] .search-bar .search-input,
[data-theme="dark"] .search-bar .search-clear {
  border-color: #4b5563 !important;
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

.slide-fwd-enter-active,
.slide-fwd-leave-active,
.slide-bwd-enter-active,
.slide-bwd-leave-active {
  transition: all 0.2s ease;
}
</style>
