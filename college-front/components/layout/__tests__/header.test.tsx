import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { Header } from '../header'

vi.mock('@/hooks/use-auth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('next/link', () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) =>
    React.createElement('a', { href, className }, children),
}))

import { useAuth } from '@/hooks/use-auth'

const mockUser = { id: 1, username: 'admin', email: 'admin@test.com', roleId: 1, roleName: 'Admin' }

function makeAuth(overrides: Partial<ReturnType<typeof useAuth>>) {
  return {
    user: null,
    token: null,
    isLoading: false,
    isAdmin: false,
    login: vi.fn(),
    logout: vi.fn(),
    hasPermission: vi.fn(() => false),
    canAccessUiItem: vi.fn(() => false),
    ...overrides,
  }
}

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows Entrar button and hides Painel Admin when user is null', () => {
    vi.mocked(useAuth).mockReturnValue(makeAuth({ user: null }))

    render(<Header />)

    expect(screen.getByText('Entrar')).toBeInTheDocument()
    expect(screen.queryByText('Painel Admin')).not.toBeInTheDocument()
  })

  it('shows Painel Admin button when canAccessUiItem("admin_dashboard") returns true', () => {
    vi.mocked(useAuth).mockReturnValue(
      makeAuth({
        user: mockUser,
        canAccessUiItem: (name: string) => name === 'admin_dashboard',
      }),
    )

    render(<Header />)

    expect(screen.getByText('Painel Admin')).toBeInTheDocument()
  })

  it('hides Painel Admin button when canAccessUiItem("admin_dashboard") returns false', () => {
    vi.mocked(useAuth).mockReturnValue(
      makeAuth({
        user: mockUser,
        canAccessUiItem: () => false,
      }),
    )

    render(<Header />)

    expect(screen.queryByText('Painel Admin')).not.toBeInTheDocument()
  })

  it('shows Sair and username when authenticated', () => {
    vi.mocked(useAuth).mockReturnValue(makeAuth({ user: mockUser }))

    render(<Header />)

    expect(screen.getByText(/admin/)).toBeInTheDocument()
    expect(screen.getByText('Sair')).toBeInTheDocument()
  })

  it('checks admin_dashboard specifically when deciding to show the button', () => {
    const mockCanAccess = vi.fn(() => false)
    vi.mocked(useAuth).mockReturnValue(makeAuth({ user: mockUser, canAccessUiItem: mockCanAccess }))

    render(<Header />)

    expect(mockCanAccess).toHaveBeenCalledWith('admin_dashboard')
  })
})
