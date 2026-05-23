'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Plus, Trash2, FileText, Search, Brain, AlertCircle, Download,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { getDocuments, uploadDocument, deleteDocument } from '@/lib/api/documents'
import type { DocumentResponse } from '@/lib/api/types'

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function AdminDocumentosPage() {
  const [documents, setDocuments] = useState<DocumentResponse[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selected, setSelected] = useState<DocumentResponse | null>(null)

  const [file, setFile] = useState<File | null>(null)
  const [description, setDescription] = useState('')
  const [knowledgeBase, setKnowledgeBase] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      setDocuments(await getDocuments())
    } catch {
      setError('Não foi possível carregar os documentos.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = documents.filter((d) =>
    d.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.description ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleOpenUpload = () => {
    setFile(null)
    setDescription('')
    setKnowledgeBase(false)
    setUploadError(null)
    setIsUploadOpen(true)
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return
    setIsUploading(true)
    setUploadError(null)
    try {
      await uploadDocument(file, description, knowledgeBase)
      await load()
      setIsUploadOpen(false)
    } catch {
      setUploadError('Erro ao enviar o documento. Verifique o tipo e tamanho do arquivo.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!selected) return
    try {
      await deleteDocument(selected.id)
      await load()
    } catch {
      setError('Erro ao excluir o documento.')
    } finally {
      setIsDeleteOpen(false)
      setSelected(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Documentos</h1>
          <p className="text-muted-foreground">Gerencie os documentos e a base de conhecimento da IA</p>
        </div>
        <Button onClick={handleOpenUpload} className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Plus className="mr-2 h-4 w-4" />
          Enviar Documento
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
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
        <Badge variant="outline">{filtered.length} documento(s)</Badge>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Arquivo</TableHead>
              <TableHead className="hidden sm:table-cell">Tamanho</TableHead>
              <TableHead className="hidden sm:table-cell">Enviado por</TableHead>
              <TableHead className="hidden md:table-cell">Base IA</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">Carregando...</TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-2 text-muted-foreground">Nenhum documento encontrado.</p>
                </TableCell>
              </TableRow>
            ) : filtered.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                      <FileText className="h-5 w-5 text-accent" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{doc.fileName}</p>
                      {doc.description && (
                        <p className="truncate text-xs text-muted-foreground">{doc.description}</p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">
                  {formatBytes(doc.fileSize)}
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">
                  {doc.username}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {doc.knowledgeBase ? (
                    <Badge className="bg-purple-100 text-purple-800">
                      <Brain className="mr-1 h-3 w-3" />
                      Sim
                    </Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">Não</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <a href={doc.bucketUrl} target="_blank" rel="noopener noreferrer" aria-label="Baixar">
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => { setSelected(doc); setIsDeleteOpen(true) }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Upload Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enviar Documento</DialogTitle>
            <DialogDescription>
              Tipos aceitos: PDF, Word, Excel, imagens e texto. Máximo 50 MB.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpload} className="space-y-4">
            {uploadError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{uploadError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="file">Arquivo *</Label>
              <Input
                id="file"
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.png,.jpg,.jpeg"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                required
              />
              {file && (
                <p className="text-xs text-muted-foreground">
                  {file.name} · {formatBytes(file.size)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o conteúdo do documento"
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="knowledgeBase">Base de Conhecimento IA</Label>
                <p className="text-xs text-muted-foreground">Usar como referência para o chatbot</p>
              </div>
              <Switch
                id="knowledgeBase"
                checked={knowledgeBase}
                onCheckedChange={setKnowledgeBase}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsUploadOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isUploading || !file}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {isUploading ? 'Enviando...' : 'Enviar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir &quot;{selected?.fileName}&quot;? O arquivo será removido do S3 e esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
