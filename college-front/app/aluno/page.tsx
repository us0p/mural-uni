'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BookOpen, FileText, CalendarCheck, Settings2, CalendarDays, Trophy } from 'lucide-react'
import { getAlunoDashboard } from '@/lib/api/aluno'
import type { AlunoStatsResponse } from '@/lib/api/types'

export default function AlunoPage() {
  const [stats, setStats] = useState<AlunoStatsResponse | null>(null)

  useEffect(() => {
    getAlunoDashboard().then(setStats).catch(() => {})
  }, [])

  return (
    <div className="p-8">
      <h1 className="mb-2 text-2xl font-bold text-foreground">Dashboard</h1>
      <p className="mb-8 text-muted-foreground">Bem-vindo à sua área de aluno.</p>

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5">
          <Trophy className="h-8 w-8 shrink-0 text-accent" />
          <div>
            <p className="text-2xl font-bold text-foreground">{stats?.eventsAttended ?? '—'}</p>
            <p className="text-sm text-muted-foreground">Eventos participados</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5">
          <CalendarDays className="h-8 w-8 shrink-0 text-accent" />
          <div>
            <p className="text-2xl font-bold text-foreground">{stats?.daysOnPlatform ?? '—'}</p>
            <p className="text-sm text-muted-foreground">Dias na plataforma</p>
          </div>
        </div>
      </div>

      <h2 className="mb-4 text-lg font-semibold text-foreground">Navegação</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/aluno/documentos"
          className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:bg-secondary"
        >
          <FileText className="h-8 w-8 shrink-0 text-accent" />
          <div>
            <p className="font-semibold text-foreground">Meus Documentos</p>
            <p className="text-sm text-muted-foreground">Documentos enviados para você</p>
          </div>
        </Link>

        <Link
          href="/aluno/eventos"
          className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:bg-secondary"
        >
          <CalendarCheck className="h-8 w-8 shrink-0 text-accent" />
          <div>
            <p className="font-semibold text-foreground">Eventos</p>
            <p className="text-sm text-muted-foreground">Eventos em que participei</p>
          </div>
        </Link>

        <Link
          href="/blog"
          className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:bg-secondary"
        >
          <BookOpen className="h-8 w-8 shrink-0 text-accent" />
          <div>
            <p className="font-semibold text-foreground">Avisos</p>
            <p className="text-sm text-muted-foreground">Veja os avisos e comunicados</p>
          </div>
        </Link>

        <Link
          href="/aluno/preferencias"
          className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:bg-secondary"
        >
          <Settings2 className="h-8 w-8 shrink-0 text-accent" />
          <div>
            <p className="font-semibold text-foreground">Preferências</p>
            <p className="text-sm text-muted-foreground">Configure suas notificações</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
