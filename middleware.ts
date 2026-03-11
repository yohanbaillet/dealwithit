import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, type Locale } from '@/i18n/request'

// ISO 3166-1 alpha-2 country → locale (mirrors i18n/request.ts)
const COUNTRY_LOCALE_MAP: Record<string, Locale> = {
  FR: 'fr', BE: 'fr', LU: 'fr', MC: 'fr',
  GB: 'en', US: 'en', CA: 'en', AU: 'en', NZ: 'en', IE: 'en', ZA: 'en',
  DE: 'de', AT: 'de',
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', PE: 'es', CL: 'es',
  BO: 'es', EC: 'es', PY: 'es', UY: 'es', VE: 'es',
  CR: 'es', CU: 'es', DO: 'es', GT: 'es', HN: 'es', NI: 'es', PA: 'es', SV: 'es',
  IT: 'it', SM: 'it', VA: 'it',
}

function detectLocale(request: NextRequest): Locale {
  // 1. Explicit user preference (cookie)
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value
  if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale as Locale)) {
    return cookieLocale as Locale
  }

  // 2. Vercel IP geolocation header
  const country = request.headers.get('x-vercel-ip-country')?.toUpperCase()
  if (country && COUNTRY_LOCALE_MAP[country]) {
    return COUNTRY_LOCALE_MAP[country]
  }

  // 3. Browser Accept-Language
  const acceptLang = request.headers.get('accept-language')
  if (acceptLang) {
    const tags = acceptLang.split(',').map((s) => s.split(';')[0].trim().slice(0, 2).toLowerCase())
    for (const tag of tags) {
      if (SUPPORTED_LOCALES.includes(tag as Locale)) return tag as Locale
    }
  }

  return DEFAULT_LOCALE
}

export async function middleware(request: NextRequest) {
  const locale = detectLocale(request)

  // Forward detected locale as a request header so getRequestConfig can read it reliably
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-locale', locale)

  // Supabase auth session refresh
  let response = NextResponse.next({ request: { headers: requestHeaders } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request: { headers: requestHeaders } })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
