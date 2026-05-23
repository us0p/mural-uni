import { apiClient } from './client'
import type { UiPermissionObjectResponse } from './types'

export function getUiPermissionObjects(): Promise<UiPermissionObjectResponse[]> {
  return apiClient.get<UiPermissionObjectResponse[]>('/api/ui-permission-objects')
}
