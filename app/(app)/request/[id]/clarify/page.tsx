import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ClarificationForm } from '@/components/request/ClarificationForm'
import { TemplateBanner } from '@/components/request/TemplateBanner'
import { ArrowLeft } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ClarifyPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return notFound()

  const t = await getTranslations('clarify')

  const { data: request } = await supabase
    .from('requests')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!request) return notFound()

  const { data: questions } = await supabase
    .from('clarification_questions')
    .select('*')
    .eq('request_id', id)
    .order('order_index')

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {t('back')}
      </Link>

      <div className="mb-6">
        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
          {t('step')}
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <p className="mt-1 text-gray-500">{t('subtitle')}</p>
      </div>

      {/* Progress bar */}
      <div className="mb-8 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div className="h-full w-2/3 rounded-full bg-gray-900 transition-all" />
      </div>

      {/* Template banner — shows active template, allows changing */}
      <TemplateBanner
        requestId={id}
        templateKey={request.template_key ?? null}
        intentType={request.intent_type ?? null}
      />

      <ClarificationForm
        requestId={id}
        questions={questions || []}
        templateKey={request.template_key ?? null}
      />
    </div>
  )
}
