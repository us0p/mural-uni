import { apiClient } from './client'
import type { RoleResponse } from './types'

export async function getRoles(): Promise<RoleResponse[]> {
  return apiClient.get<RoleResponse[]>('/api/roles')
}
