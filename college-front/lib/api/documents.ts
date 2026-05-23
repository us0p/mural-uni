import { apiClient } from './client'
import type { DocumentResponse } from './types'

export function getDocuments(): Promise<DocumentResponse[]> {
  return apiClient.get<DocumentResponse[]>('/api/documents')
}

export function uploadDocument(
  file: File,
  description?: string,
  knowledgeBase = false,
): Promise<DocumentResponse> {
  const formData = new FormData()
  formData.append('file', file)
  const params: Record<string, string> = { knowledgeBase: String(knowledgeBase) }
  if (description?.trim()) params.description = description.trim()
  return apiClient.postFormData<DocumentResponse>('/api/documents', formData, params)
}

export function deleteDocument(id: number): Promise<void> {
  return apiClient.delete(`/api/documents/${id}`)
}
