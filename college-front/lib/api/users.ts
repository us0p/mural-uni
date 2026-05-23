import { apiClient } from './client'
import type { UserPageResponse, UserRequest, UserResponse } from './types'

export interface GetUsersParams {
  searchParam?: string
  page?: number
  size?: number
}

export async function getUsers(params: GetUsersParams = {}): Promise<UserPageResponse> {
  const query = new URLSearchParams()
  if (params.searchParam) query.set('search_param', params.searchParam)
  if (params.page !== undefined) query.set('page', String(params.page))
  if (params.size !== undefined) query.set('size', String(params.size))
  const qs = query.toString()
  return apiClient.get<UserPageResponse>(`/api/users${qs ? `?${qs}` : ''}`)
}

export function createUser(data: UserRequest): Promise<UserResponse> {
  return apiClient.post<UserResponse>('/api/users', data)
}

export function updateUser(id: number, data: UserRequest): Promise<UserResponse> {
  return apiClient.put<UserResponse>(`/api/users/${id}`, data)
}

export function deleteUser(id: number): Promise<void> {
  return apiClient.delete(`/api/users/${id}`)
}
