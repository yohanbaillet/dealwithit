import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'dealWithIt — Vos lettres administratives en quelques secondes',
  description:
    'Décrivez votre situation, dealWithIt génère la lettre parfaite pour résilier, contester ou réclamer. Simple, rapide, efficace.',
  keywords: ['lettre administrative', 'résiliation', 'contestation', 'réclamation', 'courrier officiel'],
  openGraph: {
    title: 'dealWithIt',
    description: 'Vos lettres administratives en quelques secondes',
    siteName: 'dealWithIt',
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale} className={inter.variable}>
      <body className="min-h-screen bg-white font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          {children}
          <Toaster position="top-center" richColors />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
