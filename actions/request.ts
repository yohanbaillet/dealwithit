'use server'

import { createClient } from '@/lib/supabase/server'
import { classifyIntent } from '@/lib/ai/classify'
import { extractEntities } from '@/lib/ai/extract'
import { generateQuestions } from '@/lib/ai/questions'
import { getTemplate } from '@/lib/templates'
import { redirect } from 'next/navigation'
import type { IntentType } from '@/types'

export async function createRequestFromText(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const rawInput = formData.get('rawInput') as string
  const language = (formData.get('language') as string) || 'fr'
  const templateKey = (formData.get('templateKey') as string) || null

  if (!rawInput?.trim()) {
    return { error: 'Veuillez décrire votre situation.' }
  }

  const template = getTemplate(templateKey)

  // Create the request
  const { data: request, error: requestError } = await supabase
    .from('requests')
    .insert({
      user_id: user.id,
      status: 'clarifying',
      intent_type: template?.intent ?? null,
      template_key: templateKey,
      raw_input: rawInput,
      language,
      title: rawInput.slice(0, 80),
    })
    .select()
    .single()

  if (requestError || !request) {
    return { error: 'Erreur lors de la création de votre demande.' }
  }

  if (template) {
    // Template path: insert fields directly — zero AI calls
    if (template.presetEntities) {
      await supabase.from('extracted_entities').insert(
        Object.entries(template.presetEntities).map(([entity_type, value]) => ({
          request_id: request.id,
          entity_type,
          value,
          confidence: 1.0,
          is_verified: true,
          source: 'user_input' as const,
        }))
      )
    }

    await supabase.from('clarification_questions').insert(
      template.fields.map((f, i) => ({
        request_id: request.id,
        question: f.question,
        field_key: f.key,
        is_required: f.required ?? true,
        order_index: i,
        answer: null,
      }))
    )
  } else {
    // Free-text path: run full AI pipeline
    const intent: IntentType = await classifyIntent(rawInput)
    const aiEntities = await extractEntities(rawInput, intent)

    await supabase
      .from('requests')
      .update({ intent_type: intent })
      .eq('id', request.id)

    if (aiEntities.length > 0) {
      await supabase.from('extracted_entities').insert(
        aiEntities.map((e) => ({ ...e, request_id: request.id }))
      )
    }

    const { data: fullEntities } = await supabase
      .from('extracted_entities')
      .select('*')
      .eq('request_id', request.id)

    const questions = await generateQuestions(fullEntities || [], intent, null)

    if (questions.length > 0) {
      await supabase.from('clarification_questions').insert(
        questions.map((q) => ({ ...q, request_id: request.id }))
      )
    }
  }

  // Log activity
  await supabase.from('activity_history').insert({
    user_id: user.id,
    request_id: request.id,
    action_type: 'request_created',
    metadata: { template_key: templateKey, source: 'text' },
  })

  redirect(`/request/${request.id}/clarify`)
}

export async function createUploadRequest() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: request, error } = await supabase
    .from('requests')
    .insert({
      user_id: user.id,
      status: 'draft',
      language: 'fr',
      title: 'Document importé',
    })
    .select()
    .single()

  if (error || !request) redirect('/login')

  redirect(`/request/${request.id}/upload`)
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
