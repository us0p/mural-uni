'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { forgotPassword } from '@/lib/api/auth'

export default function EsqueciMinhaSenhaPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await forgotPassword(email)
    } catch {
      // intentionally swallowed — we never reveal whether the email exists
    } finally {
      setIsLoading(false)
      setSent(true)
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8">
            <Link
              href="/login"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao login
            </Link>
          </div>

          <div className="flex items-center gap-2 mb-8">
            <Image src="/mural_uni_logo.png" alt="Mural Universitário" width={64} height={64} className="rounded-lg" />
            <span className="text-lg font-bold text-foreground">Mural Universitário</span>
          </div>

          {!sent ? (
            <>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Esqueceu sua senha?
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Informe seu e-mail e enviaremos um link para redefinir sua senha.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                  disabled={isLoading}
                >
                  {isLoading ? 'Enviando...' : 'Enviar link de redefinição'}
                </Button>
              </form>
            </>
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 mb-4">
                <Mail className="h-6 w-6 text-accent" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Verifique seu e-mail
              </h2>

              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Se este endereço estiver cadastrado, você receberá um link de redefinição em instantes.
                  Verifique também a caixa de spam.
                </AlertDescription>
              </Alert>

              <Button asChild variant="outline" className="mt-8 w-full">
                <Link href="/login">Voltar ao login</Link>
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
            <h2 className="text-3xl font-bold text-primary-foreground">Recuperação de acesso</h2>
            <p className="mt-4 text-lg text-primary-foreground/80">
              Enviaremos um link seguro para o e-mail cadastrado na sua conta.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
