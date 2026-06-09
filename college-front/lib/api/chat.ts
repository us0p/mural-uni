import { apiClient } from './client'
import type { ChatRequest, ChatResponse } from './types'

export function askChat(request: ChatRequest): Promise<ChatResponse> {
  return apiClient.post<ChatResponse>('/api/chat', request)
}
