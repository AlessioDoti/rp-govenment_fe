<script setup>
/***
 * Root component. Mounting point for router-view and the global CustomModal.
 * Listens for the session-expired event dispatched by httpClient on 401.
 */
import { onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import CustomModal from '@/components/organisms/CustomModal.vue'
import { useDialog } from '@/composables/useDialog.js'
import { useAuthStore } from '@/stores/auth.js'
import { useDialogStore } from '@/stores/dialog.js'
import { initClickTracker } from '@/utils/clickPosition.js'

const router = useRouter()
const dialog = useDialog()

/***
 * Handles token expiration: clears the session, shows a warning modal,
 * then redirects to the home page.
 * Ignores the event if a modal is already open or the user is not authenticated.
 */
async function onSessionExpired() {
  const authStore = useAuthStore()
  const dialogStore = useDialogStore()

  if (dialogStore.open) return
  if (!authStore.isAuthenticated) return

  authStore.logout()
  await dialog.alert('Sessione scaduta', 'La tua sessione è scaduta. Verrai reindirizzato alla home page.')
  router.push({ name: 'home' })
}

onMounted(() => {
  initClickTracker()
  window.addEventListener('session-expired', onSessionExpired)
})

onBeforeUnmount(() => {
  window.removeEventListener('session-expired', onSessionExpired)
})
</script>

<template>
  <div class="page-view">
    <router-view />
  </div>
  <CustomModal />
</template>

<style>
.page-view {
  animation: pageFadeIn 0.2s ease;
}

@keyframes pageFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
