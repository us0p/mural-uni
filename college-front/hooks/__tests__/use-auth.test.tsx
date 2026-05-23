import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import React from 'react'
import { AuthProvider, useAuth } from '../use-auth'
import * as authApi from '@/lib/api/auth'
import * as uiItemsApi from '@/lib/api/ui-items'
import { apiClient } from '@/lib/api/client'
import type { LoginResponse, UserResponse, UiPermissionObjectResponse } from '@/lib/api/types'

vi.mock('@/lib/api/auth', () => ({ login: vi.fn() }))
vi.mock('@/lib/api/ui-items', () => ({ getUiPermissionObjects: vi.fn() }))
vi.mock('@/lib/api/client', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/lib/api/client')>()
  return {
    ...mod,
    apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn(), postFormData: vi.fn() },
  }
})

const mockUser: UserResponse = {
  id: 1, username: 'admin', email: 'admin@test.com', roleId: 1, roleName: 'Administradores',
}

const mockLoginResponse: LoginResponse = {
  userId: 1, username: 'admin', email: 'admin@test.com',
  roleId: 1, roleName: 'Administradores',
  permissions: ['admin', 'manage_users', 'manage_posts'],
}

const mockUiPermissions: UiPermissionObjectResponse[] = [
  { id: 1, uiItemName: 'admin_dashboard',    permissionId: 1, permissionName: 'manage_users' },
  { id: 2, uiItemName: 'admin_users',         permissionId: 1, permissionName: 'manage_users' },
  { id: 3, uiItemName: 'admin_blog_post',     permissionId: 2, permissionName: 'manage_posts' },
  { id: 4, uiItemName: 'admin_documents',     permissionId: 3, permissionName: 'upload_docs'  },
  { id: 5, uiItemName: 'admin_access_groups', permissionId: 1, permissionName: 'manage_users' },
]

function wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(AuthProvider, null, children)
}

function setupLoginMocks() {
  vi.mocked(authApi.login).mockResolvedValue(mockLoginResponse)
  vi.mocked(apiClient.get).mockRejectedValue(new Error('no session'))
  vi.mocked(uiItemsApi.getUiPermissionObjects).mockResolvedValue(mockUiPermissions)
}

