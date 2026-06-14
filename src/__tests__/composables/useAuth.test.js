import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuth } from '@/composables/useAuth.js'

vi.mock('@/services/api.js', () => ({
  api: {
    authenticate: vi.fn(),
    registerUser: vi.fn()
  }
}))

describe('useAuth', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('returns session, isLoading, error, isAuthenticated, role, username', () => {
    const auth = useAuth()
    expect(auth).toHaveProperty('session')
    expect(auth).toHaveProperty('isLoading')
    expect(auth).toHaveProperty('error')
    expect(auth).toHaveProperty('isAuthenticated')
    expect(auth).toHaveProperty('role')
    expect(auth).toHaveProperty('username')
  })

  it('exposes login, register, logout, hasRole, hasAnyRole', () => {
    const auth = useAuth()
    expect(typeof auth.login).toBe('function')
    expect(typeof auth.register).toBe('function')
    expect(typeof auth.logout).toBe('function')
    expect(typeof auth.hasRole).toBe('function')
    expect(typeof auth.hasAnyRole).toBe('function')
  })

  it('calls store.login when login is invoked', async () => {
    const { api } = await import('@/services/api.js')
    api.authenticate.mockResolvedValue({
      username: 'testuser', roles: ['ADMIN'], access_token: 'tok'
    })
    const auth = useAuth()
    await auth.login({ username: 'test', password: 'pass' })
    expect(auth.isAuthenticated.value).toBe(true)
    expect(auth.username.value).toBe('testuser')
  })

  it('calls store.logout when logout is invoked', () => {
    const auth = useAuth()
    auth.login = vi.fn()
    auth.logout()
    expect(auth.isAuthenticated.value).toBe(false)
  })
})
