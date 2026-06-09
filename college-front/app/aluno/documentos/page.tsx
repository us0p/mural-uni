'use client'

import { useEffect, useState } from 'react'
import { Download, Search } from 'lucide-react'
import { getMyDocuments } from '@/lib/api/documents'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { DocumentResponse } from '@/lib/api/types'
import { getErrorMessage } from '@/lib/api/client'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function AlunoDocumentosPage() {
  const [documents, setDocuments] = useState<DocumentResponse[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getMyDocuments()
      .then(setDocuments)
      .catch((err) => setError(getErrorMessage(err, 'Erro ao carregar documentos')))
      .finally(() => setLoading(false))
  }, [])

  const filtered = documents.filter((d) =>
    d.fileName.toLowerCase().includes(search.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="mb-2 text-2xl font-bold text-foreground">Meus Documentos</h1>
      <p className="mb-6 text-muted-foreground">Documentos que foram enviados para você.</p>

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="mb-4 flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome do arquivo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="py-10 text-center text-muted-foreground">Nenhum documento encontrado.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Arquivo</th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">Tamanho</th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">Enviado por</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((doc) => (
                <tr key={doc.id} className="bg-card hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{doc.fileName}</p>
                    {doc.description && (
                      <p className="text-xs text-muted-foreground">{doc.description}</p>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    {formatBytes(doc.fileSize)}
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    {doc.username}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <a href={`/api/documents/${doc.id}/download`}>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </a>
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
