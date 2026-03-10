'use server'

import { createClient } from '@/lib/supabase/server'
import { classifyIntent } from '@/lib/ai/classify'
import { generateQuestions } from '@/lib/ai/questions'
import { extractFromDocument } from '@/lib/ai/vision'
import type { IntentType, ExtractedEntityInput } from '@/types'
import { redirect } from 'next/navigation'

// Convert Claude's entity map to the DB insert format
function entitiesToInsertRows(
  entityMap: Record<string, string | null>
): ExtractedEntityInput[] {
  return Object.entries(entityMap)
    .filter(([, value]) => value !== null && value !== undefined)
    .map(([entity_type, value]) => ({
      entity_type,
      value: value as string,
      confidence: 0.92,
      source: 'ocr' as const,
    }))
}

export async function uploadDocumentAndProcess(
  requestId: string,
  formData: FormData,
  intentOverride?: IntentType
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const file = formData.get('file') as File
  if (!file) return { error: 'Aucun fichier fourni.' }

  // Upload to Supabase Storage
  const filePath = `${user.id}/${requestId}/${Date.now()}_${file.name}`
  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(filePath, file)

  if (uploadError) {
    console.error('[upload] storage error:', uploadError.message)
    return { error: `Erreur lors du téléversement : ${uploadError.message}` }
  }

  // Real extraction via Claude vision
  const extracted = await extractFromDocument(file)
  const ocrText = extracted.rawText

  // Save document record
  await supabase.from('document_uploads').insert({
    request_id: requestId,
    user_id: user.id,
    file_path: filePath,
    file_name: file.name,
    file_type: file.type,
    ocr_text: ocrText,
  })

  const intent = intentOverride ?? extracted.detectedIntent ?? (await classifyIntent(ocrText))
  const entities = entitiesToInsertRows(extracted.entities)

  await supabase.from('requests').update({
    status: 'clarifying',
    intent_type: intent,
    raw_input: ocrText,
  }).eq('id', requestId)

  if (entities.length > 0) {
    await supabase.from('extracted_entities').insert(
      entities.map((e) => ({ ...e, request_id: requestId }))
    )
  }

  const fullEntities = await supabase
    .from('extracted_entities')
    .select('*')
    .eq('request_id', requestId)

  const questions = await generateQuestions(fullEntities.data || [], intent)
  if (questions.length > 0) {
    await supabase.from('clarification_questions').insert(
      questions.map((q) => ({ ...q, request_id: requestId }))
    )
  }

  return { success: true, ocrText, intent }
}

export async function createRequestForUpload(language = 'fr') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: request, error } = await supabase
    .from('requests')
    .insert({
      user_id: user.id,
      status: 'draft',
      language,
      title: 'Document importé',
    })
    .select()
    .single()

  if (error || !request) return { error: 'Erreur lors de la création.' }

  return { requestId: request.id }
}

export async function createRequestFromUpload(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const file = formData.get('file') as File
  const language = (formData.get('language') as string) || 'fr'

  if (!file || file.size === 0) return { error: 'Aucun fichier fourni.' }

  // Create request record (need ID for storage path)
  const { data: request, error: requestError } = await supabase
    .from('requests')
    .insert({
      user_id: user.id,
      status: 'clarifying',
      language,
      title: file.name.slice(0, 80),
    })
    .select()
    .single()

  if (requestError || !request) return { error: 'Erreur lors de la création de votre demande.' }

  // Upload file to Supabase Storage
  const filePath = `${user.id}/${request.id}/${Date.now()}_${file.name}`
  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(filePath, file)

  if (uploadError) return { error: 'Erreur lors du téléversement du fichier.' }

  // Real extraction via Claude vision
  const extracted = await extractFromDocument(file)
  const ocrText = extracted.rawText

  // Save document record
  await supabase.from('document_uploads').insert({
    request_id: request.id,
    user_id: user.id,
    file_path: filePath,
    file_name: file.name,
    file_type: file.type,
    ocr_text: ocrText,
  })

  // Use Claude's detected intent, fall back to mock classifier
  const intent = extracted.detectedIntent ?? (await classifyIntent(ocrText))
  const entities = entitiesToInsertRows(extracted.entities)

  // Update request with detected intent
  await supabase
    .from('requests')
    .update({ intent_type: intent, raw_input: ocrText, title: ocrText.slice(0, 80) })
    .eq('id', request.id)

  // Save extracted entities
  if (entities.length > 0) {
    await supabase.from('extracted_entities').insert(
      entities.map((e) => ({ ...e, request_id: request.id }))
    )
  }

  // Build lookup for pre-filling question answers
  const entityValueMap = new Map(entities.map((e) => [e.entity_type, e.value as string]))

  // Generate questions
  const { data: fullEntities } = await supabase
    .from('extracted_entities')
    .select('*')
    .eq('request_id', request.id)

  const questions = await generateQuestions(fullEntities || [], intent)

  if (questions.length > 0) {
    await supabase.from('clarification_questions').insert(
      questions.map((q) => ({
        ...q,
        request_id: request.id,
        answer: entityValueMap.get(q.field_key) ?? null,
      }))
    )
  }

  // Log activity
  await supabase.from('activity_history').insert({
    user_id: user.id,
    request_id: request.id,
    action_type: 'request_created',
    metadata: { intent, source: 'upload' },
  })

  redirect(`/request/${request.id}/clarify`)
}

// Called from the clarify page: upload a photo and return extracted field values
// so the client can auto-fill the form without a page reload.
export async function extractFromDocumentForClarify(
  requestId: string,
  formData: FormData
): Promise<{ error: string } | { extractedValues: Record<string, string> }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non autorisé.' }

  // Verify the request belongs to this user
  const { data: request } = await supabase
    .from('requests')
    .select('intent_type')
    .eq('id', requestId)
    .eq('user_id', user.id)
    .single()

  if (!request) return { error: 'Demande introuvable.' }

  const file = formData.get('file') as File
  if (!file || file.size === 0) return { error: 'Aucun fichier fourni.' }

  // Upload file to storage
  const filePath = `${user.id}/${requestId}/${Date.now()}_${file.name}`
  await supabase.storage.from('documents').upload(filePath, file)

  // Real extraction via Claude vision
  const extracted = await extractFromDocument(file)
  const ocrText = extracted.rawText

  // Save document record
  await supabase.from('document_uploads').insert({
    request_id: requestId,
    user_id: user.id,
    file_path: filePath,
    file_name: file.name,
    file_type: file.type,
    ocr_text: ocrText,
  })

  const entities = entitiesToInsertRows(extracted.entities)

  // Upsert entities (replace same types)
  const entityTypes = entities.map((e) => e.entity_type)
  if (entityTypes.length > 0) {
    await supabase
      .from('extracted_entities')
      .delete()
      .eq('request_id', requestId)
      .in('entity_type', entityTypes)
  }

  if (entities.length > 0) {
    await supabase.from('extracted_entities').insert(
      entities.map((e) => ({ ...e, request_id: requestId }))
    )
  }

  // Build extracted values map
  const extractedValues: Record<string, string> = {}
  for (const e of entities) {
    if (e.value) extractedValues[e.entity_type] = e.value as string
  }

  // Persist pre-filled answers on existing questions
  const { data: questions } = await supabase
    .from('clarification_questions')
    .select('id, field_key')
    .eq('request_id', requestId)

  for (const q of questions || []) {
    const value = extractedValues[q.field_key]
    if (value) {
      await supabase
        .from('clarification_questions')
        .update({ answer: value })
        .eq('id', q.id)
    }
  }

  return { extractedValues }
}
