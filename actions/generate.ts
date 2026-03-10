'use server'

import { createClient } from '@/lib/supabase/server'
import { generateLetter, getAttachmentChecklist, getNextSteps } from '@/lib/ai/generate'
import type { LetterContext } from '@/types'
import { getLocale } from 'next-intl/server'

export async function runGenerationPipeline(requestId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Fetch full request data
  const { data: request } = await supabase
    .from('requests')
    .select('*')
    .eq('id', requestId)
    .eq('user_id', user.id)
    .single()

  if (!request || !request.intent_type) return { error: 'Demande introuvable.' }

  // Fetch entities
  const { data: entities } = await supabase
    .from('extracted_entities')
    .select('*')
    .eq('request_id', requestId)

  // Fetch answered questions
  const { data: questions } = await supabase
    .from('clarification_questions')
    .select('*')
    .eq('request_id', requestId)

  const answers: Record<string, string> = {}
  for (const q of questions || []) {
    if (q.answer) answers[q.field_key] = q.answer
  }

  const locale = await getLocale()

  const ctx: LetterContext = {
    intent: request.intent_type,
    language: locale,
    entities: entities || [],
    answers,
  }

  // Check if letter already generated (avoid re-generation)
  const { data: existing } = await supabase
    .from('generated_letters')
    .select('id')
    .eq('request_id', requestId)
    .limit(1)

  if (existing && existing.length > 0) {
    return { success: true, alreadyGenerated: true }
  }

  // Generate letter
  const { postal, email, subject } = await generateLetter(ctx)

  // Save both versions
  await supabase.from('generated_letters').insert([
    { request_id: requestId, letter_type: 'postal', content: postal, subject, language: request.language, version: 1 },
    { request_id: requestId, letter_type: 'email', content: email, subject, language: request.language, version: 1 },
  ])

  // Find recipient from directory
  const companyName = answers.company_name || (entities || []).find((e) => e.entity_type === 'company_name')?.value
  if (companyName) {
    await supabase
      .from('requests')
      .update({ status: 'complete' })
      .eq('id', requestId)
  }

  // Build attachment checklist
  const fineType = (entities || []).find((e) => e.entity_type === 'fine_type')?.value || null
  const checklistItems = getAttachmentChecklist(request.intent_type, companyName, fineType)
  const { data: existingChecklist } = await supabase
    .from('attachments_checklists')
    .select('id')
    .eq('request_id', requestId)
    .limit(1)

  if (!existingChecklist || existingChecklist.length === 0) {
    await supabase.from('attachments_checklists').insert(
      checklistItems.map((item) => ({ ...item, request_id: requestId }))
    )
  }

  await supabase
    .from('requests')
    .update({ status: 'complete' })
    .eq('id', requestId)

  await supabase.from('activity_history').insert({
    user_id: user.id,
    request_id: requestId,
    action_type: 'letter_generated',
    metadata: { intent: request.intent_type },
  })

  return { success: true }
}

export async function regenerateLetter(requestId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Delete existing letters so pipeline runs fresh
  await supabase.from('generated_letters').delete().eq('request_id', requestId)

  return runGenerationPipeline(requestId)
}

export async function updateLetterContent(letterId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('generated_letters')
    .update({ content, is_final: true })
    .eq('id', letterId)

  return { error: error?.message }
}
