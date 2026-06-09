'use client'

import { useEffect, useState } from 'react'
import { getNoticeCategories } from '@/lib/api/notice-categories'
import { getSubscriptions, setSubscriptions } from '@/lib/api/aluno'
import { Button } from '@/components/ui/button'
import type { NoticeCategoryResponse } from '@/lib/api/types'
import { getErrorMessage } from '@/lib/api/client'

export default function AlunoPreferenciasPage() {
  const [categories, setCategories] = useState<NoticeCategoryResponse[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    Promise.all([getNoticeCategories(), getSubscriptions()])
      .then(([cats, subs]) => {
        setCategories(cats)
        setSelected(new Set(subs.map((s) => s.id)))
      })
      .catch((err) => setError(getErrorMessage(err, 'Erro ao carregar preferências')))
      .finally(() => setLoading(false))
  }, [])

  function toggleCategory(id: number) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
    setSuccess(false)
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      await setSubscriptions(Array.from(selected))
      setSuccess(true)
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao salvar preferências'))
    } finally {
      setSaving(false)
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
      <h1 className="mb-2 text-2xl font-bold text-foreground">Preferências</h1>
      <p className="mb-6 text-muted-foreground">
        Escolha as categorias de avisos que você quer receber notificações.
      </p>

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-700">
          Preferências salvas com sucesso.
        </div>
      )}

      <div className="mb-6 space-y-3 max-w-sm">
        {categories.map((cat) => (
          <label
            key={cat.id}
            className="flex cursor-pointer items-center justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/30"
          >
            <span className="font-medium text-foreground capitalize">{cat.name}</span>
            <input
              type="checkbox"
              checked={selected.has(cat.id)}
              onChange={() => toggleCategory(cat.id)}
              className="h-4 w-4 accent-accent"
            />
          </label>
        ))}
      </div>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? 'Salvando...' : 'Salvar preferências'}
      </Button>
    </div>
  )
}
