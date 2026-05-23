import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getUiPermissionObjects } from '../ui-items'
import { apiClient } from '../client'
import type { UiPermissionObjectResponse } from '../types'

vi.mock('../client', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../client')>()
  return {
    ...mod,
    apiClient: { get: vi.fn() },
  }
})

const mockAssignments: UiPermissionObjectResponse[] = [
  { id: 1, uiItemName: 'admin_dashboard', permissionId: 1, permissionName: 'manage_users' },
  { id: 2, uiItemName: 'admin_users', permissionId: 1, permissionName: 'manage_users' },
  { id: 3, uiItemName: 'admin_blog_post', permissionId: 2, permissionName: 'manage_posts' },
  { id: 4, uiItemName: 'admin_documents', permissionId: 3, permissionName: 'upload_docs' },
  { id: 5, uiItemName: 'admin_access_groups', permissionId: 1, permissionName: 'manage_users' },
]

describe('getUiPermissionObjects', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls GET /api/ui-permission-objects', async () => {
    vi.mocked(apiClient.get).mockResolvedValue(mockAssignments)

    await getUiPermissionObjects()

    expect(apiClient.get).toHaveBeenCalledWith('/api/ui-permission-objects')
  })

  it('returns the list of UI permission assignments', async () => {
    vi.mocked(apiClient.get).mockResolvedValue(mockAssignments)

    const result = await getUiPermissionObjects()

    expect(result).toEqual(mockAssignments)
  })

  it('propagates errors from the API client', async () => {
    vi.mocked(apiClient.get).mockRejectedValue(new Error('Network error'))

    await expect(getUiPermissionObjects()).rejects.toThrow('Network error')
  })
})
