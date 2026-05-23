'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ArrowLeft, Tag, User, Calendar, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/hooks/use-auth'
import { createNotice } from '@/lib/api/notices'
import { getNoticeCategories } from '@/lib/api/notice-categories'
import type { NoticeCategoryResponse } from '@/lib/api/types'

export default function NovoAvisoPage() {
  const router = useRouter()
  const { user } = useAuth()

  const [title, setTitle] = useState('')
  const [markdownContent, setMarkdownContent] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [coverImgUrl, setCoverImgUrl] = useState('')
  const [categories, setCategories] = useState<NoticeCategoryResponse[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getNoticeCategories().then(setCategories).catch(() => {})
  }, [])

  const selectedCategory = categories.find((c) => c.id.toString() === categoryId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setIsSaving(true)
    setError(null)
    try {
      await createNotice({
        title,
        markdownContent,
        categoryId: Number(categoryId),
        coverImgUrl: coverImgUrl.trim() || undefined,
      })
      router.push('/admin/posts')
    } catch {
      setError('Erro ao publicar o aviso. Tente novamente.')
      setIsSaving(false)
    }
  }

  return (
    /* Break out of the admin main padding to fill the full area */
    <div className="-m-4 lg:-m-8 flex flex-col" style={{ height: 'calc(100vh - 0px)' }}>

      {/* Top bar */}
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-card px-6 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/admin/posts')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Novo Aviso</h1>
            <p className="text-xs text-muted-foreground">Preencha o formulário e veja o resultado em tempo real</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push('/admin/posts')}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSaving || !title.trim() || !categoryId || !markdownContent.trim()}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {isSaving ? 'Publicando...' : 'Publicar Aviso'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="shrink-0 px-6 pt-3">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Split view */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left: Form ───────────────────────────────────────── */}
        <div className="flex w-1/2 flex-col overflow-y-auto border-r border-border bg-card/50 px-6 py-6">
          <form onSubmit={handleSubmit} className="space-y-5">

            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Semana Acadêmica 2025"
                maxLength={200}
                required
              />
              <p className="text-xs text-muted-foreground text-right">{title.length}/200</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="categoryId">Categoria *</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
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
                  value={coverImgUrl}
                  onChange={(e) => setCoverImgUrl(e.target.value)}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="markdownContent">Conteúdo (Markdown) *</Label>
              <Textarea
                id="markdownContent"
                value={markdownContent}
                onChange={(e) => setMarkdownContent(e.target.value)}
                placeholder={`# Título\n\nEscreva o conteúdo usando **Markdown**.\n\n## Subtítulo\n\n- Item 1\n- Item 2`}
                rows={22}
                className="resize-none font-mono text-sm"
                required
              />
              <p className="text-xs text-muted-foreground">
                Use Markdown: # títulos, **negrito**, *itálico*, - listas, ![alt](url) imagens.
                Para quebrar linha, deixe uma linha em branco entre os parágrafos ou termine a linha com dois espaços.
              </p>
            </div>
          </form>
        </div>

        {/* ── Right: Live Preview ───────────────────────────────── */}
        <div className="flex w-1/2 flex-col overflow-y-auto bg-background">

          {/* Preview label */}
          <div className="flex shrink-0 items-center gap-2 border-b border-border bg-background px-6 py-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Pré-visualização
            </span>
          </div>

          {/* Cover image — scrolls with the content */}
          {coverImgUrl.trim() && (
            <div className="relative h-48 w-full overflow-hidden sm:h-56">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverImgUrl}
                alt="Capa"
                className="h-full w-full object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
            </div>
          )}

          <article className="flex-1 px-8 py-6">
            {/* Category */}
            {selectedCategory && (
              <Badge variant="secondary" className="mb-4 gap-1">
                <Tag className="h-3 w-3" />
                {selectedCategory.name}
              </Badge>
            )}

            {/* Title */}
            <h1 className="mb-6 text-3xl font-bold tracking-tight text-foreground">
              {title || <span className="text-muted-foreground/50">Título do aviso...</span>}
            </h1>

            {/* Meta */}
            <div className="mb-8 flex flex-wrap items-center gap-4 border-b border-border pb-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                {user?.username ?? 'autor'}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>

            {/* Markdown content */}
            {markdownContent.trim() ? (
              <div className="prose max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    img({ src, alt }) {
                      if (!src) return null
                      return (
                        // eslint-disable-next-line @next/next/no-img-element
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
                  {markdownContent}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="text-muted-foreground/50 italic">
                O conteúdo do aviso aparecerá aqui enquanto você escreve...
              </p>
            )}
          </article>
        </div>
      </div>
    </div>
  )
}
