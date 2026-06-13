/***
 * API port — single access point for backend communication.
 */

import { httpClient } from './httpClient.js'

/***
 * @typedef {import('@/domain/models').UserCredentials} UserCredentials
 * @typedef {import('@/domain/models').SessionUser} SessionUser
 * @typedef {import('@/domain/models').UserPublic} UserPublic
 * @typedef {import('@/domain/models').Category} Category
 * @typedef {import('@/domain/models').Activity} Activity
 */

/***
 * Adapts a category from API format to domain format.
 * @param {object} raw
 * @returns {Category}
 */
function mapCategory(raw) {
  return {
    id: raw.id,
    name: raw.name,
    categoryTaxes: (raw.categoryTaxes || []).map((t) => ({
      id: t.id,
      amount: t.amount,
      rate: t.rate
    }))
  }
}

/***
 * Adapts an activity from API format to domain format.
 * @param {object} raw
 * @returns {Activity}
 */
function mapActivity(raw) {
  const cat = raw.category || {}
  return {
    id: raw.id,
    name: raw.name,
    address: raw.address,
    category: cat.id ?? raw.category,
    categoryName: cat.name || '',
    employees: raw.employees || []
  }
}

/***
 * Decode JWT token payload.
 * @param {string} token
 * @returns {object}
 */
function decodeJwt(token) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(window.atob(base64))
  } catch (e) {
    return {}
  }
}

/***
 * Refresh the access token if it is close to expiration.
 * @returns {Promise<string|null>}
 */
async function refreshAccessToken() {
  const raw = localStorage.getItem('session')
  if (!raw) return null
  const session = JSON.parse(raw)
  if (!session.refresh_token) return null
  try {
    const tokenRes = await httpClient.post('/auth/token', {
      grant_type: 'refresh_token',
      refresh_token: session.refresh_token
    })
    const newSession = { ...session, access_token: tokenRes.access_token }
    localStorage.setItem('session', JSON.stringify(newSession))
    return tokenRes.access_token
  } catch {
    localStorage.removeItem('session')
    return null
  }
}

/***
 * Ensure a valid (non-expired) token is present.
 */
async function ensureValidToken() {
  const raw = localStorage.getItem('session')
  if (!raw) return
  const sess = JSON.parse(raw)
  if (!sess.access_token) return
  const payload = decodeJwt(sess.access_token)
  const now = Math.floor(Date.now() / 1000)
  if (payload.exp && payload.exp - now < 30) {
    await refreshAccessToken()
  }
}

