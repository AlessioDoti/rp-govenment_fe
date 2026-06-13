/***
 * useAuth — wrapper ergonomico sullo store auth per le view.
 */

import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth.js'

export function useAuth() {
  const store = useAuthStore()
  const { session, isLoading, error, isAuthenticated, role, username } = storeToRefs(store)
  return {
    session,
    isLoading,
    error,
    isAuthenticated,
    role,
    username,
    login: store.login,
    register: store.register,
    logout: store.logout,
    hasRole: store.hasRole,
    hasAnyRole: store.hasAnyRole
  }
}
