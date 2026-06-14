import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth.js'

vi.mock('@/services/api.js', () => ({
  api: {
    authenticate: vi.fn(),
    registerUser: vi.fn()
  }
}))

const mockSession = {
  username: 'testuser',
  roles: ['ADMIN'],
  access_token: 'token123',
  refresh_token: 'refresh123',
  userId: 1,
  name: 'Test User'
}

const mockCitizenSession = {
  username: 'citizen',
  roles: ['CITIZEN'],
  access_token: 'token456',
  userId: 2,
  name: 'Citizen'
}

const mockGovSession = {
  username: 'govuser',
  roles: ['GOVERNMENT'],
  access_token: 'token789',
  userId: 3,
  name: 'Gov User'
}

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('has default state values', () => {
    const store = useAuthStore()
    expect(store.session).toBeNull()
    expect(store.isLoading).toBe(false)
    expect(store.error).toBeNull()
    expect(store.isAuthenticated).toBe(false)
    expect(store.role).toBe('citizen')
    expect(store.username).toBeNull()
  })

  it('isAuthenticated is false when session is null', () => {
    const store = useAuthStore()
    expect(store.isAuthenticated).toBe(false)
  })

  it('isAuthenticated is true when session is set', () => {
    const store = useAuthStore()
    store.session = mockSession
    expect(store.isAuthenticated).toBe(true)
  })

  it('role computed returns correct role for ADMIN', () => {
    const store = useAuthStore()
    store.session = mockSession
    expect(store.role).toBe('admin')
  })

  it('role computed returns correct role for GOVERNMENT', () => {
    const store = useAuthStore()
    store.session = mockGovSession
    expect(store.role).toBe('government')
  })

  it('role computed returns citizen for CITIZEN', () => {
    const store = useAuthStore()
    store.session = mockCitizenSession
    expect(store.role).toBe('citizen')
  })

  it('role computed returns citizen when no roles match', () => {
    const store = useAuthStore()
    store.session = { username: 'test', roles: ['UNKNOWN'] }
    expect(store.role).toBe('citizen')
  })

  it('username computed returns the username from session', () => {
    const store = useAuthStore()
    store.session = mockSession
    expect(store.username).toBe('testuser')
  })

  it('username is null when no session', () => {
    const store = useAuthStore()
    expect(store.username).toBeNull()
  })

  it('hasRole checks against current role', () => {
    const store = useAuthStore()
    store.session = mockSession
    expect(store.hasRole('admin')).toBe(true)
    expect(store.hasRole('citizen')).toBe(false)
  })

  it('hasAnyRole checks against allowed roles list', () => {
    const store = useAuthStore()
    store.session = mockSession
    expect(store.hasAnyRole(['admin', 'government'])).toBe(true)
    expect(store.hasAnyRole(['citizen'])).toBe(false)
  })

  it('login calls api.authenticate and stores session', async () => {
    const { api } = await import('@/services/api.js')
    api.authenticate.mockResolvedValue(mockSession)
    const store = useAuthStore()
    const result = await store.login({ username: 'testuser', password: 'pass' })
    expect(api.authenticate).toHaveBeenCalledWith({ username: 'testuser', password: 'pass' })
    expect(store.session).toEqual(mockSession)
    expect(store.isAuthenticated).toBe(true)
    expect(result).toEqual(mockSession)
  })

  it('login sets error on failure', async () => {
    const { api } = await import('@/services/api.js')
    const err = new Error('Invalid credentials')
    api.authenticate.mockRejectedValue(err)
    const store = useAuthStore()
    await expect(store.login({ username: 'test', password: 'wrong' })).rejects.toThrow('Invalid credentials')
    expect(store.error).toBe('Invalid credentials')
    expect(store.isAuthenticated).toBe(false)
  })

  it('register calls api.registerUser and stores session', async () => {
    const { api } = await import('@/services/api.js')
    api.registerUser.mockResolvedValue(mockSession)
    const store = useAuthStore()
    const payload = { firstname: 'Test', lastname: 'User', username: 'testuser', password: 'pass' }
    const result = await store.register(payload)
    expect(api.registerUser).toHaveBeenCalledWith(payload)
    expect(store.session).toEqual(mockSession)
    expect(result).toEqual(mockSession)
  })

  it('register sets error on failure', async () => {
    const { api } = await import('@/services/api.js')
    api.registerUser.mockRejectedValue(new Error('Registration failed'))
    const store = useAuthStore()
    await expect(store.register({ firstname: 'Test', lastname: 'User', username: 'test', password: 'pass' })).rejects.toThrow('Registration failed')
    expect(store.error).toBe('Registration failed')
  })

  it('logout clears session', () => {
    const store = useAuthStore()
    store.session = mockSession
    store.logout()
    expect(store.session).toBeNull()
    expect(store.isAuthenticated).toBe(false)
  })

  it('isLoading is true during login', async () => {
    const { api } = await import('@/services/api.js')
    let resolvePromise
    api.authenticate.mockReturnValue(new Promise((r) => { resolvePromise = r }))
    const store = useAuthStore()
    const loginPromise = store.login({ username: 'test', password: 'pass' })
    expect(store.isLoading).toBe(true)
    resolvePromise(mockSession)
    await loginPromise
    expect(store.isLoading).toBe(false)
  })
})
