import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { runGenerationPipeline } from '@/actions/generate'
import { LetterPreview } from '@/components/letter/LetterPreview'
import { RecipientCard } from '@/components/letter/RecipientCard'
import { AttachmentChecklist } from '@/components/letter/AttachmentChecklist'
import { NextStepsCard } from '@/components/letter/NextStepsCard'
import { getNextSteps } from '@/lib/ai/generate'
import Link from 'next/link'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ResultPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return notFound()

  const t = await getTranslations('result')

  const { data: request } = await supabase
    .from('requests')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!request) return notFound()

  // Run generation pipeline if not done yet
  await runGenerationPipeline(id)

  const [
    { data: letters },
    { data: entities },
    { data: checklists },
  ] = await Promise.all([
    supabase.from('generated_letters').select('*').eq('request_id', id).order('created_at'),
    supabase.from('extracted_entities').select('*').eq('request_id', id),
    supabase.from('attachments_checklists').select('*').eq('request_id', id),
  ])

  // Find recipient from companies + company_contacts
  const fineTypeEntity = (entities || []).find((e) => e.entity_type === 'fine_type')
  const companyEntity = (entities || []).find((e) => e.entity_type === 'company_name')

  // Prefer the clarification answer (user-confirmed) over extracted entity
  const { data: clarifyAnswers } = await supabase
    .from('clarification_questions')
    .select('field_key, answer')
    .eq('request_id', id)
  const companyAnswer = clarifyAnswers?.find((q) => q.field_key === 'company_name')?.answer

  const companyNameRaw = companyAnswer || companyEntity?.value || null

  let recipient: {
    company_name: string
    category: string | null
    website: string | null
    postal_address: string | null
    email: string | null
  } | null = null

  if (companyNameRaw) {
    const normalized = companyNameRaw.toLowerCase().trim()
    const { data: company } = await supabase
      .from('companies')
      .select('id, name, category, website')
      .or(`normalized_name.eq.${normalized},normalized_name.ilike.%${normalized}%`)
      .eq('is_active', true)
      .limit(1)
      .maybeSingle()

    if (company) {
      // Prefer contact matching the request intent, fall back to generic (null)
      const { data: specificContact } = await supabase
        .from('company_contacts')
        .select('postal_address, email')
        .eq('company_id', company.id)
        .eq('intent_type', request.intent_type ?? '')
        .maybeSingle()

      const contact = specificContact ?? await (async () => {
        const { data } = await supabase
          .from('company_contacts')
          .select('postal_address, email')
          .eq('company_id', company.id)
          .is('intent_type', null)
          .maybeSingle()
        return data
      })()

      recipient = {
        company_name: company.name,
        category: company.category,
        website: company.website,
        postal_address: contact?.postal_address ?? null,
        email: contact?.email ?? null,
      }
    }
  }

  const fineType = fineTypeEntity?.value || null
  const postalLetter = letters?.find((l) => l.letter_type === 'postal')
  const emailLetter = letters?.find((l) => l.letter_type === 'email')
  const nextSteps = request.intent_type ? getNextSteps(request.intent_type, fineType) : []

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link
        href="/dashboard"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {t('back')}
      </Link>

      {/* Success header */}
      <div className="mb-8 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
          <p className="mt-0.5 text-gray-500">{t('subtitle')}</p>
        </div>
      </div>

      {/* Progress complete */}
      <div className="mb-8 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div className="h-full w-full rounded-full bg-green-500" />
      </div>

      {/* Disclaimer */}
      <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        ⚠️ {t('disclaimerText')} <strong>{t('disclaimerBold')}</strong>{' '}
        {t('disclaimerLegal')}
      </div>

      <div className="space-y-6">
        {/* Letter preview */}
        {postalLetter && emailLetter && (
          <LetterPreview
            requestId={id}
            postalLetter={postalLetter}
            emailLetter={emailLetter}
          />
        )}

        {/* Recipient */}
        {recipient && <RecipientCard recipient={recipient} />}

        {/* Attachment checklist */}
        {checklists && checklists.length > 0 && (
          <AttachmentChecklist items={checklists} />
        )}

        {/* Next steps */}
        {nextSteps.length > 0 && <NextStepsCard steps={nextSteps} />}
      </div>
    </div>
  )
}
