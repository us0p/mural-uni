import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getNotices, getNotice, createNotice, updateNotice, deleteNotice } from '../notices'
import { apiClient, ApiError } from '../client'
import type { NoticePageResponse, NoticeResponse } from '../types'

vi.mock('../client', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../client')>()
  return {
    ...mod,
    apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn(), postFormData: vi.fn() },
  }
})

const mockNotice: NoticeResponse = {
  id: 1,
  userId: 1,
  username: 'admin',
  title: 'Test Notice',
  markdownContent: '# Hello',
  categoryId: 1,
  categoryName: 'Eventos',
  coverImgUrl: 'https://example.com/img.jpg',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

const mockPage: NoticePageResponse = {
  content: [mockNotice], page: 0, size: 10, totalElements: 1, totalPages: 1,
}

describe('notices API', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('getNotices', () => {
    it('calls GET /api/notices with no params by default', async () => {
      vi.mocked(apiClient.get).mockResolvedValue(mockPage)
      await getNotices()
      expect(apiClient.get).toHaveBeenCalledWith('/api/notices')
    })

    it('returns the paged response', async () => {
      vi.mocked(apiClient.get).mockResolvedValue(mockPage)
      const result = await getNotices()
      expect(result).toEqual(mockPage)
      expect(result.content).toHaveLength(1)
    })

    it('appends search_param when provided', async () => {
      vi.mocked(apiClient.get).mockResolvedValue(mockPage)
      await getNotices({ searchParam: 'hello' })
      expect(apiClient.get).toHaveBeenCalledWith('/api/notices?search_param=hello')
    })

    it('appends page and size when provided', async () => {
      vi.mocked(apiClient.get).mockResolvedValue(mockPage)
      await getNotices({ page: 2, size: 5 })
      expect(apiClient.get).toHaveBeenCalledWith('/api/notices?page=2&size=5')
    })

    it('appends all params when provided together', async () => {
      vi.mocked(apiClient.get).mockResolvedValue(mockPage)
      await getNotices({ searchParam: 'foo', page: 1, size: 20 })
      const call = vi.mocked(apiClient.get).mock.calls[0][0] as string
      expect(call).toContain('search_param=foo')
      expect(call).toContain('page=1')
      expect(call).toContain('size=20')
    })

    it('omits search_param when undefined or empty', async () => {
      vi.mocked(apiClient.get).mockResolvedValue(mockPage)
      await getNotices({ searchParam: '' })
      expect(apiClient.get).toHaveBeenCalledWith('/api/notices')
    })
  })

  describe('getNotice', () => {
    it('calls GET /api/notices/{id}', async () => {
      vi.mocked(apiClient.get).mockResolvedValue(mockNotice)
      await getNotice(1)
      expect(apiClient.get).toHaveBeenCalledWith('/api/notices/1')
    })

    it('returns the matching notice', async () => {
      vi.mocked(apiClient.get).mockResolvedValue(mockNotice)
      const result = await getNotice(1)
      expect(result).toEqual(mockNotice)
    })

    it('propagates ApiError when notice is not found', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new ApiError(404, 'Not Found'))
      await expect(getNotice(999)).rejects.toThrow(ApiError)
    })
  })

  describe('createNotice', () => {
    it('calls POST /api/notices with body', async () => {
      vi.mocked(apiClient.post).mockResolvedValue(mockNotice)
      const data = { title: 'New Notice', markdownContent: '# New', categoryId: 1 }
      await createNotice(data)
      expect(apiClient.post).toHaveBeenCalledWith('/api/notices', data)
    })

    it('returns the created notice', async () => {
      vi.mocked(apiClient.post).mockResolvedValue(mockNotice)
      const result = await createNotice({ title: 'New Notice', markdownContent: '# New', categoryId: 1 })
      expect(result).toEqual(mockNotice)
    })

    it('propagates ApiError on 401', async () => {
      vi.mocked(apiClient.post).mockRejectedValue(new ApiError(401, 'Unauthorized'))
      await expect(createNotice({ title: 'x', markdownContent: 'x', categoryId: 1 })).rejects.toThrow(ApiError)
    })
  })

  describe('updateNotice', () => {
    it('calls PUT /api/notices/{id} with body', async () => {
      vi.mocked(apiClient.put).mockResolvedValue(mockNotice)
      const data = { title: 'Updated', markdownContent: '# Updated', categoryId: 2 }
      await updateNotice(1, data)
      expect(apiClient.put).toHaveBeenCalledWith('/api/notices/1', data)
    })

    it('returns the updated notice', async () => {
      const updated = { ...mockNotice, title: 'Updated' }
      vi.mocked(apiClient.put).mockResolvedValue(updated)
      const result = await updateNotice(1, { title: 'Updated', markdownContent: '# U', categoryId: 2 })
      expect(result).toEqual(updated)
    })
  })

  describe('deleteNotice', () => {
    it('calls DELETE /api/notices/{id}', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue(undefined)
      await deleteNotice(1)
      expect(apiClient.delete).toHaveBeenCalledWith('/api/notices/1')
    })

    it('returns void on success', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue(undefined)
      const result = await deleteNotice(1)
      expect(result).toBeUndefined()
    })

    it('propagates ApiError on 403', async () => {
      vi.mocked(apiClient.delete).mockRejectedValue(new ApiError(403, 'Forbidden'))
      await expect(deleteNotice(1)).rejects.toThrow(ApiError)
    })
  })
})
