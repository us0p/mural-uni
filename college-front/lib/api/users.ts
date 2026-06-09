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

export async function getStudents(searchParam?: string, page = 0, size = 20): Promise<UserPageResponse> {
  const query = new URLSearchParams()
  if (searchParam?.trim()) query.set('search_param', searchParam.trim())
  query.set('page', String(page))
  query.set('size', String(size))
  return apiClient.get<UserPageResponse>(`/api/users/students?${query.toString()}`)
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
