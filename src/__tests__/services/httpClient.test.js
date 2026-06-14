import { describe, it, expect, vi, beforeEach } from 'vitest'
import { httpClient } from '@/services/httpClient.js'

const mockFetch = vi.fn()
global.fetch = mockFetch

function mockResponse(data, status = 200, ok = true) {
  return Promise.resolve({
    ok,
    status,
    json: () => Promise.resolve(data),
    statusText: status === 401 ? 'Unauthorized' : 'OK'
  })
}

describe('httpClient', () => {
  beforeEach(() => {
    mockFetch.mockReset()
    localStorage.clear()
  })

  describe('URL routing', () => {
    it('routes /auth/* to auth service', async () => {
      mockFetch.mockResolvedValue(mockResponse({ user: 'test' }))
      await httpClient.get('/auth/userinfo')
      const url = mockFetch.mock.calls[0][0]
      expect(url).toMatch(/^http:\/\/localhost:8083\/auth\/userinfo$/)
    })

    it('routes /person/* to person service', async () => {
      mockFetch.mockResolvedValue(mockResponse({ data: [] }))
      await httpClient.get('/person?page=0')
      const url = mockFetch.mock.calls[0][0]
      expect(url).toMatch(/^http:\/\/localhost:8082\/person\?page=0$/)
    })

    it('routes other paths to burocracy service', async () => {
      mockFetch.mockResolvedValue(mockResponse({ data: [] }))
      await httpClient.get('/category?page=0')
      const url = mockFetch.mock.calls[0][0]
      expect(url).toMatch(/^http:\/\/localhost:8081\/category\?page=0$/)
    })

    it('routes /activity/* to burocracy service', async () => {
      mockFetch.mockResolvedValue(mockResponse({ data: [] }))
      await httpClient.get('/activity?page=0')
      const url = mockFetch.mock.calls[0][0]
      expect(url).toMatch(/^http:\/\/localhost:8081\/activity\?page=0$/)
    })
  })

  describe('Headers', () => {
    it('includes Content-Type application/json', async () => {
      mockFetch.mockResolvedValue(mockResponse({}))
      await httpClient.get('/auth/userinfo')
      const headers = mockFetch.mock.calls[0][1].headers
      expect(headers['Content-Type']).toBe('application/json')
    })

    it('includes Authorization header when session has access_token', async () => {
      localStorage.setItem('session', JSON.stringify({ access_token: 'my-token' }))
      mockFetch.mockResolvedValue(mockResponse({}))
      await httpClient.get('/auth/userinfo')
      const headers = mockFetch.mock.calls[0][1].headers
      expect(headers['Authorization']).toBe('Bearer my-token')
    })

    it('does not add Authorization header when no session', async () => {
      mockFetch.mockResolvedValue(mockResponse({}))
      await httpClient.get('/auth/userinfo')
      const headers = mockFetch.mock.calls[0][1].headers
      expect(headers['Authorization']).toBeUndefined()
    })
  })

  describe('HTTP methods', () => {
    it('get sends GET request', async () => {
      mockFetch.mockResolvedValue(mockResponse({ data: [1, 2] }))
      const result = await httpClient.get('/category?page=0')
      expect(mockFetch.mock.calls[0][1].method).toBeUndefined()
      expect(result).toEqual({ data: [1, 2] })
    })

    it('post sends POST request with body', async () => {
      mockFetch.mockResolvedValue(mockResponse({ id: 1 }))
      const result = await httpClient.post('/category', { name: 'Test' })
      expect(mockFetch.mock.calls[0][1].method).toBe('POST')
      expect(JSON.parse(mockFetch.mock.calls[0][1].body)).toEqual({ name: 'Test' })
      expect(result).toEqual({ id: 1 })
    })

    it('post works without body', async () => {
      mockFetch.mockResolvedValue(mockResponse({}))
      const result = await httpClient.post('/auth/token', null)
      expect(mockFetch.mock.calls[0][1].body).toBeUndefined()
    })

    it('put sends PUT request with body', async () => {
      mockFetch.mockResolvedValue(mockResponse({ id: 1 }))
      const result = await httpClient.put('/category/1', { name: 'Updated' })
      expect(mockFetch.mock.calls[0][1].method).toBe('PUT')
      expect(result).toEqual({ id: 1 })
    })

    it('patch sends PATCH request with body', async () => {
      mockFetch.mockResolvedValue(mockResponse({ id: 1 }))
      const result = await httpClient.patch('/tax/1', { payed: true })
      expect(mockFetch.mock.calls[0][1].method).toBe('PATCH')
      expect(result).toEqual({ id: 1 })
    })

    it('del sends DELETE request', async () => {
      mockFetch.mockResolvedValue(mockResponse(null))
      await httpClient.del('/category/1')
      expect(mockFetch.mock.calls[0][1].method).toBe('DELETE')
    })
  })

  describe('Error handling', () => {
    it('throws structured error on non-OK response', async () => {
      mockFetch.mockResolvedValue(mockResponse({ error: { message: 'Not found' } }, 404, false))
      await expect(httpClient.get('/category/999')).rejects.toThrow('Not found')
    })

    it('dispatches session-expired event on 401', async () => {
      const dispatchSpy = vi.spyOn(window, 'dispatchEvent')
      mockFetch.mockResolvedValue(mockResponse({}, 401, false))
      await expect(httpClient.get('/auth/userinfo')).rejects.toThrow()
      expect(dispatchSpy).toHaveBeenCalledWith(expect.any(CustomEvent))
      expect(dispatchSpy.mock.calls[0][0].type).toBe('session-expired')
    })

    it('handles error with code (no message)', async () => {
      mockFetch.mockResolvedValue(mockResponse({ error: { code: 'ERR' } }, 400, false))
      await expect(httpClient.post('/auth/token', {}))
        .rejects
        .toThrow(/ERR: OK/)
    })

    it('handles error with details array', async () => {
      mockFetch.mockResolvedValue(mockResponse({
        error: { message: 'Validation failed', details: ['Field required', 'Too long'] }
      }, 422, false))
      await expect(httpClient.post('/category', {})).rejects.toThrow('Validation failed: Field required; Too long')
    })

    it('falls back to HTTP status text when no error body', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.reject(new Error('no json'))
      })
      await expect(httpClient.get('/category')).rejects.toThrow('HTTP 500')
    })
  })
})
