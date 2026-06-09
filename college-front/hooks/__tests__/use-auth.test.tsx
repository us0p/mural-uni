import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import React from 'react'
import { AuthProvider, useAuth } from '../use-auth'
import * as authApi from '@/lib/api/auth'
import { apiClient } from '@/lib/api/client'
import type { LoginResponse, UserResponse } from '@/lib/api/types'

vi.mock('@/lib/api/auth', () => ({ login: vi.fn() }))
vi.mock('@/lib/api/client', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/lib/api/client')>()
  return {
    ...mod,
    apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn(), postFormData: vi.fn() },
  }
})

const mockUser: UserResponse = {
  id: 1, username: 'admin', email: 'admin@test.com', roleId: 1, roleName: 'admin',
}

const mockLoginResponse: LoginResponse = {
  userId: 1, username: 'admin', email: 'admin@test.com',
  roleId: 1, roleName: 'admin',
}

function wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(AuthProvider, null, children)
}

function setupLoginMocks() {
  vi.mocked(authApi.login).mockResolvedValue(mockLoginResponse)
  vi.mocked(apiClient.get).mockRejectedValue(new Error('no session'))
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

    it('sets user from login response', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })
      await waitFor(() => expect(result.current.isLoading).toBe(false))
      await act(async () => { await result.current.login('admin', 'secret') })
      expect(result.current.user).toEqual(mockUser)
    })

    it('persists user to localStorage', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })
      await waitFor(() => expect(result.current.isLoading).toBe(false))
      await act(async () => { await result.current.login('admin', 'secret') })
      expect(JSON.parse(localStorage.getItem('auth_user')!)).toEqual(mockUser)
    })

    it('sets isAdmin true when login response roleName is "admin"', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })
      await waitFor(() => expect(result.current.isLoading).toBe(false))
      await act(async () => { await result.current.login('admin', 'secret') })
      expect(result.current.isAdmin).toBe(true)
      expect(result.current.isProfessor).toBe(false)
      expect(result.current.isAluno).toBe(false)
    })

    it('sets isProfessor true when login response roleName is "professor"', async () => {
      vi.mocked(authApi.login).mockResolvedValue({ ...mockLoginResponse, roleName: 'professor' })
      const { result } = renderHook(() => useAuth(), { wrapper })
      await waitFor(() => expect(result.current.isLoading).toBe(false))
      await act(async () => { await result.current.login('prof', 'pass') })
      expect(result.current.isProfessor).toBe(true)
      expect(result.current.isAdmin).toBe(false)
    })

    it('sets isAluno true when login response roleName is "aluno"', async () => {
      vi.mocked(authApi.login).mockResolvedValue({ ...mockLoginResponse, roleName: 'aluno' })
      const { result } = renderHook(() => useAuth(), { wrapper })
      await waitFor(() => expect(result.current.isLoading).toBe(false))
      await act(async () => { await result.current.login('student', 'pass') })
      expect(result.current.isAluno).toBe(true)
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
    it('clears user, role, and localStorage', async () => {
      setupLoginMocks()
      const { result } = renderHook(() => useAuth(), { wrapper })
      await waitFor(() => expect(result.current.isLoading).toBe(false))
      await act(async () => { await result.current.login('admin', 'secret') })
      expect(result.current.user).not.toBeNull()
      expect(result.current.role).toBe('admin')
      act(() => { result.current.logout() })
      expect(result.current.user).toBeNull()
      expect(result.current.role).toBeNull()
      expect(localStorage.getItem('auth_user')).toBeNull()
    })
  })

  describe('session persistence via /api/auth/me', () => {
    it('restores session from cookie when user info is in localStorage', async () => {
      localStorage.setItem('auth_user', JSON.stringify(mockUser))
      vi.mocked(apiClient.get).mockResolvedValue({ ...mockLoginResponse, roleName: 'admin' })

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