describe('useAuth', () => {
  beforeEach(() => { vi.clearAllMocks(); localStorage.clear() })
  afterEach(() => { localStorage.clear() })

  it('throws when used outside AuthProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => renderHook(() => useAuth())).toThrow('useAuth must be used within an AuthProvider')
    spy.mockRestore()
  })

  it('starts with null user when no stored session', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.user).toBeNull()
  })

  describe('login', () => {
    beforeEach(setupLoginMocks)

    it('calls auth API with provided username and password', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })
      await waitFor(() => expect(result.current.isLoading).toBe(false))
      await act(async () => { await result.current.login('admin', 'password123') })
      expect(authApi.login).toHaveBeenCalledWith({ username: 'admin', password: 'password123' })
    })

    it('sets user from login response without fetching /api/users', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })
      await waitFor(() => expect(result.current.isLoading).toBe(false))
      await act(async () => { await result.current.login('admin', 'secret') })
      expect(result.current.user).toEqual(mockUser)
      expect(apiClient.get).not.toHaveBeenCalledWith('/api/users', expect.anything())
    })

    it('fetches UI permissions after login', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })
      await waitFor(() => expect(result.current.isLoading).toBe(false))
      await act(async () => { await result.current.login('admin', 'secret') })
      expect(uiItemsApi.getUiPermissionObjects).toHaveBeenCalled()
    })

    it('persists user to localStorage (but not permissions)', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })
      await waitFor(() => expect(result.current.isLoading).toBe(false))
      await act(async () => { await result.current.login('admin', 'secret') })
      expect(JSON.parse(localStorage.getItem('auth_user')!)).toEqual(mockUser)
      expect(localStorage.getItem('auth_permissions')).toBeNull()
      expect(localStorage.getItem('auth_ui_permissions')).toBeNull()
    })

    it('sets isAdmin true when login response includes "admin" permission', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })
      await waitFor(() => expect(result.current.isLoading).toBe(false))
      await act(async () => { await result.current.login('admin', 'secret') })
      expect(result.current.isAdmin).toBe(true)
    })

    it('sets isAdmin false when login response does not include "admin" permission', async () => {
      vi.mocked(authApi.login).mockResolvedValue({ ...mockLoginResponse, permissions: ['manage_users'] })
      const { result } = renderHook(() => useAuth(), { wrapper })
      await waitFor(() => expect(result.current.isLoading).toBe(false))
      await act(async () => { await result.current.login('student', 'pass') })
      expect(result.current.isAdmin).toBe(false)
    })

    it('throws and leaves user null when login API fails', async () => {
      vi.mocked(authApi.login).mockRejectedValue(new Error('Invalid credentials'))
      const { result } = renderHook(() => useAuth(), { wrapper })
      await waitFor(() => expect(result.current.isLoading).toBe(false))
      await expect(act(async () => { await result.current.login('wrong', 'wrong') })).rejects.toThrow()
      expect(result.current.user).toBeNull()
    })
  })

  describe('logout', () => {
    it('clears user and localStorage', async () => {
      setupLoginMocks()
      const { result } = renderHook(() => useAuth(), { wrapper })
      await waitFor(() => expect(result.current.isLoading).toBe(false))
      await act(async () => { await result.current.login('admin', 'secret') })
      expect(result.current.user).not.toBeNull()
      act(() => { result.current.logout() })
      expect(result.current.user).toBeNull()
      expect(localStorage.getItem('auth_user')).toBeNull()
    })
  })

  describe('hasPermission', () => {
    beforeEach(setupLoginMocks)

    it('returns true when user holds the named permission', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })
      await waitFor(() => expect(result.current.isLoading).toBe(false))
      await act(async () => { await result.current.login('admin', 'secret') })
      expect(result.current.hasPermission('manage_users')).toBe(true)
    })

    it('returns false when user lacks the named permission', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })
      await waitFor(() => expect(result.current.isLoading).toBe(false))
      await act(async () => { await result.current.login('admin', 'secret') })
      expect(result.current.hasPermission('upload_docs')).toBe(false)
    })

    it('returns false when not authenticated', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })
      await waitFor(() => expect(result.current.isLoading).toBe(false))
      expect(result.current.hasPermission('manage_users')).toBe(false)
    })
  })

  describe('canAccessUiItem', () => {
    beforeEach(setupLoginMocks)

    async function loginAndGet() {
      const { result } = renderHook(() => useAuth(), { wrapper })
      await waitFor(() => expect(result.current.isLoading).toBe(false))
      await act(async () => { await result.current.login('admin', 'secret') })
      return result
    }

    it('returns true when user has all permissions required by the UI item', async () => {
      const result = await loginAndGet()
      expect(result.current.canAccessUiItem('admin_dashboard')).toBe(true)
    })

    it('returns false when user lacks a required permission for the UI item', async () => {
      const result = await loginAndGet()
      expect(result.current.canAccessUiItem('admin_documents')).toBe(false)
    })

    it('returns true for a UI item with no permissions configured', async () => {
      const result = await loginAndGet()
      expect(result.current.canAccessUiItem('unknown_item')).toBe(true)
    })

    it('returns false when user is not authenticated', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })
      await waitFor(() => expect(result.current.isLoading).toBe(false))
      expect(result.current.canAccessUiItem('admin_dashboard')).toBe(false)
    })

    it('checks each UI item correctly against permission names', async () => {
      const result = await loginAndGet()
      expect(result.current.canAccessUiItem('admin_users')).toBe(true)
      expect(result.current.canAccessUiItem('admin_blog_post')).toBe(true)
      expect(result.current.canAccessUiItem('admin_access_groups')).toBe(true)
      expect(result.current.canAccessUiItem('admin_documents')).toBe(false)
    })
  })

  describe('session persistence via /api/auth/me', () => {
    it('restores session from cookie when user info is in localStorage', async () => {
      localStorage.setItem('auth_user', JSON.stringify(mockUser))
      vi.mocked(apiClient.get).mockResolvedValue(mockLoginResponse)
      vi.mocked(uiItemsApi.getUiPermissionObjects).mockResolvedValue(mockUiPermissions)

      const { result } = renderHook(() => useAuth(), { wrapper })
      await waitFor(() => expect(result.current.isLoading).toBe(false))

      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isAdmin).toBe(true)
    })

    it('clears session when /api/auth/me fails (cookie expired)', async () => {
      localStorage.setItem('auth_user', JSON.stringify(mockUser))
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Unauthorized'))

      const { result } = renderHook(() => useAuth(), { wrapper })
      await waitFor(() => expect(result.current.isLoading).toBe(false))

      expect(result.current.user).toBeNull()
      expect(localStorage.getItem('auth_user')).toBeNull()
    })

    it('starts unauthenticated when localStorage is empty (no /api/auth/me call)', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })
      await waitFor(() => expect(result.current.isLoading).toBe(false))
      expect(result.current.user).toBeNull()
      expect(apiClient.get).not.toHaveBeenCalled()
    })
  })
})
