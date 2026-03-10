import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, FileText, Clock, CheckCircle, Edit3, ChevronRight } from 'lucide-react'
import { INTENT_LABELS } from '@/types'
import type { IntentType, RequestStatus } from '@/types'
import { getTranslations, getLocale } from 'next-intl/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return notFound()

  const [t, tIntents, locale] = await Promise.all([
    getTranslations('dashboard'),
    getTranslations('intents'),
    getLocale(),
  ])

  const STATUS_CONFIG: Record<RequestStatus, { label: string; icon: React.ElementType; color: string }> = {
    draft: { label: t('status.draft'), icon: Edit3, color: 'text-gray-400' },
    clarifying: { label: t('status.clarifying'), icon: Clock, color: 'text-blue-500' },
    generating: { label: t('status.generating'), icon: Clock, color: 'text-purple-500' },
    complete: { label: t('status.complete'), icon: CheckCircle, color: 'text-green-500' },
  }

  const { data: requests } = await supabase
    .from('requests')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('full_name')
    .eq('user_id', user.id)
    .single()

  const firstName = profile?.full_name?.split(' ')[0]

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {firstName ? t('greeting', { name: firstName }) : t('title')}
          </h1>
          <p className="mt-1 text-gray-500">
            {t('requestCount', { count: requests?.length ?? 0 })}
          </p>
        </div>
        <Link href="/">
          <Button className="gap-2 bg-gray-900 hover:bg-gray-800">
            <Plus className="h-4 w-4" />
            {t('newLetter')}
          </Button>
        </Link>
      </div>

      {!requests?.length ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-16 text-center">
          <FileText className="mx-auto mb-3 h-10 w-10 text-gray-200" />
          <p className="font-medium text-gray-500">{t('emptyTitle')}</p>
          <p className="mt-1 text-sm text-gray-400">{t('emptySubtitle')}</p>
          <Link href="/" className="mt-4 inline-block">
            <Button className="bg-gray-900 hover:bg-gray-800">{t('emptyAction')}</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {requests.map((req) => {
            const status = STATUS_CONFIG[req.status as RequestStatus]
            const StatusIcon = status.icon
            const intentColor = req.intent_type
              ? INTENT_LABELS[req.intent_type as IntentType].color
              : null

            const resultLink =
              req.status === 'complete' || req.status === 'generating'
                ? `/request/${req.id}/result`
                : req.status === 'clarifying'
                ? `/request/${req.id}/clarify`
                : `/request/${req.id}/upload`

            return (
              <Link
                key={req.id}
                href={resultLink}
                className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50">
                    <FileText className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-gray-900">
                      {req.title || t('untitled')}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2">
                      {req.intent_type && intentColor && (
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${intentColor}`}>
                          {tIntents(req.intent_type as Parameters<typeof tIntents>[0])}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        {new Date(req.created_at).toLocaleDateString(locale, {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-1 text-xs font-medium ${status.color}`}>
                    <StatusIcon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{status.label}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-300" />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
