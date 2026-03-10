'use server'

import { createClient } from '@/lib/supabase/server'
import { classifyIntent } from '@/lib/ai/classify'
import { extractEntities } from '@/lib/ai/extract'
import { generateQuestions } from '@/lib/ai/questions'
import { redirect } from 'next/navigation'

export async function createRequestFromText(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const rawInput = formData.get('rawInput') as string
  const language = (formData.get('language') as string) || 'fr'

  if (!rawInput?.trim()) {
    return { error: 'Veuillez décrire votre situation.' }
  }

  // Classify + extract in parallel
  const [intent, entities] = await Promise.all([
    classifyIntent(rawInput),
    classifyIntent(rawInput).then((i) => extractEntities(rawInput, i)),
  ])

  // Create the request
  const { data: request, error: requestError } = await supabase
    .from('requests')
    .insert({
      user_id: user.id,
      status: 'clarifying',
      intent_type: intent,
      raw_input: rawInput,
      language,
      title: rawInput.slice(0, 80),
    })
    .select()
    .single()

  if (requestError || !request) {
    return { error: 'Erreur lors de la création de votre demande.' }
  }

  // Save extracted entities
  if (entities.length > 0) {
    await supabase.from('extracted_entities').insert(
      entities.map((e) => ({ ...e, request_id: request.id }))
    )
  }

  // Generate clarification questions
  const fullEntities = await supabase
    .from('extracted_entities')
    .select('*')
    .eq('request_id', request.id)

  const questions = await generateQuestions(fullEntities.data || [], intent)

  if (questions.length > 0) {
    await supabase.from('clarification_questions').insert(
      questions.map((q) => ({ ...q, request_id: request.id }))
    )
  }

  // Log activity
  await supabase.from('activity_history').insert({
    user_id: user.id,
    request_id: request.id,
    action_type: 'request_created',
    metadata: { intent, source: 'text' },
  })

  redirect(`/request/${request.id}/clarify`)
}

export async function updateRequestTitle(requestId: string, title: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('requests')
    .update({ title })
    .eq('id', requestId)
    .eq('user_id', user.id)

  return { error: error?.message }
}

export async function deleteRequest(requestId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('requests')
    .delete()
    .eq('id', requestId)
    .eq('user_id', user.id)

  return { error: error?.message }
}
