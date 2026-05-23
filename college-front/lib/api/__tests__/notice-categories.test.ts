import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getNoticeCategories } from '../notice-categories'
import { apiClient, ApiError } from '../client'
import type { NoticeCategoryResponse } from '../types'

vi.mock('../client', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../client')>()
  return {
    ...mod,
    apiClient: { get: vi.fn() },
  }
})

const mockCategories: NoticeCategoryResponse[] = [
  { id: 1, name: 'Eventos' },
  { id: 2, name: 'Estágios' },
  { id: 3, name: 'Anúncios' },
]

describe('getNoticeCategories', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls GET /api/notice-categories', async () => {
    vi.mocked(apiClient.get).mockResolvedValue(mockCategories)

    await getNoticeCategories()

    expect(apiClient.get).toHaveBeenCalledWith('/api/notice-categories')
  })

  it('returns the list of categories', async () => {
    vi.mocked(apiClient.get).mockResolvedValue(mockCategories)

    const result = await getNoticeCategories()

    expect(result).toEqual(mockCategories)
  })

  it('propagates ApiError on 401', async () => {
    vi.mocked(apiClient.get).mockRejectedValue(new ApiError(401, 'Unauthorized'))

    await expect(getNoticeCategories()).rejects.toThrow(ApiError)
  })
})
