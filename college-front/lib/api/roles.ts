import { apiClient } from './client'
import type { PermissionObjectResponse, RolePageResponse, RolePermissionRequest, RolePermissionResponse, RoleRequest, RoleResponse } from './types'

export interface GetRolesParams {
  searchParam?: string
  page?: number
  size?: number
}

export async function getRoles(params: GetRolesParams = {}): Promise<RolePageResponse> {
  const query = new URLSearchParams()
  if (params.searchParam) query.set('search_param', params.searchParam)
  if (params.page !== undefined) query.set('page', String(params.page))
  if (params.size !== undefined) query.set('size', String(params.size))
  const qs = query.toString()
  const raw = await apiClient.get<RolePageResponse | RoleResponse[]>(`/api/roles${qs ? `?${qs}` : ''}`)

  if (Array.isArray(raw)) {
    return { content: raw, page: 0, size: raw.length, totalElements: raw.length, totalPages: 1 }
  }
  return raw
}

export function createRole(data: RoleRequest): Promise<RoleResponse> {
  return apiClient.post<RoleResponse>('/api/roles', data)
}

export function updateRole(id: number, data: RoleRequest): Promise<RoleResponse> {
  return apiClient.put<RoleResponse>(`/api/roles/${id}`, data)
}

export function deleteRole(id: number): Promise<void> {
  return apiClient.delete(`/api/roles/${id}`)
}

export function getPermissionObjects(): Promise<PermissionObjectResponse[]> {
  return apiClient.get<PermissionObjectResponse[]>('/api/permission-objects')
}

export function getRolePermissions(roleId: number): Promise<RolePermissionResponse[]> {
  return apiClient.get<RolePermissionResponse[]>(`/api/role-permissions/by-role/${roleId}`)
}

export function assignPermission(data: RolePermissionRequest): Promise<RolePermissionResponse> {
  return apiClient.post<RolePermissionResponse>('/api/role-permissions', data)
}

export function revokePermission(rolePermissionId: number): Promise<void> {
  return apiClient.delete(`/api/role-permissions/${rolePermissionId}`)
}
