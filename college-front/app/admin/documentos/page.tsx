'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import {
  Plus, Trash2, FileText, Search, Brain, AlertCircle, Download, Lock, Unlock, GraduationCap, X,
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
import { getStudents } from '@/lib/api/users'
import { getErrorMessage } from '@/lib/api/client'
import type { DocumentResponse, UserResponse } from '@/lib/api/types'

const DEBOUNCE_MS = 300

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
  const [isPublic, setIsPublic] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const [forStudent, setForStudent] = useState(false)
  const [recipientId, setRecipientId] = useState<number | null>(null)
  const [recipientUsername, setRecipientUsername] = useState('')
  const [studentSearch, setStudentSearch] = useState('')
  const [students, setStudents] = useState<UserResponse[]>([])
  const [studentSearchLoading, setStudentSearchLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  useEffect(() => {
    if (!forStudent) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setStudentSearchLoading(true)
      try {
        const result = await getStudents(studentSearch || undefined)
        setStudents(result.content)
      } catch {
        setStudents([])
      } finally {
        setStudentSearchLoading(false)
      }
    }, DEBOUNCE_MS)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [studentSearch, forStudent])

  const filtered = documents.filter((d) =>
    d.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.description ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleOpenUpload = () => {
    setFile(null)
    setDescription('')
    setKnowledgeBase(false)
    setIsPublic(false)
    setUploadError(null)
    setForStudent(false)
    setRecipientId(null)
    setRecipientUsername('')
    setStudentSearch('')
    setStudents([])
    setIsUploadOpen(true)
  }

  const handleForStudentToggle = (checked: boolean) => {
    setForStudent(checked)
    if (checked) {
      setKnowledgeBase(false)
      setStudentSearch('')
      setStudents([])
    } else {
      setRecipientId(null)
      setRecipientUsername('')
    }
  }

  const handleSelectStudent = (student: UserResponse) => {
    setRecipientId(student.id)
    setRecipientUsername(student.username)
    setStudents([])
    setStudentSearch('')
  }

  const handleClearRecipient = () => {
    setRecipientId(null)
    setRecipientUsername('')
    setStudentSearch('')
    setStudents([])
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return
    if (forStudent && !recipientId) {
      setUploadError('Selecione um aluno destinatário.')
      return
    }
    setIsUploading(true)
    setUploadError(null)
    try {
      await uploadDocument(file, description, knowledgeBase, isPublic, recipientId ?? undefined)
      await load()
      setIsUploadOpen(false)
    } catch (err) {
      setUploadError(getErrorMessage(err, 'Erro ao enviar o documento. Verifique o tipo e tamanho do arquivo.'))
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
              <TableHead className="hidden md:table-cell">Destinatário</TableHead>
              <TableHead className="hidden md:table-cell">Base IA</TableHead>
              <TableHead className="hidden md:table-cell">Acesso</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">Carregando...</TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center">
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
                  {doc.recipientUsername ? (
                    <Badge variant="outline" className="border-blue-500 text-blue-600">
                      <GraduationCap className="mr-1 h-3 w-3" />
                      {doc.recipientUsername}
                    </Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
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
                <TableCell className="hidden md:table-cell">
                  {doc.isPublic ? (
                    <Badge variant="outline" className="border-green-500 text-green-600">
                      <Unlock className="mr-1 h-3 w-3" />
                      Público
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-orange-500 text-orange-600">
                      <Lock className="mr-1 h-3 w-3" />
                      Restrito
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <a href={`${process.env.NEXT_PUBLIC_API_URL}/api/documents/${doc.id}/download`} target="_blank" rel="noopener noreferrer" aria-label="Baixar">
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

            {/* For student toggle */}
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="forStudent">Destinar a um aluno</Label>
                <p className="text-xs text-muted-foreground">Associar este documento a um aluno específico</p>
              </div>
              <Switch
                id="forStudent"
                checked={forStudent}
                onCheckedChange={handleForStudentToggle}
              />
            </div>

            {/* Student selector panel */}
            {forStudent && (
              <div className="space-y-2 rounded-lg border border-border p-3">
                <Label>Aluno destinatário *</Label>
                {recipientId ? (
                  <div className="flex items-center justify-between rounded-md bg-accent/10 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-accent" />
                      <span className="text-sm font-medium">{recipientUsername}</span>
                    </div>
                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={handleClearRecipient}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por username, e-mail ou RA..."
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {(students.length > 0 || studentSearchLoading) && (
                      <div className="max-h-48 overflow-y-auto rounded-md border border-border">
                        {studentSearchLoading ? (
                          <p className="px-3 py-4 text-center text-sm text-muted-foreground">Buscando...</p>
                        ) : students.length === 0 ? (
                          <p className="px-3 py-4 text-center text-sm text-muted-foreground">Nenhum aluno encontrado.</p>
                        ) : students.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => handleSelectStudent(s)}
                            className="flex w-full flex-col gap-0.5 px-3 py-2 text-left text-sm hover:bg-accent/10 focus:outline-none focus:bg-accent/10"
                          >
                            <span className="font-medium">{s.username}</span>
                            <span className="text-xs text-muted-foreground">
                              {s.email}{s.ra ? ` · RA: ${s.ra}` : ''}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                    {!studentSearchLoading && students.length === 0 && studentSearch.trim() && (
                      <p className="text-xs text-muted-foreground">Nenhum aluno encontrado para &quot;{studentSearch}&quot;.</p>
                    )}
                  </>
                )}
              </div>
            )}

            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="knowledgeBase" className={forStudent ? 'text-muted-foreground' : ''}>
                  Base de Conhecimento IA
                </Label>
                <p className="text-xs text-muted-foreground">
                  {forStudent
                    ? 'Indisponível para documentos com destinatário'
                    : 'Usar como referência para o chatbot'}
                </p>
              </div>
              <Switch
                id="knowledgeBase"
                checked={knowledgeBase}
                onCheckedChange={setKnowledgeBase}
                disabled={forStudent}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="isPublic">Visibilidade Pública</Label>
                <p className="text-xs text-muted-foreground">Visível para usuários não autenticados</p>
              </div>
              <Switch
                id="isPublic"
                checked={isPublic}
                onCheckedChange={setIsPublic}
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
              Tem certeza que deseja excluir &quot;{selected?.fileName}&quot;? O arquivo será removido do armazenamento e esta ação não pode ser desfeita.
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
