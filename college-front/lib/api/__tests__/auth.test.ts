import { describe, it, expect, vi, beforeEach } from 'vitest'
import { login } from '../auth'
import { apiClient, ApiError } from '../client'

vi.mock('../client', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../client')>()
  return {
    ...mod,
    apiClient: { post: vi.fn() },
  }
})

describe('login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls POST /api/auth/login with the given credentials', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ token: 'jwt-token' })

    await login({ username: 'admin', password: 'secret' })

    expect(apiClient.post).toHaveBeenCalledWith('/api/auth/login', {
      username: 'admin',
      password: 'secret',
    })
  })

  it('returns the LoginResponse containing the token', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ token: 'returned-token' })

    const result = await login({ username: 'admin', password: 'secret' })

    expect(result).toEqual({ token: 'returned-token' })
  })

  it('propagates ApiError when the server returns 401', async () => {
    vi.mocked(apiClient.post).mockRejectedValue(new ApiError(401, 'Invalid credentials'))

    await expect(login({ username: 'wrong', password: 'wrong' })).rejects.toThrow(ApiError)
  })

  it('propagates ApiError status from server response', async () => {
    vi.mocked(apiClient.post).mockRejectedValue(new ApiError(401, 'Invalid credentials'))

    const err = await login({ username: 'x', password: 'y' }).catch((e) => e)

    expect(err.status).toBe(401)
  })
})
