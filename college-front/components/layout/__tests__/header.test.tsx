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

  it('shows Painel Admin button when user is admin', () => {
    vi.mocked(useAuth).mockReturnValue(
      makeAuth({ user: mockUser, isAdmin: true }),
    )

    render(<Header />)

    expect(screen.getByText('Painel Admin')).toBeInTheDocument()
  })

  it('shows Painel Admin button when user is professor', () => {
    vi.mocked(useAuth).mockReturnValue(
      makeAuth({ user: mockUser, isProfessor: true }),
    )

    render(<Header />)

    expect(screen.getByText('Painel Admin')).toBeInTheDocument()
  })

  it('hides Painel Admin button when user is aluno', () => {
    vi.mocked(useAuth).mockReturnValue(
      makeAuth({ user: mockUser, isAluno: true }),
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
})
