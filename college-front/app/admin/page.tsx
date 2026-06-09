'use client'

import { useEffect, useState } from 'react'
import { FileText, Users, Shield, Eye, TrendingUp, Calendar, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { getNotices } from '@/lib/api/notices'
import { getUsers } from '@/lib/api/users'
import { getRoles } from '@/lib/api/roles'
import { getDocuments } from '@/lib/api/documents'
import type { NoticeResponse, DocumentResponse } from '@/lib/api/types'

interface Stats {
  notices: number
  users: number
  roles: number
  documents: number
  knowledgeBaseDocs: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ notices: 0, users: 0, roles: 0, documents: 0, knowledgeBaseDocs: 0 })
  const [recentNotices, setRecentNotices] = useState<NoticeResponse[]>([])
  const [kbDocuments, setKbDocuments] = useState<DocumentResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      getNotices({ size: 3 }),
      getUsers({ size: 1 }),
      getRoles(),
      getDocuments(),
    ])
      .then(([notices, users, roles, docs]) => {
        setStats({
          notices: notices.totalElements,
          users: users.totalElements,
          roles: roles.length,
          documents: docs.length,
          knowledgeBaseDocs: docs.filter((d) => d.knowledgeBase).length,
        })
        setRecentNotices(notices.content)
        setKbDocuments(docs.filter((d) => d.knowledgeBase).slice(0, 3))
      })
      .catch(() => setError('Não foi possível carregar as informações do dashboard.'))
      .finally(() => setIsLoading(false))
  }, [])

  const statCards = [
    { title: 'Avisos', value: stats.notices, icon: FileText, description: 'Avisos publicados', color: 'text-blue-600 bg-blue-100' },
    { title: 'Usuários', value: stats.users, icon: Users, description: 'Cadastrados no sistema', color: 'text-green-600 bg-green-100' },
    { title: 'Grupos de Acesso', value: stats.roles, icon: Shield, description: 'Perfis de permissão', color: 'text-purple-600 bg-purple-100' },
    { title: 'Documentos', value: stats.documents, icon: Eye, description: `${stats.knowledgeBaseDocs} na base de conhecimento`, color: 'text-orange-600 bg-orange-100' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do Mural Universitário</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className={`rounded-lg p-2 ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? '…' : stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent" />
              Avisos Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : recentNotices.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum aviso publicado ainda.</p>
            ) : (
              <div className="space-y-3">
                {recentNotices.map((notice) => (
                  <div key={notice.id} className="flex items-start gap-3 rounded-lg border border-border p-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{notice.title}</p>
                      <div className="mt-0.5 flex items-center gap-2">
                        {notice.categoryName && (
                          <Badge variant="secondary" className="text-xs">{notice.categoryName}</Badge>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {new Date(notice.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-accent" />
              Base de Conhecimento IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : kbDocuments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum documento indexado na base de conhecimento.
              </p>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {stats.knowledgeBaseDocs} documento(s) disponível(is) para o chatbot.
                </p>
                {kbDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                      <Eye className="h-4 w-4 text-accent" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{doc.fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {(doc.fileSize / 1024).toFixed(0)} KB · {doc.username}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
