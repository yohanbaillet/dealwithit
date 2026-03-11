import { getRequestConfig } from 'next-intl/server'
import { cookies, headers } from 'next/headers'

export const SUPPORTED_LOCALES = ['fr', 'en', 'de', 'es', 'it'] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'fr'

// ISO 3166-1 alpha-2 country → locale
const COUNTRY_LOCALE_MAP: Record<string, Locale> = {
  // French
  FR: 'fr', BE: 'fr', LU: 'fr', MC: 'fr',
  // English
  GB: 'en', US: 'en', CA: 'en', AU: 'en', NZ: 'en', IE: 'en', ZA: 'en',
  // German
  DE: 'de', AT: 'de',
  // Spanish
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', PE: 'es', CL: 'es',
  BO: 'es', EC: 'es', PY: 'es', UY: 'es', VE: 'es',
  CR: 'es', CU: 'es', DO: 'es', GT: 'es', HN: 'es', NI: 'es', PA: 'es', SV: 'es',
  // Italian
  IT: 'it', SM: 'it', VA: 'it',
}

function localeFromAcceptLanguage(header: string | null): Locale | null {
  if (!header) return null
  // Parse "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7" → try each lang tag in order
  const tags = header.split(',').map((s) => s.split(';')[0].trim().slice(0, 2).toLowerCase())
  for (const tag of tags) {
    if (SUPPORTED_LOCALES.includes(tag as Locale)) return tag as Locale
  }
  return null
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const headerStore = await headers()

  // 1. Explicit user preference (cookie)
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value
  if (SUPPORTED_LOCALES.includes(cookieLocale as Locale)) {
    const locale = cookieLocale as Locale
    return { locale, messages: (await import(`../messages/${locale}.json`)).default }
  }

  // 2. Vercel IP geolocation (production — set automatically per request)
  const country = headerStore.get('x-vercel-ip-country')?.toUpperCase()
  const countryLocale = country ? COUNTRY_LOCALE_MAP[country] : null
  if (countryLocale) {
    return { locale: countryLocale, messages: (await import(`../messages/${countryLocale}.json`)).default }
  }

  // 3. Browser Accept-Language header (works in local dev too)
  const acceptLocale = localeFromAcceptLanguage(headerStore.get('accept-language'))
  if (acceptLocale) {
    return { locale: acceptLocale, messages: (await import(`../messages/${acceptLocale}.json`)).default }
  }

  // 4. Default
  return {
    locale: DEFAULT_LOCALE,
    messages: (await import(`../messages/${DEFAULT_LOCALE}.json`)).default,
  }
})
