import { apiClient } from './client'
import type { AlunoStatsResponse, NoticeCategoryResponse, NoticeWithPresenceResponse } from './types'

export function getAlunoDashboard(): Promise<AlunoStatsResponse> {
  return apiClient.get<AlunoStatsResponse>('/api/aluno/dashboard')
}

export function getSubscriptions(): Promise<NoticeCategoryResponse[]> {
  return apiClient.get<NoticeCategoryResponse[]>('/api/aluno/subscriptions')
}

export function setSubscriptions(categoryIds: number[]): Promise<void> {
  return apiClient.put<void>('/api/aluno/subscriptions', { categoryIds })
}

export function getPresences(): Promise<NoticeWithPresenceResponse[]> {
  return apiClient.get<NoticeWithPresenceResponse[]>('/api/aluno/presences')
}

export function markPresence(noticeId: number): Promise<void> {
  return apiClient.post<void>(`/api/aluno/presences/${noticeId}`, {})
}

export function removePresence(noticeId: number): Promise<void> {
  return apiClient.delete(`/api/aluno/presences/${noticeId}`)
}
