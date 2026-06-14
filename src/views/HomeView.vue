<script setup>
/***
 * Public landing page of the portal.
 */
import { useRouter } from 'vue-router'
import PublicLayout from '@/components/templates/PublicLayout.vue'
import AppCard from '@/components/atoms/AppCard.vue'
import AppButton from '@/components/atoms/AppButton.vue'
import { useAuth } from '@/composables/useAuth.js'

const router = useRouter()
const { isAuthenticated, hasRole, logout } = useAuth()

function onLogout() {
  logout()
  router.push({ name: 'home' })
}
</script>

<template>
  <PublicLayout>
    <section class="hero">
      <div class="container">
        <div class="hero-box text-center">
          <h1 class="display-3 fw-bold mb-4">Portale Governo RP</h1>
          <p class="lead mb-4">
            Gestisci i pagamenti delle tasse dei locali, consulta il regolamento e accedi ai servizi dedicati ai cittadini.
          </p>

          <template v-if="isAuthenticated">
            <router-link v-if="hasRole('citizen')" to="/rulebook" class="btn btn-custom btn-lg me-3">
              Regolamento
            </router-link>
            <router-link v-else-if="hasRole('activity')" to="/dashboard/activity" class="btn btn-custom btn-lg me-3">
              Dashboard Attività
            </router-link>
            <router-link v-else to="/dashboard" class="btn btn-custom btn-lg me-3">
              Dashboard
            </router-link>
            <AppButton variant="outline-light" size="lg" @click="onLogout">
              <i class="bi bi-box-arrow-right me-2" />Esci
            </AppButton>
          </template>
          <template v-else>
            <router-link to="/login" class="btn btn-custom btn-lg">
              Accedi al Portale
            </router-link>
          </template>
        </div>
      </div>
    </section>

    <section class="container pb-5">
      <div class="row g-4">
        <div class="col-md-4">
          <AppCard feature class="p-4 h-100">
            <h3 class="mb-3">Gestione Attività</h3>
            <p>Calcolo Tasse, gestione pagamenti, aggiunta rimozione dipendenti.</p>
          </AppCard>
        </div>
        <div class="col-md-4">
          <AppCard feature class="p-4 h-100">
            <h3 class="mb-3">Servizi Civici</h3>
            <p>Accesso a servizi dedicati ai cittadini, come richieste di autorizzazione e informazioni sulle procedure.</p>
          </AppCard>
        </div>
        <div class="col-md-4">
          <AppCard feature class="p-4 h-100">
            <h3 class="mb-3">Regolamenti</h3>
            <p>Consulta il regolamento e accedi alle leggi e alle procedure.</p>
          </AppCard>
        </div>
      </div>
    </section>
  </PublicLayout>
</template>

<style scoped>
.hero {
    padding: 120px 0;
}

.hero-box {
    background: var(--bg-secondary);
    border-radius: 20px;
    padding: 60px;
    box-shadow: var(--card-shadow);
}

.btn-custom {
    background-color: var(--btn-bg);
    border: none;
    color: var(--btn-text);
    font-weight: bold;
    padding: 12px 30px;
    border-radius: 12px;
}
</style>
