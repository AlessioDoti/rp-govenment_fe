<script setup>
/***
 * User detail with role editing (add/remove, overwrites entire list).
 */
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDialog } from '@/composables/useDialog.js'
import { api } from '@/services/api.js'
import { roleDisplay } from '@/utils/format.js'
import DashboardLayout from '@/components/templates/DashboardLayout.vue'
import PageHeader from '@/components/organisms/PageHeader.vue'
import AppCard from '@/components/atoms/AppCard.vue'
import AppButton from '@/components/atoms/AppButton.vue'
import AppIconButton from '@/components/atoms/AppIconButton.vue'

const AVAILABLE_ROLES = [
  { value: 'CITIZEN', label: 'Cittadino' },
  { value: 'ACTIVITY_MANAGER', label: 'Gestore Attività' },
  { value: 'GOVERNMENT', label: 'Membro del Governo' },
  { value: 'ADMIN', label: 'Admin Governo' }
]

const route = useRoute()
const router = useRouter()
const dialog = useDialog()

const user = ref(/** @type {import('@/domain/models').UserPublic|null} */ (null))
const person = ref(/** @type {{ name: string, surname: string }|null} */ (null))
const editing = ref(false)
const editedRoles = ref(/** @type {string[]} */ ([]))
const saveError = ref('')

const username = computed(() => decodeURIComponent(String(route.params.username)))

function startEdit() {
  if (!user.value) return
  editedRoles.value = [...(user.value.roles || [])]
  editing.value = true
}

function cancelEdit() {
  editing.value = false
  saveError.value = ''
}

function toggleRole(roleValue) {
  const idx = editedRoles.value.indexOf(roleValue)
  if (idx >= 0) {
    editedRoles.value.splice(idx, 1)
  } else {
    editedRoles.value.push(roleValue)
  }
}

async function saveRoles() {
  saveError.value = ''
  if (!user.value) return
  if (editedRoles.value.length === 0) {
    saveError.value = 'Seleziona almeno un ruolo.'
    return
  }
  if (await api.updateUserRole(user.value.uuid, editedRoles.value)) {
    await dialog.alert('Successo', 'Ruoli aggiornati')
    editing.value = false
    load()
  } else {
    saveError.value = 'Errore del server. Riprova più tardi.'
  }
}

async function load() {
  const u = await api.getUserById(username.value)
  if (!u) {
    router.push({ name: 'admin-users' })
    return
  }
  user.value = u

  if (u.userId) {
    person.value = await api.getPersonByUserId(u.userId)
  } else {
    person.value = null
  }
}

onMounted(load)
watch(username, load)
</script>

<template>
  <DashboardLayout>
    <PageHeader
      title="Dettaglio Utente"
      subtitle="Informazioni utente e gestione ruoli"
      back-to="/dashboard/users"
      :show-back="true"
    />

    <AppCard v-if="user" id="user-detail" class="p-4">
      <div class="d-flex align-items-start justify-content-between">
        <div>
          <h3 class="mb-1">{{ person ? `${person.name} ${person.surname}` : user.username }}</h3>
          <p class="text-muted small mb-0">@{{ user.username }}</p>
        </div>
        <AppIconButton
          icon="pencil-square"
          title="Modifica ruoli"
          aria-label="Modifica ruoli"
          @click="startEdit"
        />
      </div>

      <hr />

      <div v-if="!editing">
        <p v-if="user.email">
          <i class="bi bi-envelope me-1" /><strong>{{ user.email }}</strong>
        </p>
        <div>
          <span class="fw-semibold me-2">Ruoli:</span>
          <span v-if="!user.roles || user.roles.length === 0" class="text-muted small">Nessun ruolo</span>
          <span v-else class="d-inline-flex gap-1 flex-wrap">
            <span
              v-for="role in user.roles"
              :key="role"
              class="badge bg-primary rounded-pill"
            >
              {{ roleDisplay(role) }}
            </span>
          </span>
        </div>
      </div>

      <div v-else class="mt-3 p-3 border rounded role-editor">
        <p class="fw-semibold mb-2">Seleziona i ruoli</p>
        <div v-for="r in AVAILABLE_ROLES" :key="r.value" class="form-check mb-1">
          <input
            :id="'role-' + r.value"
            type="checkbox"
            class="form-check-input"
            :checked="editedRoles.includes(r.value)"
            @change="toggleRole(r.value)"
          />
          <label :for="'role-' + r.value" class="form-check-label">{{ r.label }}</label>
        </div>
        <p v-if="saveError" class="text-danger small mt-2 mb-0">{{ saveError }}</p>
        <div class="d-flex gap-2 mt-3">
          <AppButton variant="primary" size="sm" @click="saveRoles">Salva</AppButton>
          <AppButton variant="secondary" size="sm" @click="cancelEdit">Annulla</AppButton>
        </div>
      </div>
    </AppCard>
  </DashboardLayout>
</template>

<style scoped>
.role-editor {
  background: var(--bs-card-bg, #fff);
  color: var(--bs-body-color, #212529);
}
</style>
