'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, ExternalLink } from 'lucide-react'
import { getPresences, removePresence } from '@/lib/api/aluno'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { NoticeWithPresenceResponse } from '@/lib/api/types'
import { getErrorMessage } from '@/lib/api/client'

export default function AlunoEventosPage() {
  const [presences, setPresences] = useState<NoticeWithPresenceResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getPresences()
      .then(setPresences)
      .catch((err) => setError(getErrorMessage(err, 'Erro ao carregar eventos')))
      .finally(() => setLoading(false))
  }, [])

  const attended = presences.filter((p) => p.attended)

  async function handleRemovePresence(noticeId: number) {
    try {
      await removePresence(noticeId)
      setPresences((prev) =>
        prev.map((p) => (p.notice.id === noticeId ? { ...p, attended: false } : p)),
      )
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao remover presença'))
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="mb-2 text-2xl font-bold text-foreground">Eventos</h1>
      <p className="mb-6 text-muted-foreground">Eventos em que você marcou presença.</p>

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {attended.length === 0 ? (
        <p className="py-10 text-center text-muted-foreground">Você ainda não marcou presença em nenhum evento.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Título</th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">Data</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Presença</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {attended.map((p) => (
                <tr key={p.notice.id} className="bg-card hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/blog/${p.notice.id}`}
                      className="flex items-center gap-1 font-medium text-foreground hover:underline"
                    >
                      {p.notice.title}
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </Link>
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    {new Date(p.notice.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="border-green-500 text-green-600 gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Confirmada
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemovePresence(p.notice.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      Remover
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
