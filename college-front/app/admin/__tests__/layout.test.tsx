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

const mockUser = { id: 1, username: 'admin', email: 'admin@test.com', roleId: 1, roleName: 'admin' }

function makeAuth(overrides: Partial<ReturnType<typeof useAuth>>) {
  return {
    user: null,
    role: null,
    isLoading: false,
    isAdmin: false,
    isProfessor: false,
    isAluno: false,
    login: vi.fn(),
    logout: vi.fn(),
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

  it('redirects to / when user is authenticated but is aluno', async () => {
    vi.mocked(useAuth).mockReturnValue(
      makeAuth({
        user: mockUser,
        isLoading: false,
        isAdmin: false,
        isProfessor: false,
        isAluno: true,
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
        isAdmin: false,
        isProfessor: false,
      }),
    )

    render(<AdminLayout>content</AdminLayout>)

    await waitFor(() => expect(mockPush).toHaveBeenCalled())
    expect(mockPush).not.toHaveBeenCalledWith('/login')
  })

  it('renders children when user is admin', async () => {
    vi.mocked(useAuth).mockReturnValue(
      makeAuth({
        user: mockUser,
        isLoading: false,
        isAdmin: true,
      }),
    )

    const { getByText } = render(<AdminLayout>protected content</AdminLayout>)

    await waitFor(() => {
      expect(getByText('protected content')).toBeInTheDocument()
    })
  })

  it('renders children when user is professor', async () => {
    vi.mocked(useAuth).mockReturnValue(
      makeAuth({
        user: mockUser,
        isLoading: false,
        isProfessor: true,
      }),
    )

    const { getByText } = render(<AdminLayout>professor content</AdminLayout>)

    await waitFor(() => {
      expect(getByText('professor content')).toBeInTheDocument()
    })
  })

  it('does not redirect while still loading', async () => {
    vi.mocked(useAuth).mockReturnValue(makeAuth({ isLoading: true, user: null }))

    render(<AdminLayout>content</AdminLayout>)

    await new Promise((r) => setTimeout(r, 50))
    expect(mockPush).not.toHaveBeenCalled()
  })
})
