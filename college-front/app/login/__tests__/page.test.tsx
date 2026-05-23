import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import LoginPage from '../page'

const mockPush = vi.hoisted(() => vi.fn())

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

vi.mock('@/hooks/use-auth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) =>
    React.createElement('a', { href }, children),
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

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects to /admin when user is set and auth is not loading', async () => {
    vi.mocked(useAuth).mockReturnValue(
      makeAuth({ user: mockUser, isLoading: false }),
    )

    render(<LoginPage />)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admin')
    })
  })

  it('redirects even when canAccessUiItem is false — auth is enough for the redirect', async () => {
    vi.mocked(useAuth).mockReturnValue(
      makeAuth({ user: mockUser, isLoading: false, canAccessUiItem: () => false }),
    )

    render(<LoginPage />)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admin')
    })
  })

  it('does not redirect while isLoading is true', async () => {
    vi.mocked(useAuth).mockReturnValue(
      makeAuth({ user: mockUser, isLoading: true }),
    )

    render(<LoginPage />)

    await new Promise((r) => setTimeout(r, 50))
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('does not redirect when user is null', async () => {
    vi.mocked(useAuth).mockReturnValue(makeAuth({ user: null }))

    render(<LoginPage />)

    await new Promise((r) => setTimeout(r, 50))
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('calls login() with username and password on form submit', async () => {
    const mockLogin = vi.fn().mockResolvedValue(undefined)
    vi.mocked(useAuth).mockReturnValue(makeAuth({ login: mockLogin }))

    render(<LoginPage />)

    await userEvent.type(screen.getByLabelText('Usuário'), 'admin')
    await userEvent.type(screen.getByLabelText('Senha'), 'password123')
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(mockLogin).toHaveBeenCalledWith('admin', 'password123')
  })

  it('shows error message when login() throws', async () => {
    const mockLogin = vi.fn().mockRejectedValue(new Error('Invalid'))
    vi.mocked(useAuth).mockReturnValue(makeAuth({ login: mockLogin }))

    render(<LoginPage />)

    await userEvent.type(screen.getByLabelText('Usuário'), 'wrong')
    await userEvent.type(screen.getByLabelText('Senha'), 'wrong')
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(screen.getByText('Usuário ou senha inválidos.')).toBeInTheDocument()
    })
  })

  it('does not redirect when user stays null after login resolves', async () => {
    const mockLogin = vi.fn().mockResolvedValue(undefined)
    vi.mocked(useAuth).mockReturnValue(makeAuth({ user: null, login: mockLogin }))

    render(<LoginPage />)

    await userEvent.type(screen.getByLabelText('Usuário'), 'admin')
    await userEvent.type(screen.getByLabelText('Senha'), 'pass')
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => expect(mockLogin).toHaveBeenCalled())
    expect(mockPush).not.toHaveBeenCalled()
  })
})
