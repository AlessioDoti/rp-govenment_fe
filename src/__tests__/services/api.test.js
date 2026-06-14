import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/services/api.js'

vi.mock('@/services/httpClient.js', () => ({
  httpClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    del: vi.fn()
  }
}))

const { httpClient } = await import('@/services/httpClient.js')

const tokenResponse = { access_token: 'abc', refresh_token: 'ref' }
const userInfoResponse = { username: 'testuser', roles: ['ADMIN'] }

describe('api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('authenticate', () => {
    it('calls /auth/token then /auth/userinfo and returns session', async () => {
      httpClient.post.mockResolvedValueOnce(tokenResponse)
      httpClient.get.mockResolvedValueOnce(userInfoResponse)

      const result = await api.authenticate({ username: 'testuser', password: 'pass' })

      expect(httpClient.post).toHaveBeenCalledWith('/auth/token', {
        grant_type: 'password',
        username: 'testuser',
        password: 'pass'
      })
      expect(httpClient.get).toHaveBeenCalledWith('/auth/userinfo')
      expect(result.username).toBe('testuser')
      expect(result.access_token).toBe('abc')
      expect(result.refresh_token).toBe('ref')
    })

    it('cleans up session on userinfo failure', async () => {
      httpClient.post.mockResolvedValueOnce(tokenResponse)
      httpClient.get.mockRejectedValueOnce(new Error('Unauthorized'))

      await expect(api.authenticate({ username: 'test', password: 'pass' })).rejects.toThrow()
      expect(localStorage.getItem('session')).toBeNull()
    })
  })

  describe('registerUser', () => {
    function notFoundErr() {
      const e = new Error('Not found')
      e.status = 404
      return e
    }

    it('passes pre-check, creates user, creates person and authenticates', async () => {
      // 1. GET /person/find-exact → 404 → null → continue
      // 2. POST /auth/register → user created
      // 3. POST /person → person created
      // 4. POST /auth/token → auth token
      // 5. GET /auth/userinfo → user info
      httpClient.get
        .mockRejectedValueOnce(notFoundErr())           // /person/find-exact → null
        .mockResolvedValueOnce(userInfoResponse)         // /auth/userinfo
      httpClient.post
        .mockResolvedValueOnce({ userId: 1 })         // /auth/register
        .mockResolvedValueOnce({ id: 1 })              // /person (createPerson)
        .mockResolvedValueOnce(tokenResponse)           // /auth/token

      const result = await api.registerUser({
        firstname: 'Test',
        lastname: 'User',
        username: 'newuser',
        password: 'pass'
      })

      // Pre-check first
      expect(httpClient.get).toHaveBeenNthCalledWith(1,
        expect.stringContaining('/person/find-exact')
      )
      // Then user registration
      expect(httpClient.post).toHaveBeenNthCalledWith(1, '/auth/register', {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'pass'
      })
      expect(result.username).toBe('testuser')
    })

    it('creates person after user registration if name fields provided', async () => {
      httpClient.get
        .mockRejectedValueOnce(notFoundErr())           // /person/find-exact → null
        .mockResolvedValueOnce(userInfoResponse)         // /auth/userinfo
      httpClient.post
        .mockResolvedValueOnce({ userId: 1 })         // /auth/register
        .mockResolvedValueOnce({ id: 1 })              // /person (createPerson)
        .mockResolvedValueOnce(tokenResponse)           // /auth/token

      await api.registerUser({
        firstname: 'Test',
        lastname: 'User',
        username: 'newuser',
        password: 'pass',
        birthDate: '2000-01-01'
      })

      expect(httpClient.post).toHaveBeenNthCalledWith(2, '/person', {
        name: 'Test',
        surname: 'User',
        birthDate: '2000-01-01',
        userId: 1
      })
    })

    it('fails on conflict before creating the user', async () => {
      const conflictErr = new Error('Person already linked')
      conflictErr.status = 409
      conflictErr._personConflict = true

      httpClient.get.mockRejectedValueOnce(conflictErr)  // /person/find-exact → 409

      await expect(api.registerUser({
        firstname: 'Test',
        lastname: 'User',
        username: 'newuser',
        password: 'pass',
        birthDate: '2000-01-01'
      })).rejects.toThrow('Person already linked')

      // Auth register must NOT have been called
      expect(httpClient.post).not.toHaveBeenCalledWith('/auth/register', expect.anything())
    })
  })

  describe('Categories', () => {
    it('getCategories returns mapped categories', async () => {
      httpClient.get.mockResolvedValue({
        data: [
          { id: 1, name: 'Commercio', categoryTaxes: [{ id: 1, amount: 100, rate: 10 }] }
        ]
      })
      const cats = await api.getCategories()
      expect(cats).toHaveLength(1)
      expect(cats[0].name).toBe('Commercio')
      expect(cats[0].categoryTaxes).toEqual([{ id: 1, amount: 100, rate: 10 }])
    })

    it('getCategoryById returns null if not found', async () => {
      httpClient.get.mockResolvedValue({ data: [] })
      const cat = await api.getCategoryById(999)
      expect(cat).toBeNull()
    })

    it('createCategory posts and returns mapped category', async () => {
      httpClient.post.mockResolvedValue({ id: 1, name: 'New Cat', categoryTaxes: [] })
      const cat = await api.createCategory('New Cat', [])
      expect(cat.name).toBe('New Cat')
    })

    it('deleteCategory calls del', async () => {
      httpClient.del.mockResolvedValue(undefined)
      await api.deleteCategory(1)
      expect(httpClient.del).toHaveBeenCalledWith('/category/1')
    })
  })

  describe('Activities', () => {
    it('getActivities returns mapped activities', async () => {
      httpClient.get.mockResolvedValue({
        data: [
          { id: 1, name: 'Shop', category: { id: 1, name: 'Commercio' }, employees: [] }
        ]
      })
      const acts = await api.getActivities()
      expect(acts).toHaveLength(1)
      expect(acts[0].name).toBe('Shop')
      expect(acts[0].categoryName).toBe('Commercio')
    })

    it('getActivityById returns null on error', async () => {
      httpClient.get.mockRejectedValue(new Error('Not found'))
      const act = await api.getActivityById(999)
      expect(act).toBeNull()
    })
  })

  describe('Persons', () => {
    it('searchPersons builds query params', async () => {
      httpClient.get.mockResolvedValue({ data: [] })
      await api.searchPersons({ name: 'John', surname: 'Doe' }, { page: 0, size: 10 })
      expect(httpClient.get).toHaveBeenCalledWith('/person?name=John&surname=Doe&page=0&size=10')
    })

    it('getPersonByUserId returns null on error', async () => {
      httpClient.get.mockRejectedValue(new Error('Not found'))
      const person = await api.getPersonByUserId(999)
      expect(person).toBeNull()
    })
  })

  describe('Taxes', () => {
    it('getTaxesByActivity returns data array', async () => {
      httpClient.get.mockResolvedValue({ data: [{ id: 1, amount: 200 }] })
      const taxes = await api.getTaxesByActivity(1)
      expect(taxes).toEqual([{ id: 1, amount: 200 }])
    })

    it('getTaxesByActivity returns empty array on error', async () => {
      httpClient.get.mockRejectedValue(new Error('fail'))
      const taxes = await api.getTaxesByActivity(999)
      expect(taxes).toEqual([])
    })

    it('createTax calls post', async () => {
      httpClient.post.mockResolvedValue({ id: 1 })
      const data = { earnings: 1000, expenses: 200, employeeUuid: 'uuid' }
      await api.createTax(1, data)
      expect(httpClient.post).toHaveBeenCalledWith('/tax/1', data)
    })
  })

  describe('Users', () => {
    it('getAllUsers calls /auth/users', async () => {
      httpClient.get.mockResolvedValue([{ username: 'admin' }])
      const users = await api.getAllUsers()
      expect(users).toEqual([{ username: 'admin' }])
    })

    it('searchUsers filters by username', async () => {
      httpClient.get.mockResolvedValue([
        { username: 'admin', email: 'admin@test.com' },
        { username: 'user', email: 'user@test.com' }
      ])
      const result = await api.searchUsers('admin')
      expect(result).toHaveLength(1)
      expect(result[0].username).toBe('admin')
    })

    it('searchUsers returns all if no search term', async () => {
      httpClient.get.mockResolvedValue([{ username: 'admin' }, { username: 'user' }])
      const result = await api.searchUsers('')
      expect(result).toHaveLength(2)
    })

    it('updateUserRole patches roles', async () => {
      httpClient.patch.mockResolvedValue({})
      const ok = await api.updateUserRole('uuid-123', ['GOVERNMENT'])
      expect(ok).toBe(true)
      expect(httpClient.patch).toHaveBeenCalledWith('/auth/users/uuid-123/roles', { roles: ['GOVERNMENT'] })
    })

    it('updateUserRole returns false on error', async () => {
      httpClient.patch.mockRejectedValue(new Error('fail'))
      const ok = await api.updateUserRole('uuid', ['ADMIN'])
      expect(ok).toBe(false)
    })
  })
})
