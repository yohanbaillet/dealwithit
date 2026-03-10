'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getTemplate } from '@/lib/templates'

export async function submitAnswers(requestId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: request } = await supabase
    .from('requests')
    .select('id, user_id')
    .eq('id', requestId)
    .eq('user_id', user.id)
    .single()

  if (!request) return { error: 'Demande introuvable.' }

  const { data: questions } = await supabase
    .from('clarification_questions')
    .select('*')
    .eq('request_id', requestId)

  if (!questions) return { error: 'Questions introuvables.' }

  const updates = questions.map((q) => {
    const answer = formData.get(q.field_key) as string | null
    return supabase
      .from('clarification_questions')
      .update({ answer: answer || null })
      .eq('id', q.id)
  })

  await Promise.all(updates)

  for (const q of questions) {
    const answer = formData.get(q.field_key) as string | null
    if (answer) {
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

// Called from TemplateBanner when user changes template on the clarify page
export async function changeRequestTemplate(requestId: string, templateKey: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non autorisé.' }

  const { data: request } = await supabase
    .from('requests')
    .select('id, user_id, template_key, intent_type')
    .eq('id', requestId)
    .eq('user_id', user.id)
    .single()

  if (!request) return { error: 'Demande introuvable.' }

  const template = getTemplate(templateKey)
  if (!template) return { error: 'Modèle inconnu.' }

  // Save current answers to re-apply on matching field keys after regeneration
  const { data: oldQuestions } = await supabase
    .from('clarification_questions')
    .select('field_key, answer')
    .eq('request_id', requestId)

  const savedAnswers = new Map((oldQuestions || []).map((q) => [q.field_key, q.answer]))

  // Delete old questions
  await supabase
    .from('clarification_questions')
    .delete()
    .eq('request_id', requestId)

  // Remove preset entities from previous template to avoid conflicts
  const prevTemplate = getTemplate(request.template_key)
  if (prevTemplate?.presetEntities) {
    const prevKeys = Object.keys(prevTemplate.presetEntities)
    if (prevKeys.length > 0) {
      await supabase
        .from('extracted_entities')
        .delete()
        .eq('request_id', requestId)
        .in('entity_type', prevKeys)
    }
  }

  // Insert preset entities for new template
  if (template.presetEntities) {
    const rows = Object.entries(template.presetEntities).map(([entity_type, value]) => ({
      request_id: requestId,
      entity_type,
      value,
      confidence: 1.0,
      is_verified: true,
      source: 'user_input' as const,
    }))
    await supabase.from('extracted_entities').insert(rows)
  }

  // Update request
  await supabase
    .from('requests')
    .update({ intent_type: template.intent, template_key: templateKey, status: 'clarifying' })
    .eq('id', requestId)

  // Insert new template's fields directly — zero AI calls
  await supabase.from('clarification_questions').insert(
    template.fields.map((f, i) => ({
      request_id: requestId,
      question: f.question,
      field_key: f.key,
      is_required: f.required ?? true,
      order_index: i,
      answer: savedAnswers.get(f.key) ?? null,
    }))
  )

  revalidatePath(`/request/${requestId}/clarify`)
  return { success: true }
}
