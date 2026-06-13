/***
 * Authentication store — handles session persistence and role-based helpers.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/services/api.js'

const STORAGE_KEY = 'session'

/*** @returns {import('@/domain/models').SessionUser|null} */
function readSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeSession(session) {
  if (session) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
}

export const useAuthStore = defineStore('auth', () => {
  const session = ref(readSession())
  const isLoading = ref(false)
  const error = ref(/** @type {string|null} */ (null))

  const isAuthenticated = computed(() => session.value !== null)
  const role = computed(() => {
    const roles = session.value?.roles || []
    if (roles.includes('ADMIN')) return 'admin'
    if (roles.includes('GOVERNMENT')) return 'government'
    if (roles.includes('ACTIVITY_MANAGER')) return 'activity'
    return 'citizen'
  })
  const username = computed(() => session.value?.username ?? null)

  /***
   * @param {{ username: string, password: string }} credentials
   * @returns {Promise<import('@/domain/models').SessionUser>}
   */
  async function login(credentials) {
    isLoading.value = true
    error.value = null
    try {
      const user = await api.authenticate(credentials)
      session.value = user
      writeSession(user)
      return user
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Errore di login'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  /*** @param {{ firstname: string, lastname: string, username: string, password: string, birthDate?: string }} payload */
  async function register(payload) {
    isLoading.value = true
    error.value = null
    try {
      const user = await api.registerUser(payload)
      session.value = user
      writeSession(user)
      return user
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Errore di registrazione'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  function logout() {
    session.value = null
    writeSession(null)
  }

  /*** @param {import('@/domain/models').Role} requiredRole */
  function hasRole(requiredRole) {
    return role.value === requiredRole
  }

  /*** @param {import('@/domain/models').Role[]} allowedRoles */
  function hasAnyRole(allowedRoles) {
    return role.value !== null && allowedRoles.includes(role.value)
  }

  return {
    session,
    isLoading,
    error,
    isAuthenticated,
    role,
    username,
    login,
    register,
    logout,
    hasRole,
    hasAnyRole
  }
})
