import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createApiClient, ApiError } from '../client'

describe('createApiClient', () => {
  let mockFetch: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockFetch = vi.fn()
    vi.stubGlobal('fetch', mockFetch)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  function makeResponse(body: unknown, status = 200): Response {
    return {
      ok: status >= 200 && status < 300,
      status,
      statusText: status === 200 ? 'OK' : 'Error',
      json: () => Promise.resolve(body),
    } as unknown as Response
  }

  const client = createApiClient('http://localhost:8080')

  describe('get', () => {
    it('fetches the correct URL', async () => {
      mockFetch.mockResolvedValue(makeResponse([]))

      await client.get('/api/users')

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/users',
        expect.objectContaining({ method: 'GET' }),
      )
    })

    it('sets Content-Type header', async () => {
      mockFetch.mockResolvedValue(makeResponse({}))

      await client.get('/api/users')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
        }),
      )
    })

    it('uses cookie-based auth (no Authorization header)', async () => {
      mockFetch.mockResolvedValue(makeResponse({}))

      await client.get('/api/posts')

      const [, options] = mockFetch.mock.calls[0] as [string, RequestInit]
      expect((options.headers as Record<string, string>)['Authorization']).toBeUndefined()
      expect(options.credentials).toBe('include')
    })

    it('returns parsed JSON body', async () => {
      const data = [{ id: 1, username: 'admin' }]
      mockFetch.mockResolvedValue(makeResponse(data))

      const result = await client.get('/api/users')

      expect(result).toEqual(data)
    })

    it('throws ApiError with status 401 on Unauthorized', async () => {
      mockFetch.mockResolvedValue(makeResponse({ message: 'Unauthorized' }, 401))

      const err = await client.get('/api/users').catch((e) => e) as ApiError

      expect(err).toBeInstanceOf(ApiError)
      expect(err.status).toBe(401)
    })

    it('throws ApiError with status 500 on server error', async () => {
      mockFetch.mockResolvedValue(makeResponse({ message: 'Internal Server Error' }, 500))

      const err = await client.get('/api/users').catch((e) => e) as ApiError

      expect(err).toBeInstanceOf(ApiError)
      expect(err.status).toBe(500)
    })

    it('uses detail from response body in ApiError', async () => {
      mockFetch.mockResolvedValue(makeResponse({ detail: 'Token expired' }, 401))

      const err = await client.get('/api/users').catch((e) => e) as ApiError

      expect(err.message).toBe('Token expired')
    })
  })

  describe('post', () => {
    it('sends POST with serialized JSON body', async () => {
      mockFetch.mockResolvedValue(makeResponse({ userId: 1 }))
      const body = { username: 'admin', password: 'secret' }

      await client.post('/api/auth/login', body)

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/auth/login',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(body),
          headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
        }),
      )
    })

    it('throws ApiError on 400', async () => {
      mockFetch.mockResolvedValue(makeResponse({ message: 'Validation error' }, 400))

      const err = await client.post('/api/auth/login', {}).catch((e) => e) as ApiError

      expect(err).toBeInstanceOf(ApiError)
      expect(err.status).toBe(400)
    })
  })

  describe('put', () => {
    it('sends PUT with serialized JSON body', async () => {
      mockFetch.mockResolvedValue(makeResponse({ id: 1 }))

      await client.put('/api/users/1', { username: 'updated' })

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/users/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ username: 'updated' }),
        }),
      )
    })
  })

  describe('delete', () => {
    it('sends DELETE and returns undefined on 204', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 204,
        json: () => Promise.resolve(null),
      } as unknown as Response)

      const result = await client.delete('/api/users/1')

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/users/1',
        expect.objectContaining({ method: 'DELETE' }),
      )
      expect(result).toBeUndefined()
    })
  })

  describe('postFormData', () => {
    it('sends FormData without Content-Type header so browser sets boundary', async () => {
      mockFetch.mockResolvedValue(makeResponse({ id: 1 }))
      const formData = new FormData()
      formData.append('file', new Blob(['content']), 'test.pdf')

      await client.postFormData('/api/documents', formData, { userId: '1' })

      const [, options] = mockFetch.mock.calls[0] as [string, RequestInit]
      expect((options.headers as Record<string, string> | undefined)?.['Content-Type']).toBeUndefined()
      expect(options.body).toBeInstanceOf(FormData)
    })

    it('appends query params to URL', async () => {
      mockFetch.mockResolvedValue(makeResponse({ id: 1 }))
      const formData = new FormData()

      await client.postFormData('/api/documents', formData, { userId: '5', knowledgeBase: 'true' })

      const [url] = mockFetch.mock.calls[0] as [string]
      expect(url).toContain('userId=5')
      expect(url).toContain('knowledgeBase=true')
    })
  })
})
