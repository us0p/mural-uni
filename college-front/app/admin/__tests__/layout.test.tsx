import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import React from 'react'
import AdminLayout from '../layout'

const mockPush = vi.hoisted(() => vi.fn())

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/admin',
}))

vi.mock('@/hooks/use-auth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('@/components/layout/admin-sidebar', () => ({
  AdminSidebar: () => null,
}))

import { useAuth } from '@/hooks/use-auth'

const mockUser = { id: 1, username: 'admin', email: 'admin@test.com', roleId: 1, roleName: 'Admin' }

function makeAuth(overrides: Partial<ReturnType<typeof useAuth>>) {
  return {
    user: null,
    isLoading: false,
    isAdmin: false,
    login: vi.fn(),
    logout: vi.fn(),
    hasPermission: vi.fn(() => false),
    canAccessUiItem: vi.fn(() => false),
    ...overrides,
  }
}

describe('AdminLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading spinner while isLoading is true', () => {
    vi.mocked(useAuth).mockReturnValue(makeAuth({ isLoading: true }))

    const { container } = render(<AdminLayout>content</AdminLayout>)

    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('redirects to /login when user is null', async () => {
    vi.mocked(useAuth).mockReturnValue(makeAuth({ user: null, isLoading: false }))

    render(<AdminLayout>content</AdminLayout>)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login')
    })
  })

  it('redirects to / (home) when user is authenticated but lacks admin_dashboard permission', async () => {
    vi.mocked(useAuth).mockReturnValue(
      makeAuth({
        user: mockUser,
        isLoading: false,
        canAccessUiItem: () => false,
      }),
    )

    render(<AdminLayout>content</AdminLayout>)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  it('never redirects to /login for authenticated users without access — prevents loop', async () => {
    vi.mocked(useAuth).mockReturnValue(
      makeAuth({
        user: mockUser,
        isLoading: false,
        canAccessUiItem: () => false,
      }),
    )

    render(<AdminLayout>content</AdminLayout>)

    await waitFor(() => expect(mockPush).toHaveBeenCalled())
    expect(mockPush).not.toHaveBeenCalledWith('/login')
  })

  it('renders children when user has admin_dashboard permission', async () => {
    vi.mocked(useAuth).mockReturnValue(
      makeAuth({
        user: mockUser,
        isLoading: false,
        canAccessUiItem: () => true,
      }),
    )

    const { getByText } = render(<AdminLayout>protected content</AdminLayout>)

    await waitFor(() => {
      expect(getByText('protected content')).toBeInTheDocument()
    })
  })

  it('does not redirect while still loading', async () => {
    vi.mocked(useAuth).mockReturnValue(makeAuth({ isLoading: true, user: null }))

    render(<AdminLayout>content</AdminLayout>)

    await new Promise((r) => setTimeout(r, 50))
    expect(mockPush).not.toHaveBeenCalled()
  })
})
