import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, FileText } from 'lucide-react'
import type { RequestStatus } from '@/types'
import { getTranslations, getLocale } from 'next-intl/server'
import { RequestList } from '@/components/dashboard/RequestList'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return notFound()

  const [t, locale] = await Promise.all([
    getTranslations('dashboard'),
    getLocale(),
  ])

  const statusLabels: Record<RequestStatus, string> = {
    draft: t('status.draft'),
    clarifying: t('status.clarifying'),
    generating: t('status.generating'),
    complete: t('status.complete'),
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
        <RequestList
          requests={requests}
          locale={locale}
          statusLabels={statusLabels}
          untitled={t('untitled')}
        />
      )}
    </div>
  )
}
