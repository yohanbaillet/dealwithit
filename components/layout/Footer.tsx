'use client'

import { useLocale, useTranslations } from 'next-intl'
import { setLocale } from '@/actions/locale'
import type { Locale } from '@/i18n/request'

const LOCALES: { code: Locale; flag: string; label: string }[] = [
  { code: 'fr', flag: '🇫🇷', label: 'FR' },
  { code: 'en', flag: '🇬🇧', label: 'EN' },
  { code: 'de', flag: '🇩🇪', label: 'DE' },
  { code: 'es', flag: '🇪🇸', label: 'ES' },
  { code: 'it', flag: '🇮🇹', label: 'IT' },
]

export function Footer() {
  const t = useTranslations('footer')
  const locale = useLocale() as Locale
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-gray-100 py-6">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-4 sm:flex-row sm:justify-between">
        <p className="text-sm text-gray-400">
          {t('copyright', { year })}
        </p>

        <div className="flex items-center gap-1">
          {LOCALES.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => setLocale(l.code)}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                locale === l.code
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'
              }`}
              aria-label={l.label}
            >
              <span>{l.flag}</span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      </div>
    </footer>
  )
}