export const api = {
  /** @param {UserCredentials} credentials @returns {Promise<SessionUser>} */
  async authenticate(credentials) {
    const tokenRes = await httpClient.post('/auth/token', {
      grant_type: 'password',
      username: credentials.username,
      password: credentials.password
    })

    const tempSession = { access_token: tokenRes.access_token }
    localStorage.setItem('session', JSON.stringify(tempSession))

    try {
      const userInfo = await httpClient.get('/auth/userinfo')
      const payload = decodeJwt(tokenRes.access_token)
      return {
        ...userInfo,
        name: userInfo.username,
        access_token: tokenRes.access_token,
        refresh_token: tokenRes.refresh_token,
        userId: payload.userId
      }
    } catch (e) {
      localStorage.removeItem('session')
      throw e
    }
  },

  /** @param {{ firstname: string, lastname: string, username: string, password: string }} payload @returns {Promise<SessionUser>} */
  async registerUser(payload) {
    // 1. Create user in auth service
    const createdUser = await httpClient.post('/auth/register', {
      username: payload.username,
      email: payload.email || `${payload.username}@example.com`,
      password: payload.password
    })

    if (payload.firstname || payload.lastname || payload.birthDate) {
      await api.createPerson({
        name: payload.firstname || '',
        surname: payload.lastname || '',
        birthDate: payload.birthDate || '',
        userId: createdUser.userId
      }).catch(() => {
        // Person creation is best-effort — log but don't block registration
        console.warn('[registerUser] Failed to create person for user', createdUser.userId)
      })
    }

    return api.authenticate({ username: payload.username, password: payload.password })
  },

  /** @returns {Promise<Category[]>} */
  async getCategories() {
    const page = await httpClient.get('/category?page=0&size=200')
    return (page.data || []).map(mapCategory)
  },

  /** @param {number} id @returns {Promise<Category|null>} */
  async getCategoryById(id) {
    try {
      const page = await httpClient.get('/category?page=0&size=200')
      const found = (page.data || []).find((c) => c.id === Number(id))
      return found ? mapCategory(found) : null
    } catch { return null }
  },

  /** @param {string} name @param {Array<{ amount: number, rate: number }>} categoryTaxes @returns {Promise<Category>} */
  async createCategory(name, categoryTaxes) {
    const raw = await httpClient.post('/category', { name, categoryTaxes })
    return mapCategory(raw)
  },

  /** @param {number} id @param {{ name: string, categoryTaxes: Array<{ amount: number, rate: number }> }} data @returns {Promise<Category>} */
  async updateCategory(id, data) {
    const raw = await httpClient.put(`/category/${id}`, {
      name: data.name,
      categoryTaxes: data.categoryTaxes
    })
    return mapCategory(raw)
  },

  /** @param {number} id @returns {Promise<void>} */
  async deleteCategory(id) {
    await httpClient.del(`/category/${id}`)
  },

  /** @returns {Promise<Activity[]>} */
  async getActivities() {
    const page = await httpClient.get('/activity?page=0&size=200')
    return (page.data || []).map(mapActivity)
  },

  /** @param {number} id @returns {Promise<Activity|null>} */
  async getActivityById(id) {
    try {
      const raw = await httpClient.get(`/activity/${id}`)
      return raw ? mapActivity(raw) : null
    } catch { return null }
  },

  /**
   * Paginated search of people by name and/or surname (partial LIKE match).
   * @param {{ name?: string, surname?: string }} criteria
   * @param {{ page?: number, size?: number }} [pageable]
   * @returns {Promise<{ data: Array<{ id: number, name: string, surname: string, externalUuid: string }>, page: number, size: number, total: number, totalPages: number }>}
   */
  async searchPersons(criteria, pageable) {
    const params = new URLSearchParams()
    if (criteria.name) params.set('name', criteria.name)
    if (criteria.surname) params.set('surname', criteria.surname)
    if (pageable) {
      params.set('page', String(pageable.page ?? 0))
      params.set('size', String(pageable.size ?? 20))
    }
    return httpClient.get(`/person?${params.toString()}`)
  },

  /** @param {number} userId @returns {Promise<any>} */
  async getPersonByUserId(userId) {
    try {
      return await httpClient.get(`/person/by-user/${userId}`)
    } catch { return null }
  },

  /** @param {string} uuid @returns {Promise<{ name: string, surname: string }|null>} */
  async getPersonByUuid(uuid) {
    try {
      return await httpClient.get(`/person/${uuid}`)
    } catch { return null }
  },

  /** @param {number|string} activityId @returns {Promise<any[]>} */
  async getTaxesByActivity(activityId) {
    try {
      const page = await httpClient.get(`/tax/${activityId}?page=0&size=200`)
      return page.data || []
    } catch { return [] }
  },

  /** @param {number|string} activityId @param {{ earnings: number, expenses: number, employeeUuid: string }} data @returns {Promise<any>} */
  async createTax(activityId, data) {
    return httpClient.post(`/tax/${activityId}`, data)
  },

  /** @param {number|string} id @param {{ payed?: boolean }} data @returns {Promise<any>} */
  async updateTax(id, data) {
    return httpClient.patch(`/tax/${id}`, data)
  },

  /** @returns {Promise<Activity|null>} */
  async getActivityByEmployee(userId) {
    try {
      const person = await this.getPersonByUserId(userId)
      if (!person || !person.externalUuid) return null
      const activities = await httpClient.get(`/activity/employee/${person.externalUuid}`)
      if (activities && activities.length > 0) {
        return mapActivity(activities[0])
      }
      return null
    } catch { return null }
  },

  /** @param {number} userId @returns {Promise<Activity|null>} */
  async getActivityByUserId(userId) {
    return this.getActivityByEmployee(userId)
  },

  /**
   * Returns ALL activities linked to the user (by person UUID).
   * @param {number} userId
   * @returns {Promise<Activity[]>}
   */
  async getActivitiesByUserId(userId) {
    try {
      const person = await this.getPersonByUserId(userId)
      if (!person || !person.externalUuid) return []
      const activities = await httpClient.get(`/activity/employee/${person.externalUuid}`)
      return (activities || []).map(mapActivity)
    } catch { return [] }
  },

  /** @param {string} name @param {number} categoryId @returns {Promise<Activity>} */
  async createActivity(name, categoryId) {
    const raw = await httpClient.post(`/activity/${categoryId}`, { name, address: 0 })
    return mapActivity(raw)
  },

  /** @param {number} id @param {{ name?: string, address?: number, category?: number }} patch */
  async updateActivity(id, patch) {
    const raw = await httpClient.patch(`/activity/${id}`, patch)
    return mapActivity(raw)
  },

  /** @param {number} id @returns {Promise<void>} */
  async deleteActivity(id) {
    await httpClient.del(`/activity/${id}`)
  },

  /** @param {{ name: string, surname: string, birthDate: string, userId?: number }} data @returns {Promise<Object>} */
  async createPerson(data) {
    return httpClient.post('/person', data)
  },

  /** @returns {Promise<UserPublic[]>} */
  async getAllUsers() {
    return httpClient.get('/auth/users')
  },

  /** @param {string} username @returns {Promise<UserPublic|null>} */
  async getUserById(username) {
    try {
      const users = await httpClient.get('/auth/users')
      return users.find((u) => u.username === username) || null
    } catch { return null }
  },

  /** @param {string} uuid @param {string[]} newRoles @returns {Promise<boolean>} */
  async updateUserRole(uuid, newRoles) {
    try {
      await httpClient.patch(`/auth/users/${uuid}/roles`, { roles: newRoles })
      return true
    } catch { return false }
  },

  /** @param {string} username @returns {Promise<boolean>} */
  async deleteUser(username) {
    return true
  },

  /** @param {string} searchTerm @returns {Promise<UserPublic[]>} */
  async searchUsers(searchTerm) {
    try {
      const users = await httpClient.get('/auth/users')
      if (!searchTerm) return users
      const lower = searchTerm.toLowerCase()
      return users.filter(
        (u) =>
          u.username.toLowerCase().includes(lower) ||
          (u.email && u.email.toLowerCase().includes(lower))
      )
    } catch { return [] }
  },

  ensureValidToken,
  refreshAccessToken
}