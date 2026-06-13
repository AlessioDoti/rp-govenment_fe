/***
 * HTTP client.
 * Wrapper around the native fetch API to communicate with backend services.
 * Handles common headers, base URLs routing, and error throwing.
 */

const SERVICES = {
  auth: 'http://localhost:8083',
  person: 'http://localhost:8082',
  burocracy: 'http://localhost:8081'
}

function getBaseUrl(path) {
  if (path.startsWith('/auth')) return SERVICES.auth
  if (path.startsWith('/person')) return SERVICES.person
  return SERVICES.burocracy
}

function getHeaders() {
  const headers = { 'Content-Type': 'application/json' }
  try {
    const raw = localStorage.getItem('session')
    if (raw) {
      const session = JSON.parse(raw)
      if (session.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }
    }
  } catch {}
  return headers
}

/***
 * Throws a structured error when the HTTP response is not ok.
 * On 401, dispatches a global event so the UI layer can clean the session
 * and show a warning to the user.
 * @param {Response} res
 * @returns {Promise<void>}
 */
async function assertOk(res) {
  if (res.ok) return
  if (res.status === 401) {
    window.dispatchEvent(new CustomEvent('session-expired'))
  }
  let details = `HTTP ${res.status}`
  try {
    const body = await res.json()
    if (body?.error?.message) {
      details = body.error.message
      if (Array.isArray(body.error.details) && body.error.details.length > 0) {
        details += ': ' + body.error.details.join('; ')
      }
    } else if (body?.error?.code) {
      details = `${body.error.code}: ${body.error.message ?? res.statusText}`
    }
  } catch {}
  throw new Error(details)
}

/***
 * GET request.
 * @param {string} path — es. `/category?page=0&size=20`
 * @returns {Promise<any>}
 */
async function get(path) {
  const res = await fetch(`${getBaseUrl(path)}${path}`, { headers: getHeaders() })
  await assertOk(res)
  return res.json()
}

/***
 * DELETE request.
 * @param {string} path — es. `/category/1`
 * @returns {Promise<void>}
 */
async function del(path) {
  const res = await fetch(`${getBaseUrl(path)}${path}`, { method: 'DELETE', headers: getHeaders() })
  await assertOk(res)
}

/***
 * POST request with JSON body.
 * @param {string} path
 * @param {object} body
 * @returns {Promise<any>}
 */
async function post(path, body) {
  const res = await fetch(`${getBaseUrl(path)}${path}`, {
    method: 'POST',
    headers: getHeaders(),
    body: body ? JSON.stringify(body) : undefined
  })
  await assertOk(res)
  return res.json()
}

/***
 * PUT request with JSON body.
 * @param {string} path
 * @param {object} body
 * @returns {Promise<any>}
 */
async function put(path, body) {
  const res = await fetch(`${getBaseUrl(path)}${path}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(body)
  })
  await assertOk(res)
  return res.json()
}

/***
 * PATCH request with JSON body.
 * @param {string} path
 * @param {object} body
 * @returns {Promise<any>}
 */
async function patch(path, body) {
  const res = await fetch(`${getBaseUrl(path)}${path}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(body)
  })
  await assertOk(res)
  return res.json()
}

export const httpClient = { get, del, post, put, patch }
