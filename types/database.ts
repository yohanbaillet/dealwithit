export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type RequestStatus = 'draft' | 'clarifying' | 'generating' | 'complete'
export type IntentType = 'terminate' | 'contest' | 'complain' | 'request' | 'certify'
export type EntitySource = 'user_input' | 'ocr' | 'ai_extraction'
export type LetterType = 'postal' | 'email'

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string | null
          preferred_language: string
          country: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name?: string | null
          preferred_language?: string
          country?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          full_name?: string | null
          preferred_language?: string
          country?: string
          updated_at?: string
        }
      }
      requests: {
        Row: {
          id: string
          user_id: string
          status: RequestStatus
          intent_type: IntentType | null
          template_key: string | null
          raw_input: string | null
          title: string | null
          language: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status?: RequestStatus
          intent_type?: IntentType | null
          template_key?: string | null
          raw_input?: string | null
          title?: string | null
          language?: string
        }
        Update: {
          status?: RequestStatus
          intent_type?: IntentType | null
          template_key?: string | null
          raw_input?: string | null
          title?: string | null
          language?: string
          updated_at?: string
        }
      }
      document_uploads: {
        Row: {
          id: string
          request_id: string
          user_id: string
          file_path: string
          file_name: string | null
          file_type: string | null
          ocr_text: string | null
          created_at: string
        }
        Insert: {
          id?: string
          request_id: string
          user_id: string
          file_path: string
          file_name?: string | null
          file_type?: string | null
          ocr_text?: string | null
        }
        Update: {
          ocr_text?: string | null
        }
      }
      extracted_entities: {
        Row: {
          id: string
          request_id: string
          entity_type: string
          value: string | null
          confidence: number
          is_verified: boolean
          source: EntitySource
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          request_id: string
          entity_type: string
          value?: string | null
          confidence?: number
          is_verified?: boolean
          source?: EntitySource
        }
        Update: {
          value?: string | null
          confidence?: number
          is_verified?: boolean
          updated_at?: string
        }
      }
      clarification_questions: {
        Row: {
          id: string
          request_id: string
          question: string
          answer: string | null
          field_key: string
          is_required: boolean
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          request_id: string
          question: string
          answer?: string | null
          field_key: string
          is_required?: boolean
          order_index?: number
        }
        Update: {
          answer?: string | null
          updated_at?: string
        }
      }
      generated_letters: {
        Row: {
          id: string
          request_id: string
          letter_type: LetterType
          content: string
          subject: string | null
          language: string
          version: number
          is_final: boolean
          pdf_path: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          request_id: string
          letter_type?: LetterType
          content: string
          subject?: string | null
          language?: string
          version?: number
          is_final?: boolean
          pdf_path?: string | null
        }
        Update: {
          content?: string
          subject?: string | null
          is_final?: boolean
          pdf_path?: string | null
          updated_at?: string
        }
      }
      recipients_directory: {
        Row: {
          id: string
          company_name: string
          aliases: string[] | null
          country: string | null
          postal_address: string | null
          email: string | null
          website: string | null
          category: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_name: string
          aliases?: string[] | null
          country?: string | null
          postal_address?: string | null
          email?: string | null
          website?: string | null
          category?: string | null
        }
        Update: never
      }
      attachments_checklists: {
        Row: {
          id: string
          request_id: string
          item_name: string
          description: string | null
          is_required: boolean
          is_provided: boolean
          created_at: string
        }
        Insert: {
          id?: string
          request_id: string
          item_name: string
          description?: string | null
          is_required?: boolean
          is_provided?: boolean
        }
        Update: {
          is_provided?: boolean
        }
      }
      activity_history: {
        Row: {
          id: string
          user_id: string
          request_id: string | null
          action_type: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          request_id?: string | null
          action_type: string
          metadata?: Json | null
        }
        Update: never
      }
      billing_plans: {
        Row: {
          id: string
          user_id: string
          plan: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          letters_used: number
          letters_limit: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan?: string
        }
        Update: {
          plan?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          letters_used?: number
          letters_limit?: number
        }
      }
    }
  }
}
