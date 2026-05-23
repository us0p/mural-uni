'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Lock, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { setPassword } from '@/lib/api/auth'

type State = 'form' | 'success' | 'invalid-link'

function SetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [state, setState] = useState<State>(() => (token ? 'form' : 'invalid-link'))
  const [password, setPasswordValue] = useState('')
  const [confirm, setConfirm] = useState('')
  const [matchError, setMatchError] = useState(false)
  const [apiError, setApiError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!token) setState('invalid-link')
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMatchError(false)
    setApiError(false)

    if (password !== confirm) {
      setMatchError(true)
      return
    }

    setIsLoading(true)
    try {
      await setPassword(token!, password)
      setState('success')
    } catch {
      setApiError(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8">
            <Image src="/mural_uni_logo.png" alt="Mural Universitário" width={64} height={64} className="rounded-lg" />
            <span className="text-lg font-bold text-foreground">Mural Universitário</span>
          </div>

          {state === 'invalid-link' && (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mb-4">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Link inválido</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Este link é inválido ou já foi utilizado. Solicite um novo convite ao administrador.
              </p>
              <Button asChild className="mt-8 w-full bg-accent text-accent-foreground hover:bg-accent/90">
                <Link href="/login">Ir para o login</Link>
              </Button>
            </>
          )}

          {state === 'form' && (
            <>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Crie sua senha</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Escolha uma senha segura para acessar sua conta.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                {apiError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Link inválido ou expirado. Solicite um novo convite ao administrador.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Nova senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Entre 8 e 72 caracteres"
                        value={password}
                        onChange={(e) => setPasswordValue(e.target.value)}
                        className="pl-10"
                        minLength={8}
                        maxLength={72}
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Use entre 8 e 72 caracteres.</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm">Confirmar senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="confirm"
                        type="password"
                        placeholder="Repita a senha"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        className={`pl-10 ${matchError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                        required
                      />
                    </div>
                    {matchError && (
                      <p className="text-sm text-destructive">As senhas não coincidem.</p>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                  disabled={isLoading}
                >
                  {isLoading ? 'Salvando...' : 'Criar senha'}
                </Button>
              </form>
            </>
          )}

          {state === 'success' && (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 mb-4">
                <CheckCircle className="h-6 w-6 text-accent" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Senha criada!</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Sua senha foi definida com sucesso. Você já pode fazer login.
              </p>
              <Button asChild className="mt-8 w-full bg-accent text-accent-foreground hover:bg-accent/90">
                <Link href="/login">Ir para o login</Link>
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="hidden flex-1 bg-primary lg:block">
        <div className="flex h-full flex-col items-center justify-center p-12">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-8 flex justify-center">
              <Image src="/mural_uni_logo_white_bg.png" alt="Mural Universitário" width={140} height={140} className="rounded-2xl" />
            </div>
            <h2 className="text-3xl font-bold text-primary-foreground">Bem-vindo ao Portal</h2>
            <p className="mt-4 text-lg text-primary-foreground/80">
              Defina sua senha para começar a usar o Mural Universitário.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CriarSenhaPage() {
  return (
    <Suspense>
      <SetPasswordForm />
    </Suspense>
  )
}
