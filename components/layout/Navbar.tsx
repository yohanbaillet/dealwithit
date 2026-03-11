'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { LogOut, LayoutDashboard, ChevronDown } from 'lucide-react'
import { setLocale } from '@/actions/locale'
import type { Locale } from '@/i18n/request'

const LOCALES: { code: Locale; flag: string; label: string }[] = [
  { code: 'fr', flag: '🇫🇷', label: 'FR' },
  { code: 'en', flag: '🇬🇧', label: 'EN' },
  { code: 'de', flag: '🇩🇪', label: 'DE' },
  { code: 'es', flag: '🇪🇸', label: 'ES' },
  { code: 'it', flag: '🇮🇹', label: 'IT' },
]

interface NavbarProps {
  userEmail?: string | null
}

export function Navbar({ userEmail }: NavbarProps) {
  const t = useTranslations('nav')
  const locale = useLocale() as Locale
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/logo.svg"
            alt="dealWithIt"
            width={28}
            height={28}
            className="h-7 w-auto"
            priority
          />
          <span className="font-semibold text-gray-900">dealWithIt</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Language selector */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 transition-colors">
              <span>{LOCALES.find((l) => l.code === locale)?.flag}</span>
              <span className="hidden sm:inline text-xs font-medium">{locale.toUpperCase()}</span>
              <ChevronDown className="h-3 w-3 text-gray-400" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[120px]">
              {LOCALES.map((l) => (
                <DropdownMenuItem
                  key={l.code}
                  onClick={() => setLocale(l.code)}
                  className={`gap-2 cursor-pointer ${locale === l.code ? 'font-semibold' : ''}`}
                >
                  <span>{l.flag}</span>
                  <span>{l.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {userEmail ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('myLetters')}</span>
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="gap-1.5 text-gray-500"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">{t('logout')}</span>
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">{t('login')}</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-gray-900 hover:bg-gray-800">
                  {t('signup')}
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
