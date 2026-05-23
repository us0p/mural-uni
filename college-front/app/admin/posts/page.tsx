'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, FileText, Search, Eye, Calendar, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useAuth } from '@/hooks/use-auth'
import { getNotices, updateNotice, deleteNotice } from '@/lib/api/notices'
import { getNoticeCategories } from '@/lib/api/notice-categories'
import type { NoticeResponse, NoticeCategoryResponse } from '@/lib/api/types'
import { DEBOUNCE_MS, PAGE_SIZE } from '@/lib/constants'

type FormData = {
  title: string
  markdownContent: string
  categoryId: string
  coverImgUrl: string
}

const emptyForm: FormData = { title: '', markdownContent: '', categoryId: '', coverImgUrl: '' }

export default function AdminPostsPage() {
  const router = useRouter()
  
  const [posts, setPosts] = useState<NoticeResponse[]>([])
  const [categories, setCategories] = useState<NoticeCategoryResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedPost, setSelectedPost] = useState<NoticeResponse | null>(null)
  const [formData, setFormData] = useState<FormData>(emptyForm)
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const loadPosts = useCallback(async (title: string, page: number) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getNotices({ searchParam: title || undefined, page, size: PAGE_SIZE })
      setPosts(data.content)
      setTotalPages(data.totalPages)
      setTotalElements(data.totalElements)
    } catch {
      setError('Não foi possível carregar os avisos.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    loadPosts('', 0)
    getNoticeCategories()
      .then(setCategories)
      .catch(() => setError('Não foi possível carregar as categorias.'))
  }, [loadPosts])

  // Debounced search — resets to page 0
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      setCurrentPage(0)
      loadPosts(value, 0)
    }, DEBOUNCE_MS)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    loadPosts(searchQuery, page)
  }

  const handleOpenEditDialog = (post: NoticeResponse) => {
    setFormError(null)
    setSelectedPost(post)
    setFormData({
      title: post.title,
      markdownContent: post.markdownContent,
      categoryId: post.categoryId?.toString() ?? '',
      coverImgUrl: post.coverImgUrl ?? '',
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPost) return
    setIsSaving(true)
    setFormError(null)
    try {
      const categoryId = Number(formData.categoryId)
      const coverImgUrl = formData.coverImgUrl.trim() || undefined
      await updateNotice(selectedPost.id, { title: formData.title, markdownContent: formData.markdownContent, categoryId, coverImgUrl })
      await loadPosts(searchQuery, currentPage)
      setIsDialogOpen(false)
    } catch {
      setFormError('Erro ao salvar o aviso. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedPost) return
    try {
      await deleteNotice(selectedPost.id)
      const newPage = posts.length === 1 && currentPage > 0 ? currentPage - 1 : currentPage
      setCurrentPage(newPage)
      await loadPosts(searchQuery, newPage)
    } catch {
      setError('Erro ao excluir o aviso.')
    } finally {
      setIsDeleteDialogOpen(false)
      setSelectedPost(null)
    }
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Avisos</h1>
          <p className="text-muted-foreground">Gerencie os avisos do Mural Universitário</p>
        </div>
        <Button onClick={() => router.push('/admin/posts/novo')} className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Plus className="mr-2 h-4 w-4" />
          Novo Aviso
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar avisos..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="outline">{totalElements} aviso(s)</Badge>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead className="hidden sm:table-cell">Categoria</TableHead>
              <TableHead className="hidden sm:table-cell">Autor</TableHead>
              <TableHead className="hidden md:table-cell">Data</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">Carregando...</TableCell>
              </TableRow>
            ) : posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-2 text-muted-foreground">Nenhum aviso encontrado.</p>
                </TableCell>
              </TableRow>
            ) : (
              posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                        <FileText className="h-5 w-5 text-accent" />
                      </div>
                      <p className="min-w-0 truncate font-medium">{post.title}</p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {post.categoryName
                      ? <Badge variant="secondary">{post.categoryName}</Badge>
                      : <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">{post.username}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDate(post.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/blog/${post.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(post)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => { setSelectedPost(post); setIsDeleteDialogOpen(true) }}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {currentPage + 1} de {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0 || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1 || isLoading}
            >
              Próxima
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Aviso</DialogTitle>
            <DialogDescription>Atualize as informações do aviso.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Semana de Tecnologia 2024"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="categoryId">Categoria</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(v) => setFormData({ ...formData, categoryId: v })}
                  required
                >
                  <SelectTrigger id="categoryId">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverImgUrl">URL da Imagem de Capa</Label>
                <Input
                  id="coverImgUrl"
                  value={formData.coverImgUrl}
                  onChange={(e) => setFormData({ ...formData, coverImgUrl: e.target.value })}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="markdownContent">Conteúdo (Markdown)</Label>
              <Textarea
                id="markdownContent"
                value={formData.markdownContent}
                onChange={(e) => setFormData({ ...formData, markdownContent: e.target.value })}
                placeholder={`# Título\n\nEscreva o conteúdo usando **Markdown**.\n\n![descrição](https://url-da-imagem.jpg)\n\n## Subtítulo\n\n- Item 1\n- Item 2`}
                rows={14}
                className="font-mono text-sm"
                required
              />
              <p className="text-xs text-muted-foreground">
                Use Markdown: # títulos, **negrito**, *itálico*, - listas, ![alt](url) imagens.
              </p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSaving || !formData.categoryId}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o aviso &quot;{selectedPost?.title}&quot;? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
