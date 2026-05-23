import Link from 'next/link'
import Image from 'next/image'
import { Mail, Phone, MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Logo e Descrição */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/mural_uni_logo_white_bg.png" alt="Mural Universitário" width={64} height={64} className="rounded-lg" />
              <span className="text-lg font-bold">Mural Universitário</span>
            </Link>
            <p className="text-sm text-primary-foreground/80">
              Seu portal de informações acadêmicas. Fique por dentro de eventos,
              oportunidades de estágio e anúncios importantes.
            </p>
          </div>

          {/* Links Rápidos */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              Links Rápidos
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/blog"
                  className="text-sm text-primary-foreground/80 transition-colors hover:text-accent"
                >
                  Avisos
                </Link>
              </li>
              <li>
                <Link
                  href="/documentos"
                  className="text-sm text-primary-foreground/80 transition-colors hover:text-accent"
                >
                  Documentos
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-sm text-primary-foreground/80 transition-colors hover:text-accent"
                >
                  Área do Aluno
                </Link>
              </li>
            </ul>
          </div>

          <div aria-hidden="true" />

          {/* Contato */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              Contato
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-primary-foreground/80">
                <Mail className="h-4 w-4 text-accent" />
                contato@mural.edu.br
              </li>
              <li className="flex items-center gap-2 text-sm text-primary-foreground/80">
                <Phone className="h-4 w-4 text-accent" />
		+55 (11) 96427-5767
              </li>
              <li className="flex items-start gap-2 text-sm text-primary-foreground/80">
                <MapPin className="h-4 w-4 shrink-0 text-accent" />
		Rua Casa do Ator, 294
                <br />
                São Paulo - SP
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-primary-foreground/20 pt-8">
          <p className="text-center text-sm text-primary-foreground/60">
            &copy; {new Date().getFullYear()} Mural Universitário. Todos os
            direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
