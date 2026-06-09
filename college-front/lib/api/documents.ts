import { apiClient } from './client'
import type { DocumentResponse } from './types'

export function getDocuments(): Promise<DocumentResponse[]> {
  return apiClient.get<DocumentResponse[]>('/api/documents')
}

export function getPublicDocuments(): Promise<DocumentResponse[]> {
  return apiClient.get<DocumentResponse[]>('/api/documents/public')
}

export function uploadDocument(
  file: File,
  description?: string,
  knowledgeBase = false,
  isPublic = false,
  recipientId?: number,
): Promise<DocumentResponse> {
  const formData = new FormData()
  formData.append('file', file)
  const params: Record<string, string> = {
    knowledgeBase: String(knowledgeBase),
    isPublic: String(isPublic),
  }
  if (description?.trim()) params.description = description.trim()
  if (recipientId !== undefined) params.recipientId = String(recipientId)
  return apiClient.postFormData<DocumentResponse>('/api/documents', formData, params)
}

export function getMyDocuments(): Promise<DocumentResponse[]> {
  return apiClient.get<DocumentResponse[]>('/api/documents/mine')
}

export function deleteDocument(id: number): Promise<void> {
  return apiClient.delete(`/api/documents/${id}`)
}
