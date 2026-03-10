export type { Database, RequestStatus, IntentType, EntitySource, LetterType } from './database'

import type { Database, IntentType, EntitySource, LetterType } from './database'

// Convenience row types
export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type Request = Database['public']['Tables']['requests']['Row']
export type DocumentUpload = Database['public']['Tables']['document_uploads']['Row']
export type ExtractedEntity = Database['public']['Tables']['extracted_entities']['Row']
export type ClarificationQuestion = Database['public']['Tables']['clarification_questions']['Row']
export type GeneratedLetter = Database['public']['Tables']['generated_letters']['Row']
export type Recipient = Database['public']['Tables']['recipients_directory']['Row']
export type AttachmentChecklist = Database['public']['Tables']['attachments_checklists']['Row']
export type ActivityHistory = Database['public']['Tables']['activity_history']['Row']

// AI pipeline types
export interface ExtractedEntityInput {
  entity_type: string
  value: string | null
  confidence: number
  source: EntitySource
}

export interface QuestionInput {
  question: string
  field_key: string
  is_required: boolean
  order_index: number
}

export interface LetterContext {
  intent: IntentType
  language: string
  entities: ExtractedEntity[]
  answers: Record<string, string>
  userFullName?: string
}

export interface GeneratedLetterContent {
  postal: string
  email: string
  subject: string
}

export interface AttachmentItem {
  item_name: string
  description: string
  is_required: boolean
}

export interface NextStep {
  step: string
  deadline?: string
  important?: boolean
}

// Request with all related data
export interface RequestWithDetails extends Request {
  entities?: ExtractedEntity[]
  questions?: ClarificationQuestion[]
  letters?: GeneratedLetter[]
  uploads?: DocumentUpload[]
  recipient?: Recipient | null
  attachments?: AttachmentChecklist[]
}

// Intent display helpers
export const INTENT_LABELS: Record<IntentType, { fr: string; en: string; color: string }> = {
  terminate: { fr: 'Résiliation', en: 'Cancellation', color: 'bg-orange-100 text-orange-800' },
  contest: { fr: 'Contestation', en: 'Contest', color: 'bg-red-100 text-red-800' },
  complain: { fr: 'Réclamation', en: 'Complaint', color: 'bg-yellow-100 text-yellow-800' },
  request: { fr: 'Demande', en: 'Request', color: 'bg-blue-100 text-blue-800' },
  certify: { fr: 'Attestation', en: 'Certificate', color: 'bg-green-100 text-green-800' },
}

export const LETTER_TYPE_LABELS: Record<LetterType, { fr: string; en: string }> = {
  postal: { fr: 'Courrier postal', en: 'Postal letter' },
  email: { fr: 'Version email', en: 'Email version' },
}
