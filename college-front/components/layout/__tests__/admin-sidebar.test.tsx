import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { AdminSidebar } from '../admin-sidebar'

const mockLogout = vi.fn()

vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    user: { id: 1, username: 'admin', email: 'admin@test.com', roleId: 1, roleName: 'admin' },
    logout: mockLogout,
  }),
}))

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin',
}))

vi.mock('next/link', () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) =>
    React.createElement('a', { href, className }, children),
}))

describe('AdminSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all nav links', () => {
    render(<AdminSidebar />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Avisos')).toBeInTheDocument()
    expect(screen.getByText('Categorias')).toBeInTheDocument()
    expect(screen.getByText('Documentos')).toBeInTheDocument()
    expect(screen.getByText('Usuários')).toBeInTheDocument()
  })

  it('does not render Grupos de Acesso', () => {
    render(<AdminSidebar />)

    expect(screen.queryByText('Grupos de Acesso')).not.toBeInTheDocument()
  })

  it('renders the logged-in username in the footer', () => {
    render(<AdminSidebar />)

    expect(screen.getByText('admin')).toBeInTheDocument()
  })

  it('highlights the active link based on current pathname', () => {
    render(<AdminSidebar />)

    const dashboardLink = screen.getByText('Dashboard').closest('a')
    expect(dashboardLink?.className).toContain('bg-sidebar-accent')
  })
})
