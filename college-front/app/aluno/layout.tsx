'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { LayoutDashboard, FileText, CalendarCheck, Settings2, LogOut, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'

const sidebarLinks = [
  { href: '/aluno', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/aluno/documentos', label: 'Meus Documentos', icon: FileText },
  { href: '/aluno/eventos', label: 'Eventos', icon: CalendarCheck },
  { href: '/aluno/preferencias', label: 'Preferências', icon: Settings2 },
]

export default function AlunoLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAluno, isLoading, logout } = useAuth()

  useEffect(() => {
    if (isLoading) return
    if (!isAluno) {
      router.push('/')
    }
  }, [isAluno, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    )
  }

  if (!isAluno) return null

  return (
    <div className="flex min-h-screen">
      <aside className="flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar sticky top-0">
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4">
          <Image src="/mural_uni_logo_white_bg.png" alt="Mural Universitário" width={48} height={48} className="rounded-lg" />
          <div>
            <p className="text-sm font-semibold text-sidebar-foreground">Mural</p>
            <p className="text-xs text-sidebar-foreground/60">Área do Aluno</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                )}
              >
                <link.icon className="h-5 w-5" />
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <Link
            href="/blog"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Ver Avisos
          </Link>

          <div className="mt-2 flex items-center justify-between rounded-lg bg-sidebar-accent/30 px-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-sidebar-foreground">{user?.username}</p>
              <p className="truncate text-xs text-sidebar-foreground/60">{user?.email}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="h-8 w-8 shrink-0 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-background">
        {children}
      </main>
    </div>
  )
}
