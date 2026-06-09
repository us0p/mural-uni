'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { AdminSidebar } from '@/components/layout/admin-sidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isLoading, isAdmin, isProfessor } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => { setSidebarOpen(false) }, [pathname])

  useEffect(() => {
    if (isLoading) return
    if (!user) {
      router.push('/login')
    } else if (!isAdmin && !isProfessor) {
      router.push('/')
    }
  }, [user, isLoading, isAdmin, isProfessor, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    )
  }

  if (!user || (!isAdmin && !isProfessor)) return null

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar — always visible on md+ */}
      <div className="hidden md:block">
        <AdminSidebar />
      </div>

      {/* Mobile sidebar — rendered as a fixed overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 md:hidden">
            <AdminSidebar />
          </div>
        </>
      )}

      {/* Main content column */}
      <div className="flex min-h-screen flex-1 flex-col overflow-auto">
        {/* Mobile top bar with hamburger — hidden on md+ */}
        <div className="flex h-14 shrink-0 items-center border-b border-border bg-card px-4 md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Abrir menu</span>
          </Button>
          <span className="ml-3 font-semibold text-foreground">Painel Admin</span>
        </div>

        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
