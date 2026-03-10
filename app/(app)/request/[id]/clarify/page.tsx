import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ClarificationForm } from '@/components/request/ClarificationForm'
import { IntentSummary } from '@/components/request/IntentSummary'
import { ArrowLeft } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ClarifyPage({ params }: Props) {
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

  const [{ data: entities }, { data: questions }] = await Promise.all([
    supabase.from('extracted_entities').select('*').eq('request_id', id),
    supabase
      .from('clarification_questions')
      .select('*')
      .eq('request_id', id)
      .order('order_index'),
  ])

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link
        href="/request/new"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Retour
      </Link>

      <div className="mb-6">
        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
          Étape 2 sur 3
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Vérifiez les informations</h1>
        <p className="mt-1 text-gray-500">
          On a extrait ce qu'on a pu — complétez les champs manquants
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-8 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div className="h-full w-2/3 rounded-full bg-gray-900 transition-all" />
      </div>

      {request.intent_type && (
        <IntentSummary
          intent={request.intent_type}
          entities={entities || []}
          rawInput={request.raw_input}
        />
      )}

      <ClarificationForm
        requestId={id}
        questions={questions || []}
      />
    </div>
  )
}
