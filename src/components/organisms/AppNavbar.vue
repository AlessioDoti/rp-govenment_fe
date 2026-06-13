<script setup>
/***
 * AppNavbar — top navbar.
 * @prop {boolean} publicLayout - true = versione pubblica (Home, Rulebook, Login, Signup)
 * @prop {boolean} dashboard - true = versione dashboard autenticato
 */
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth.js'
import ThemeToggle from '@/components/molecules/ThemeToggle.vue'

const props = defineProps({
  publicLayout: { type: Boolean, default: false },
  dashboard: { type: Boolean, default: false }
})

const route = useRoute()
const router = useRouter()
const { isAuthenticated, logout } = useAuth()

function isActive(path) {
  return route.path === path
}

function onLogout() {
  logout()
  router.push({ name: 'login' })
}

const containerClass = computed(() => (props.dashboard ? 'container-fluid' : 'container'))
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark shadow" :class="props.dashboard ? 'shadow-sm' : 'shadow'">
    <div :class="containerClass">
      <router-link class="navbar-brand fw-bold" :to="isAuthenticated ? '/dashboard' : '/'">
        Governo RP
      </router-link>

      <div v-if="publicLayout" class="d-flex align-items-center ms-auto gap-2 order-lg-3">
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span class="navbar-toggler-icon" />
        </button>
        <button v-if="isAuthenticated" class="btn btn-outline-light" id="logout-btn-public" @click="onLogout">
          <i class="bi bi-box-arrow-right me-1" />Esci
        </button>
        <ThemeToggle />
      </div>

      <div v-if="publicLayout" class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <router-link
              class="nav-link"
              :class="{ active: isActive('/') }"
              to="/"
            >Home</router-link>
          </li>
          <li class="nav-item">
            <router-link
              class="nav-link"
              :class="{ active: isActive('/rulebook') }"
              to="/rulebook"
            >Regolamento</router-link>
          </li>
          <li v-if="!isAuthenticated" class="nav-item">
            <router-link
              class="nav-link"
              :class="{ active: isActive('/login') }"
              to="/login"
            >Login</router-link>
          </li>
        </ul>
      </div>

      <div v-if="dashboard" class="d-flex align-items-center gap-2 ms-auto">
        <button class="btn btn-outline-light" id="logout-btn" @click="onLogout">
          <i class="bi bi-box-arrow-right me-1" />Esci
        </button>
        <ThemeToggle />
      </div>
    </div>
  </nav>
</template>
