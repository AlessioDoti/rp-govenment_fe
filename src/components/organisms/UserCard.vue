<script setup>
/***
 * UserCard — card utente (admin).
 * @prop {{ userId: number, uuid: string, username: string, email: string, roles: string[], person?: { name: string, surname: string }|null }} user
 * @prop {(user: { userId: number }) => ({ name: string, surname: string }|null)} getPerson
 */
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { roleDisplay } from '@/utils/format.js'
import AppCard from '@/components/atoms/AppCard.vue'

const props = defineProps({
  user: { type: Object, required: true },
  getPerson: { type: Function, required: true }
})

const router = useRouter()

const person = computed(() => props.user.person || (props.getPerson(props.user)))
const personFullName = computed(() => {
  const p = person.value
  return p ? `${p.name} ${p.surname}` : null
})

function onCardClick() {
  router.push({
    name: 'user-detail',
    params: { username: encodeURIComponent(props.user.username) }
  })
}
</script>

<style scoped>
.roles-list {
  background: var(--bg, #f8fafc);
  border-radius: 8px;
  padding: 8px 12px;
}

.role-row + .role-row {
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.role-name {
  color: var(--text-primary, #111827);
}

[data-theme="dark"] .roles-list {
  background: rgba(255, 255, 255, 0.04);
}

[data-theme="dark"] .role-row + .role-row {
  border-top-color: rgba(255, 255, 255, 0.08);
}
</style>

<template>
  <div class="col-md-6 col-lg-4">
    <AppCard clickable @click="onCardClick">
      <h5>{{ personFullName || ('@' + user.username) }}</h5>
      <p class="text-muted small mb-2">@{{ user.username }}</p>
      <p v-if="personFullName" class="text-muted small mb-1">{{ user.email }}</p>
      <div class="roles-list">
        <p class="text-muted small mb-2"><i class="bi bi-shield-check me-1" />Ruoli</p>
        <div
          v-for="(role, i) in (user.roles || [])"
          :key="i"
          class="role-row d-flex justify-content-between align-items-center py-1"
        >
          <span class="role-name small">{{ roleDisplay(role) }}</span>
        </div>
        <div v-if="!(user.roles && user.roles.length)" class="role-row py-1">
          <span class="role-name small text-muted">Nessun ruolo</span>
        </div>
      </div>
    </AppCard>
  </div>
</template>
