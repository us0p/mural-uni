import { apiClient } from './client'
import type { NoticeCategoryRequest, NoticeCategoryResponse } from './types'

export function getNoticeCategories(): Promise<NoticeCategoryResponse[]> {
  return apiClient.get<NoticeCategoryResponse[]>('/api/notice-categories')
}

export function createNoticeCategory(data: NoticeCategoryRequest): Promise<NoticeCategoryResponse> {
  return apiClient.post<NoticeCategoryResponse>('/api/notice-categories', data)
}

export function updateNoticeCategory(id: number, data: NoticeCategoryRequest): Promise<NoticeCategoryResponse> {
  return apiClient.put<NoticeCategoryResponse>(`/api/notice-categories/${id}`, data)
}

export function deleteNoticeCategory(id: number): Promise<void> {
  return apiClient.delete(`/api/notice-categories/${id}`)
}
