'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'

const navLinks = [
  { href: '/', label: 'Início' },
  { href: '/blog', label: 'Avisos' },
  { href: '/documentos', label: 'Documentos' },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, logout, isAdmin, isProfessor, isAluno } = useAuth()

  const canAccessAdmin = isAdmin || isProfessor

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/mural_uni_logo.png" alt="Mural Universitário" width={64} height={64} className="rounded-lg" />
          <span className="text-lg font-bold text-foreground">
            Mural Universitário
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth Buttons */}
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              {canAccessAdmin && (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin">Painel Admin</Link>
                </Button>
              )}
              {isAluno && (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/aluno">Minha Área</Link>
                </Button>
              )}
              <span className="text-sm text-muted-foreground">
                Olá, {user.username}
              </span>
              <Button variant="ghost" size="sm" onClick={logout}>
                Sair
              </Button>
            </>
          ) : (
            <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/login">Entrar</Link>
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className="sr-only">Abrir menu</span>
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border md:hidden">
          <div className="space-y-1 px-4 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-md px-3 py-2 text-base font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-border pt-3">
              {user ? (
                <>
                  {canAccessAdmin && (
                    <Link
                      href="/admin"
                      className="block rounded-md px-3 py-2 text-base font-medium text-accent"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Painel Admin
                    </Link>
                  )}
                  {isAluno && (
                    <Link
                      href="/aluno"
                      className="block rounded-md px-3 py-2 text-base font-medium text-accent"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Minha Área
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout()
                      setMobileMenuOpen(false)
                    }}
                    className="block w-full rounded-md px-3 py-2 text-left text-base font-medium text-muted-foreground hover:bg-secondary"
                  >
                    Sair
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="block rounded-md px-3 py-2 text-base font-medium text-accent"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Entrar
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
