'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Calendar,
  Briefcase,
  Bell,
  MessageCircle,
  Mail,
  ChevronRight,
  CheckCircle,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { addSubscriber, getSubscribers } from '@/lib/storage'
import { getStats } from '@/lib/api/stats'
import type { StatsResponse } from '@/lib/api/types'

const benefits = [
  {
    icon: Calendar,
    title: 'Acesso a Eventos',
    description:
      'Fique por dentro de todos os eventos acadêmicos, palestras, workshops e semanas temáticas da universidade.',
  },
  {
    icon: Briefcase,
    title: 'Oportunidades de Estágio',
    description:
      'Receba em primeira mão as vagas de estágio exclusivas de empresas parceiras da universidade.',
  },
  {
    icon: Bell,
    title: 'Anúncios Importantes',
    description:
      'Notificações sobre prazos, matrículas, resultados de processos seletivos e comunicados oficiais.',
  },
  {
    icon: MessageCircle,
    title: 'Chatbot Inteligente',
    description:
      'Tire suas dúvidas 24/7 com nosso assistente virtual que conhece todo o funcionamento da universidade.',
  },
]

export default function HomePage() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [error, setError] = useState('')
  const [stats, setStats] = useState<StatsResponse | null>(null)

  useEffect(() => {
    getStats().then(setStats).catch(() => {})
  }, [])

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Por favor, insira seu e-mail.')
      return
    }

    if (!email.includes('@')) {
      setError('Por favor, insira um e-mail válido.')
      return
    }

    const subscribers = getSubscribers()
    if (subscribers.some((s) => s.email === email)) {
      setError('Este e-mail já está cadastrado.')
      return
    }

    addSubscriber(email)
    setSubscribed(true)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-primary">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -left-4 top-0 h-72 w-72 rounded-full bg-accent blur-3xl" />
            <div className="absolute -right-4 bottom-0 h-72 w-72 rounded-full bg-accent blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div className="space-y-8">
                {stats?.latest_news && (
                  <div className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5">
                    <span className="text-sm font-medium text-accent">
                      Novidade: {stats.latest_news}
                    </span>
                  </div>
                )}

                <h1 className="text-4xl font-bold leading-tight tracking-tight text-primary-foreground sm:text-5xl lg:text-6xl">
                  <span className="text-balance">
                    Seu portal de informações{' '}
                    <span className="text-accent">acadêmicas</span>
                  </span>
                </h1>

                <p className="max-w-lg text-lg leading-relaxed text-primary-foreground/80">
                  Fique por dentro de eventos, oportunidades de estágio e
                  anúncios importantes. Tudo em um só lugar, com um assistente
                  virtual disponível 24/7.
                </p>

                <div className="flex flex-col gap-4 sm:flex-row">
                  <Button
                    asChild
                    size="lg"
                    className="bg-accent text-accent-foreground hover:bg-accent/90"
                  >
                    <Link href="/blog">
                      Ver avisos
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
                  >
                    <Link href="/documentos">Acessar documentos</Link>
                  </Button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-primary-foreground/10 bg-primary-foreground/5 p-6 backdrop-blur">
                  <p className="text-4xl font-bold text-accent">
                    {stats ? stats.connected_students.toLocaleString('pt-BR') : '—'}
                  </p>
                  <p className="mt-1 text-primary-foreground/70">
                    Alunos conectados
                  </p>
                </div>
                <div className="rounded-2xl border border-primary-foreground/10 bg-primary-foreground/5 p-6 backdrop-blur">
                  <p className="text-4xl font-bold text-accent">
                    {stats ? stats.job_post_count.toLocaleString('pt-BR') : '—'}
                  </p>
                  <p className="mt-1 text-primary-foreground/70">
                    Vagas de estágio
                  </p>
                </div>
                <div className="rounded-2xl border border-primary-foreground/10 bg-primary-foreground/5 p-6 backdrop-blur">
                  <p className="text-4xl font-bold text-accent">
                    {stats ? stats.semester_event_count.toLocaleString('pt-BR') : '—'}
                  </p>
                  <p className="mt-1 text-primary-foreground/70">
                    Eventos por semestre
                  </p>
                </div>
                <div className="rounded-2xl border border-primary-foreground/10 bg-primary-foreground/5 p-6 backdrop-blur">
                  <p className="text-4xl font-bold text-accent">24/7</p>
                  <p className="mt-1 text-primary-foreground/70">
                    Suporte via chat
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="bg-background py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="mx-auto mb-4 h-1 w-16 rounded-full bg-accent" />
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Por que usar o Mural Universitário?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                Tenha acesso a todas as informações importantes da universidade
                em uma plataforma moderna e intuitiva.
              </p>
            </div>

            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-accent/50 hover:shadow-lg"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                    <benefit.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-card-foreground">
                    {benefit.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="bg-secondary py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <Mail className="mx-auto mb-6 h-12 w-12 text-accent" />
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Receba notificações por e-mail
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Cadastre-se para receber as novidades mais importantes
                diretamente no seu e-mail. Sem spam, apenas conteúdo relevante.
              </p>

              {subscribed ? (
                <div className="mt-8 inline-flex items-center gap-2 rounded-xl bg-accent/10 px-6 py-4 text-accent">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">
                    Cadastro realizado com sucesso!
                  </span>
                </div>
              ) : (
                <form
                  onSubmit={handleSubscribe}
                  className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4"
                >
                  <div className="flex-1">
                    <Input
                      type="email"
                      placeholder="Seu melhor e-mail"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 bg-background"
                    />
                    {error && (
                      <p className="mt-2 text-left text-sm text-destructive">
                        {error}
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="h-12 bg-accent px-8 text-accent-foreground hover:bg-accent/90"
                  >
                    Inscrever-se
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-background py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-3xl bg-primary">
              <div className="relative px-8 py-16 sm:px-16 sm:py-20">
                {/* Background decorations */}
                <div className="absolute right-0 top-0 h-64 w-64 -translate-y-1/2 translate-x-1/2 rounded-full bg-accent/20 blur-3xl" />
                <div className="absolute bottom-0 left-0 h-64 w-64 -translate-x-1/2 translate-y-1/2 rounded-full bg-accent/20 blur-3xl" />

                <div className="relative mx-auto max-w-2xl text-center">
                  <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
                    Precisa de ajuda?
                  </h2>
                  <p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/80">
                    Nosso assistente virtual está disponível 24 horas por dia
                    para tirar suas dúvidas sobre eventos, estágios, documentos
                    e muito mais.
                  </p>
                  <p className="mt-6 text-primary-foreground/60">
                    Clique no ícone de chat no canto inferior direito para
                    começar.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
