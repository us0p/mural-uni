import { describe, it, expect, vi, beforeEach } from 'vitest'
import { askChat } from '../chat'
import { apiClient, ApiError } from '../client'
import type { ChatResponse } from '../types'

vi.mock('../client', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../client')>()
  return {
    ...mod,
    apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn(), postFormData: vi.fn() },
  }
})

const mockResponse: ChatResponse = {
  answer: 'Conteúdo relevante sobre o regulamento.',
  sources: [{ documentId: 1, fileName: 'regulamento.pdf', chunkIndex: 0, isPublic: true }],
}

describe('chat API', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('askChat', () => {
    it('calls POST /api/chat with the question', async () => {
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)
      await askChat({ question: 'Qual o regulamento?' })
      expect(apiClient.post).toHaveBeenCalledWith('/api/chat', { question: 'Qual o regulamento?' })
    })

    it('calls POST /api/chat with question and contextChunks when provided', async () => {
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)
      await askChat({ question: 'Qual o regulamento?', contextChunks: 3 })
      expect(apiClient.post).toHaveBeenCalledWith('/api/chat', { question: 'Qual o regulamento?', contextChunks: 3 })
    })

    it('returns answer and sources from response', async () => {
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)
      const result = await askChat({ question: 'Qual o regulamento?' })
      expect(result.answer).toBe('Conteúdo relevante sobre o regulamento.')
      expect(result.sources).toHaveLength(1)
      expect(result.sources[0].documentId).toBe(1)
      expect(result.sources[0].fileName).toBe('regulamento.pdf')
      expect(result.sources[0].isPublic).toBe(true)
    })

    it('returns empty sources when no chunks found', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({
        answer: 'Eu não tenho essa informação na minha base de dados.',
        sources: [],
      })
      const result = await askChat({ question: 'pergunta sem resposta' })
      expect(result.sources).toHaveLength(0)
    })

    it('propagates ApiError on 401', async () => {
      vi.mocked(apiClient.post).mockRejectedValue(new ApiError(401, 'Unauthorized'))
      await expect(askChat({ question: 'test' })).rejects.toThrow(ApiError)
    })

    it('propagates ApiError on 500', async () => {
      vi.mocked(apiClient.post).mockRejectedValue(new ApiError(500, 'Internal Server Error'))
      await expect(askChat({ question: 'test' })).rejects.toThrow(ApiError)
    })
  })
})
