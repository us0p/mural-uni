import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/hooks/use-auth'
import { ChatWidget } from '@/components/chat/chat-widget'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const _geist = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Mural Universitário',
  description: 'Seu portal de informações acadêmicas. Fique por dentro de eventos, oportunidades de estágio e anúncios importantes.',
  generator: 'v0.app',
  icons: {
    icon: '/mural_uni_logo_white_bg.png',
    apple: '/mural_uni_logo_white_bg.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="bg-background">
      <body className="font-sans antialiased">
        <AuthProvider>
          {children}
          <ChatWidget />
          <Toaster />
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
