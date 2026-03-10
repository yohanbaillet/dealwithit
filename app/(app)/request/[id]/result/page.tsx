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

interface Props {
  params: Promise<{ id: string }>
}

export default async function ResultPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return notFound()

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

  // Find recipient — auto-detect fine authority or company lookup
  const fineTypeEntity = (entities || []).find((e) => e.entity_type === 'fine_type')
  const companyEntity = (entities || []).find((e) => e.entity_type === 'company_name')

  let recipientLookupName: string | null = null
  if (fineTypeEntity?.value && request.intent_type === 'contest') {
    if (fineTypeEntity.value === 'radar') {
      recipientLookupName = 'ANTAI'
    } else if (fineTypeEntity.value === 'stationnement') {
      recipientLookupName = 'Service FPS'
    } else {
      recipientLookupName = 'Officier du Ministère Public'
    }
  } else if (companyEntity?.value) {
    recipientLookupName = companyEntity.value
  }

  let recipient = null
  if (recipientLookupName) {
    const { data: rec } = await supabase
      .from('recipients_directory')
      .select('*')
      .ilike('company_name', `%${recipientLookupName}%`)
      .limit(1)
      .single()
    recipient = rec
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
        Tableau de bord
      </Link>

      {/* Success header */}
      <div className="mb-8 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Votre lettre est prête</h1>
          <p className="mt-0.5 text-gray-500">
            Relisez, modifiez si besoin, puis téléchargez ou copiez
          </p>
        </div>
      </div>

      {/* Progress complete */}
      <div className="mb-8 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div className="h-full w-full rounded-full bg-green-500" />
      </div>

      {/* Disclaimer */}
      <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        ⚠️ Brouillon généré à partir de votre situation. <strong>Relisez attentivement avant d'envoyer.</strong>
        Ce document n'est pas un conseil juridique.
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
