'use client'

import { useEffect, useState } from 'react'
import {
  FileText,
  Download,
  Lock,
  Unlock,
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
import { useAuth } from '@/hooks/use-auth'
import { getDocumentsByAccessLevel, initializeStorage } from '@/lib/storage'
import type { Document } from '@/lib/types'

function getFileIcon(fileType: string) {
  if (fileType.includes('pdf')) return FileText
  if (fileType.includes('spreadsheet') || fileType.includes('excel'))
    return FileSpreadsheet
  if (fileType.includes('image')) return FileImage
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
  const { isAdmin, user } = useAuth()
  const [documents, setDocuments] = useState<Document[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initializeStorage()
    const level = user ? (isAdmin ? 99 : 2) : 1
    const docs = getDocumentsByAccessLevel(level)
    setDocuments(docs)
    setLoading(false)
  }, [isAdmin, user])

  const filteredDocuments = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDownload = (doc: Document) => {
    // Simula download - em produção seria um link real
    const blob = new Blob(['Conteúdo simulado do documento: ' + doc.name], {
      type: 'text/plain',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = doc.fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
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
            {!user && (
              <p className="mt-4 text-sm text-muted-foreground">
                <Lock className="mr-1 inline h-4 w-4" />
                Faça login para acessar documentos adicionais de acordo com seu
                nível de acesso.
              </p>
            )}
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
                      <TableHead className="hidden md:table-cell">Acesso</TableHead>
                      <TableHead className="hidden md:table-cell">Data</TableHead>
                      <TableHead className="text-right">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.map((doc) => {
                      const FileIcon = getFileIcon(doc.fileType)
                      return (
                        <TableRow key={doc.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                                <FileIcon className="h-5 w-5 text-accent" />
                              </div>
                              <div className="min-w-0">
                                <p className="truncate font-medium text-foreground">
                                  {doc.name}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                  {doc.fileName}
                                </p>
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
                          <TableCell className="hidden md:table-cell">
                            {doc.isPublic ? (
                              <Badge
                                variant="outline"
                                className="border-green-500 text-green-600"
                              >
                                <Unlock className="mr-1 h-3 w-3" />
                                Público
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="border-orange-500 text-orange-600"
                              >
                                <Lock className="mr-1 h-3 w-3" />
                                Restrito
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground">
                            {new Date(doc.createdAt).toLocaleDateString('pt-BR')}
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
