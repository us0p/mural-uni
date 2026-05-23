'use client'

import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useInView } from 'react-intersection-observer'
import Image from 'next/image'
import { Calendar, User, Tag, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { getNotices } from '@/lib/api/notices'
import type { NoticeResponse } from '@/lib/api/types'
import { DEBOUNCE_MS } from '@/lib/constants'

const POSTS_PER_PAGE = 4

function stripMarkdown(text: string): string {
  return text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/#{1,6}\s+/g, '')
    .replace(/[*_`>]/g, '')
    .replace(/\n+/g, ' ')
    .trim()
}

function PostCard({ post }: { post: NoticeResponse }) {
  const excerpt = stripMarkdown(post.markdownContent).slice(0, 140)

  return (
    <Link
      href={`/blog/${post.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-accent/50 hover:shadow-lg"
    >
      <div className="relative aspect-video overflow-hidden">
        {post.coverImgUrl ? (
          <Image
            src={post.coverImgUrl}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-accent/20 to-primary/20" />
        )}
        {post.categoryName && (
          <div className="absolute left-3 top-3">
            <Badge className="bg-accent text-accent-foreground">
              <Tag className="mr-1 h-3 w-3" />
              {post.categoryName}
            </Badge>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-card-foreground transition-colors group-hover:text-accent">
          {post.title}
        </h3>
        <p className="mb-4 line-clamp-2 flex-1 text-sm text-muted-foreground">
          {excerpt}
          {post.markdownContent.length > 140 ? '…' : ''}
        </p>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <User className="h-3.5 w-3.5" />
            {post.username}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(post.createdAt).toLocaleDateString('pt-BR')}
          </span>
        </div>
      </div>
    </Link>
  )
}

function BlogContent() {
  const searchParams = useSearchParams()
  const initialSearch = searchParams.get('q') ?? ''

  const [posts, setPosts] = useState<NoticeResponse[]>([])
  const [apiPage, setApiPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const activeQuery = useRef(initialSearch)

  const { ref, inView } = useInView({ threshold: 0, rootMargin: '100px' })

  const fetchPage = useCallback(async (title: string, page: number, replace: boolean) => {
    try {
      const data = await getNotices({ searchParam: title || undefined, page, size: POSTS_PER_PAGE })
      setPosts((prev) => replace ? data.content : [...prev, ...data.content])
      setApiPage(page)
      setHasMore(data.content.length > 0 && (page + 1) < data.totalPages)
    } catch {
      if (replace) setPosts([])
      setHasMore(false)
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    setIsLoading(true)
    fetchPage(initialSearch, 0, true)
  }, [fetchPage, initialSearch])

  // Debounced search
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      activeQuery.current = value
      setIsLoading(true)
      setPosts([])
      fetchPage(value, 0, true)
    }, DEBOUNCE_MS)
  }

  // Infinite scroll: load next page when sentinel comes into view
  useEffect(() => {
    if (inView && hasMore && !isLoadingMore && !isLoading) {
      setIsLoadingMore(true)
      fetchPage(activeQuery.current, apiPage + 1, false)
    }
  }, [inView, hasMore, isLoadingMore, isLoading, apiPage, fetchPage])

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-background">
        {/* Hero */}
        <section className="border-b border-border bg-card py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Avisos</h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Confira as últimas novidades, eventos e oportunidades.
            </p>
          </div>
        </section>

        {/* Search */}
        <section className="border-b border-border bg-card/50 py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  &quot;{searchQuery}&quot;
                  <button onClick={() => handleSearchChange('')}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          </div>
        </section>

        {/* Posts Grid */}
        <section className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
              </div>
            ) : posts.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-lg text-muted-foreground">Nenhum aviso encontrado.</p>
                {searchQuery && (
                  <Button variant="outline" className="mt-4" onClick={() => handleSearchChange('')}>
                    Limpar busca
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>

                {/* Infinite scroll sentinel */}
                {hasMore && (
                  <div ref={ref} className="mt-8 flex justify-center">
                    {isLoadingMore && (
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
                    )}
                  </div>
                )}

                {!hasMore && posts.length > 0 && (
                  <p className="mt-8 text-center text-sm text-muted-foreground">
                    Você chegou ao fim dos avisos.
                  </p>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default function BlogPage() {
  return (
    <Suspense>
      <BlogContent />
    </Suspense>
  )
}
