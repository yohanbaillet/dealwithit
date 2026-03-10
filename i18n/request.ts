import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'

export const SUPPORTED_LOCALES = ['fr', 'en', 'de', 'es', 'it'] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'fr'

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value
  const locale = (SUPPORTED_LOCALES.includes(cookieLocale as Locale)
    ? cookieLocale
    : DEFAULT_LOCALE) as Locale

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
