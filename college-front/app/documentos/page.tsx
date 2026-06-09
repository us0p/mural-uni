'use client'

import { useEffect, useState } from 'react'
import {
  FileText,
  Download,
  FileSpreadsheet,
  FileImage,
  File,
  Search,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { getPublicDocuments } from '@/lib/api/documents'
import type { DocumentResponse } from '@/lib/api/types'

function getFileIcon(fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? ''
  if (ext === 'pdf') return FileText
  if (ext === 'xls' || ext === 'xlsx') return FileSpreadsheet
  if (ext === 'png' || ext === 'jpg' || ext === 'jpeg') return FileImage
  return File
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export default function DocumentosPage() {
  const [documents, setDocuments] = useState<DocumentResponse[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getPublicDocuments()
      .then(setDocuments)
      .catch(() => setDocuments([]))
      .finally(() => setLoading(false))
  }, [])

  const filteredDocuments = documents.filter((doc) =>
    doc.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDownload = (doc: DocumentResponse) => {
    const a = document.createElement('a')
    a.href = `/api/documents/public/${doc.id}/download`
    a.download = doc.fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-background">
        {/* Hero */}
        <section className="border-b border-border bg-card py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Documentos
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Acesse manuais, calendários e documentos importantes da
              universidade.
            </p>
          </div>
        </section>

        {/* Search and Table */}
        <section className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Search */}
            <div className="mb-6 flex items-center gap-4">
              <div className="relative max-w-sm flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar documentos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Badge variant="outline">
                {filteredDocuments.length} documento
                {filteredDocuments.length !== 1 ? 's' : ''}
              </Badge>
            </div>

            {/* Table */}
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="rounded-lg border border-border bg-card py-12 text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-lg text-muted-foreground">
                  Nenhum documento encontrado.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead className="hidden sm:table-cell">Tipo</TableHead>
                      <TableHead className="hidden sm:table-cell">Tamanho</TableHead>
                      <TableHead className="text-right">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.map((doc) => {
                      const FileIcon = getFileIcon(doc.fileName)
                      return (
                        <TableRow key={doc.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                                <FileIcon className="h-5 w-5 text-accent" />
                              </div>
                              <div className="min-w-0">
                                <p className="truncate font-medium text-foreground">
                                  {doc.fileName}
                                </p>
                                {doc.description && (
                                  <p className="truncate text-xs text-muted-foreground">
                                    {doc.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge variant="secondary">
                              {doc.fileName.split('.').pop()?.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-muted-foreground">
                            {formatFileSize(doc.fileSize)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownload(doc)}
                            >
                              <Download className="mr-1.5 h-4 w-4" />
                              Baixar
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
