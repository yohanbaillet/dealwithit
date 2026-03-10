'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function submitAnswers(requestId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verify ownership
  const { data: request } = await supabase
    .from('requests')
    .select('id, user_id')
    .eq('id', requestId)
    .eq('user_id', user.id)
    .single()

  if (!request) return { error: 'Demande introuvable.' }

  // Get all questions for this request
  const { data: questions } = await supabase
    .from('clarification_questions')
    .select('*')
    .eq('request_id', requestId)

  if (!questions) return { error: 'Questions introuvables.' }

  // Update each answer
  const updates = questions.map((q) => {
    const answer = formData.get(q.field_key) as string | null
    return supabase
      .from('clarification_questions')
      .update({ answer: answer || null })
      .eq('id', q.id)
  })

  await Promise.all(updates)

  // Update entity values from answers (mark as verified)
  for (const q of questions) {
    const answer = formData.get(q.field_key) as string | null
    if (answer) {
      // Upsert entity as user-verified
      const { data: existing } = await supabase
        .from('extracted_entities')
        .select('id')
        .eq('request_id', requestId)
        .eq('entity_type', q.field_key)
        .single()

      if (existing) {
        await supabase
          .from('extracted_entities')
          .update({ value: answer, is_verified: true, confidence: 1.0, source: 'user_input' })
          .eq('id', existing.id)
      } else {
        await supabase.from('extracted_entities').insert({
          request_id: requestId,
          entity_type: q.field_key,
          value: answer,
          confidence: 1.0,
          is_verified: true,
          source: 'user_input',
        })
      }
    }
  }

  // Move request to generating state
  await supabase
    .from('requests')
    .update({ status: 'generating' })
    .eq('id', requestId)

  redirect(`/request/${requestId}/result`)
}

export async function updateEntityValue(entityId: string, value: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('extracted_entities')
    .update({ value, is_verified: true, source: 'user_input' })
    .eq('id', entityId)

  return { error: error?.message }
}
