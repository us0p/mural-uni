import { apiClient } from './client'
import type { NoticePageResponse, NoticeRequest, NoticeResponse, NoticeUpdateRequest } from './types'

export interface GetNoticesParams {
  searchParam?: string
  page?: number
  size?: number
}

export function getNotices(params: GetNoticesParams = {}): Promise<NoticePageResponse> {
  const query = new URLSearchParams()
  if (params.searchParam) query.set('search_param', params.searchParam)
  if (params.page !== undefined) query.set('page', String(params.page))
  if (params.size !== undefined) query.set('size', String(params.size))
  const qs = query.toString()
  return apiClient.get<NoticePageResponse>(`/api/notices${qs ? `?${qs}` : ''}`)
}

export function getNotice(id: number): Promise<NoticeResponse> {
  return apiClient.get<NoticeResponse>(`/api/notices/${id}`)
}

export function createNotice(data: NoticeRequest): Promise<NoticeResponse> {
  return apiClient.post<NoticeResponse>('/api/notices', data)
}

export function updateNotice(id: number, data: NoticeUpdateRequest): Promise<NoticeResponse> {
  return apiClient.put<NoticeResponse>(`/api/notices/${id}`, data)
}

export function deleteNotice(id: number): Promise<void> {
  return apiClient.delete(`/api/notices/${id}`)
}
