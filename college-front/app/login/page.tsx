'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Lock, AlertCircle, ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/hooks/use-auth'

export default function LoginPage() {
  const router = useRouter()
  const { user, isLoading: authLoading, login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Redirect once React has committed the authenticated state.
  // The admin layout enforces fine-grained permissions; the login page only
  // needs to know that the user is authenticated.
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/admin')
    }
  }, [authLoading, user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login(username, password)
      // Redirect is handled by the useEffect above when `user` state is committed
    } catch {
      setError('Usuário ou senha inválidos.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao início
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Image src="/mural_uni_logo.png" alt="Mural Universitário" width={64} height={64} className="rounded-lg" />
            <span className="text-lg font-bold text-foreground">Mural Universitário</span>
          </div>

          <h2 className="mt-8 text-2xl font-bold tracking-tight text-foreground">
            Acesse sua conta
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Entre com suas credenciais para acessar o painel administrativo.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuário</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="seu.usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <Link
                    href="/esqueci-minha-senha"
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Esqueceu sua senha?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </div>
      </div>

      <div className="hidden flex-1 bg-primary lg:block">
        <div className="flex h-full flex-col items-center justify-center p-12">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-8 flex justify-center">
              <Image src="/mural_uni_logo_white_bg.png" alt="Mural Universitário" width={140} height={140} className="rounded-2xl" />
            </div>
            <h2 className="text-3xl font-bold text-primary-foreground">Painel Administrativo</h2>
            <p className="mt-4 text-lg text-primary-foreground/80">
              Gerencie avisos, documentos, usuários e grupos de acesso do Mural Universitário.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
