'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter, notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ArrowLeft, Calendar, User, Tag, Pencil, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { useAuth } from '@/hooks/use-auth'
import { getNotice, updateNotice } from '@/lib/api/notices'
import { getNoticeCategories } from '@/lib/api/notice-categories'
import type { NoticeResponse, NoticeCategoryResponse } from '@/lib/api/types'
import { toast } from 'sonner'

type EditForm = { title: string; markdownContent: string; categoryId: string; coverImgUrl: string }

export default function PostPage() {
  const params = useParams()
  const router = useRouter()
  const id = Number(params.slug)
  const { canAccessUiItem } = useAuth()
  const canEdit = canAccessUiItem('admin_blog_post')

  const [post, setPost] = useState<NoticeResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFoundError, setNotFoundError] = useState(false)

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editForm, setEditForm] = useState<EditForm>({ title: '', markdownContent: '', categoryId: '', coverImgUrl: '' })
  const [categories, setCategories] = useState<NoticeCategoryResponse[]>([])
  const [saveError, setSaveError] = useState<string | null>(null)

  const loadPost = useCallback(() => {
    if (isNaN(id)) { setNotFoundError(true); setLoading(false); return }
    getNotice(id)
      .then(setPost)
      .catch(() => setNotFoundError(true))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => { loadPost() }, [loadPost])

  const handleEditOpen = () => {
    if (!post) return
    setEditForm({
      title: post.title,
      markdownContent: post.markdownContent,
      categoryId: post.categoryId?.toString() ?? '',
      coverImgUrl: post.coverImgUrl ?? '',
    })
    setSaveError(null)
    if (categories.length === 0) {
      getNoticeCategories().then(setCategories).catch(() => {})
    }
    setIsEditOpen(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!post) return

    const previousPost = post
    const categoryName =
      categories.find((c) => c.id.toString() === editForm.categoryId)?.name ?? post.categoryName
    const optimisticPost: NoticeResponse = {
      ...post,
      title: editForm.title,
      markdownContent: editForm.markdownContent,
      categoryId: Number(editForm.categoryId),
      categoryName,
      coverImgUrl: editForm.coverImgUrl.trim() || undefined,
    }

    setPost(optimisticPost)
    setIsEditOpen(false)
    setSaveError(null)

    try {
      const updated = await updateNotice(post.id, {
        title: editForm.title,
        markdownContent: editForm.markdownContent,
        categoryId: Number(editForm.categoryId),
        coverImgUrl: editForm.coverImgUrl.trim() || undefined,
      })
      setPost(updated)
    } catch {
      setPost(previousPost)
      setIsEditOpen(true)
      setSaveError('Erro ao salvar o aviso. Tente novamente.')
      toast.error('Erro ao salvar o aviso. Tente novamente.')
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    )
  }

  if (notFoundError || !post) notFound()

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-background">
        {post!.coverImgUrl && (
          <div className="relative h-64 w-full overflow-hidden sm:h-80 lg:h-96">
            <img
              src={post!.coverImgUrl}
              alt={post!.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          </div>
        )}

        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Nav row: back button left, edit button right */}
          <div className="mb-8 flex items-center justify-between">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            {canEdit && (
              <Button
                variant="outline"
                onClick={handleEditOpen}
                className="gap-2"
              >
                <Pencil className="h-4 w-4" />
                Editar aviso
              </Button>
            )}
          </div>

          <article>
            <header className="mb-8">
              {post!.categoryName && (
                <Badge variant="secondary" className="mb-4 gap-1">
                  <Tag className="h-3 w-3" />
                  {post!.categoryName}
                </Badge>
              )}

              <h1 className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {post!.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 border-b border-border pb-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  {post!.username}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {new Date(post!.createdAt).toLocaleDateString('pt-BR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </header>

            <div className="prose prose-neutral max-w-none dark:prose-invert">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  img({ src, alt }) {
                    if (!src) return null
                    return (
                      <img
                        src={src}
                        alt={alt ?? ''}
                        className="my-6 max-w-full rounded-lg"
                        loading="lazy"
                      />
                    )
                  },
                }}
              >
                {post!.markdownContent}
              </ReactMarkdown>
            </div>
          </article>
        </div>
      </main>

      <Footer />

      {/* Edit dialog — only mounted when canEdit */}
      {canEdit && (
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Aviso</DialogTitle>
              <DialogDescription>Atualize as informações do aviso.</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {saveError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{saveError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="edit-title">Título</Label>
                <Input
                  id="edit-title"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Categoria</Label>
                  <Select
                    value={editForm.categoryId}
                    onValueChange={(v) => setEditForm({ ...editForm, categoryId: v })}
                  >
                    <SelectTrigger id="edit-category">
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
                  <Label htmlFor="edit-cover">URL da Imagem de Capa</Label>
                  <Input
                    id="edit-cover"
                    value={editForm.coverImgUrl}
                    onChange={(e) => setEditForm({ ...editForm, coverImgUrl: e.target.value })}
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-content">Conteúdo (Markdown)</Label>
                <Textarea
                  id="edit-content"
                  value={editForm.markdownContent}
                  onChange={(e) => setEditForm({ ...editForm, markdownContent: e.target.value })}
                  rows={14}
                  className="font-mono text-sm"
                  required
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={!editForm.categoryId}
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  Salvar Alterações
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
