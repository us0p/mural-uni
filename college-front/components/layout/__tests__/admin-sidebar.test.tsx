import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { AdminSidebar } from '../admin-sidebar'

const mockLogout = vi.fn()
const mockCanAccessUiItem = vi.fn()

vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    user: { id: 1, username: 'admin', email: 'admin@test.com', roleId: 1, roleName: 'Admin' },
    logout: mockLogout,
    canAccessUiItem: mockCanAccessUiItem,
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

  it('renders all nav links when user can access every UI item', () => {
    mockCanAccessUiItem.mockReturnValue(true)

    render(<AdminSidebar />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Avisos')).toBeInTheDocument()
    expect(screen.getByText('Documentos')).toBeInTheDocument()
    expect(screen.getByText('Usuários')).toBeInTheDocument()
    expect(screen.getByText('Grupos de Acesso')).toBeInTheDocument()
  })

  it('hides links for UI items the user cannot access', () => {
    mockCanAccessUiItem.mockImplementation(
      (name: string) => name !== 'admin_users' && name !== 'admin_documents',
    )

    render(<AdminSidebar />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Avisos')).toBeInTheDocument()
    expect(screen.getByText('Grupos de Acesso')).toBeInTheDocument()
    expect(screen.queryByText('Usuários')).not.toBeInTheDocument()
    expect(screen.queryByText('Documentos')).not.toBeInTheDocument()
  })

  it('renders only the dashboard link when user has minimal access', () => {
    mockCanAccessUiItem.mockImplementation((name: string) => name === 'admin_dashboard')

    render(<AdminSidebar />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.queryByText('Avisos')).not.toBeInTheDocument()
    expect(screen.queryByText('Documentos')).not.toBeInTheDocument()
    expect(screen.queryByText('Usuários')).not.toBeInTheDocument()
    expect(screen.queryByText('Grupos de Acesso')).not.toBeInTheDocument()
  })

  it('renders the logged-in username in the footer', () => {
    mockCanAccessUiItem.mockReturnValue(true)

    render(<AdminSidebar />)

    expect(screen.getByText('admin')).toBeInTheDocument()
  })

  it('maps each sidebar link to the correct UI item name', () => {
    mockCanAccessUiItem.mockReturnValue(false)

    render(<AdminSidebar />)

    // Verify canAccessUiItem is called with the expected UI item names
    const calledWith = mockCanAccessUiItem.mock.calls.map((c) => c[0])
    expect(calledWith).toContain('admin_dashboard')
    expect(calledWith).toContain('admin_blog_post')
    expect(calledWith).toContain('admin_documents')
    expect(calledWith).toContain('admin_users')
    expect(calledWith).toContain('admin_access_groups')
  })
})
