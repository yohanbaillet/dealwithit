import type { IntentType, ExtractedEntity, QuestionInput } from '@/types'

// TODO: replace with Claude API call
// Ask Claude which questions are still needed given current entities
export async function generateQuestions(
  entities: ExtractedEntity[],
  intent: IntentType,
): Promise<QuestionInput[]> {
  await new Promise((r) => setTimeout(r, 400))

  const questions: QuestionInput[] = []
  const entityMap = new Map(entities.map((e) => [e.entity_type, e]))

  // Helper: resolve question text
  const q = (_fieldKey: string, defaultText: string): string => defaultText

  let index = 0

  // Always need sender info
  questions.push({
    question: q('sender_name', 'Quel est votre nom complet ?'),
    field_key: 'sender_name',
    is_required: true,
    order_index: index++,
  })

  questions.push({
    question: q('sender_address', 'Quelle est votre adresse postale complète ?'),
    field_key: 'sender_address',
    is_required: true,
    order_index: index++,
  })

  // For fine contestation: skip company + contract questions entirely
  const fineType = entityMap.get('fine_type')
  const isFineContest = intent === 'contest' && fineType?.value

  if (!isFineContest) {
    // Company not found
    const company = entityMap.get('company_name')
    if (!company || !company.value || company.confidence < 0.5) {
      questions.push({
        question: q('company_name', 'Quel est le nom de l\'entreprise ou du service concerné ?'),
        field_key: 'company_name',
        is_required: true,
        order_index: index++,
      })
    }

    // Contract number missing
    if (!entityMap.has('contract_number')) {
      questions.push({
        question: q('contract_number', 'Avez-vous un numéro de contrat, d\'abonnement ou de référence client ?'),
        field_key: 'contract_number',
        is_required: false,
        order_index: index++,
      })
    }
  }

  // Intent-specific questions
  if (intent === 'terminate') {
    if (!entityMap.get('termination_date')?.value) {
      questions.push({
        question: q('termination_date', 'À quelle date souhaitez-vous que la résiliation prenne effet ?'),
        field_key: 'termination_date',
        is_required: true,
        order_index: index++,
      })
    }

    const reason = entityMap.get('notice_reason')
    if (!reason?.value) {
      questions.push({
        question: q('termination_reason', 'Quelle est la raison principale de votre résiliation ? (optionnel)'),
        field_key: 'termination_reason',
        is_required: false,
        order_index: index++,
      })
    }
  }

  if (intent === 'contest') {
    if (isFineContest) {
      // Fine contestation — specific questions
      if (!entityMap.get('fine_reference')?.value) {
        questions.push({
          question: 'Quel est le numéro de l\'avis de contravention ? (indiqué en haut de l\'avis reçu)',
          field_key: 'fine_reference',
          is_required: true,
          order_index: index++,
        })
      }

      if (!entityMap.get('offense_date')?.value) {
        questions.push({
          question: 'Quelle est la date de l\'infraction ou de l\'avis (indiquée sur le document) ?',
          field_key: 'offense_date',
          is_required: true,
          order_index: index++,
        })
      }

      if (!entityMap.get('vehicle_plate')?.value) {
        questions.push({
          question: 'Quel est le numéro d\'immatriculation du véhicule concerné ?',
          field_key: 'vehicle_plate',
          is_required: fineType?.value !== 'stationnement',
          order_index: index++,
        })
      }

      if (!entityMap.get('offense_city')?.value) {
        questions.push({
          question: 'Dans quelle ville ou commune l\'infraction a-t-elle eu lieu ?',
          field_key: 'offense_city',
          is_required: true,
          order_index: index++,
        })
      }

      if (!entityMap.get('contest_reason')?.value) {
        questions.push({
          question: 'Sur quoi porte votre contestation ? (ex: ce n\'était pas moi, erreur sur la plaque, absence de signalisation, stationnement autorisé...)',
          field_key: 'contest_reason',
          is_required: true,
          order_index: index++,
        })
      }

      if (!entityMap.get('fine_amount')?.value) {
        questions.push({
          question: 'Quel est le montant de l\'amende indiqué sur l\'avis ?',
          field_key: 'fine_amount',
          is_required: false,
          order_index: index++,
        })
      }
    } else {
      // Generic contestation (bill, charge dispute, etc.)
      if (!entityMap.get('contest_reason')?.value) {
        questions.push({
          question: q('contest_reason', 'Sur quoi portent vos contestations ? Expliquez brièvement.'),
          field_key: 'contest_reason',
          is_required: true,
          order_index: index++,
        })
      }

      if (!entityMap.get('fine_amount')?.value) {
        questions.push({
          question: q('fine_amount', 'Quel est le montant contesté (si applicable) ?'),
          field_key: 'fine_amount',
          is_required: false,
          order_index: index++,
        })
      }
    }
  }

  if (intent === 'complain') {
    questions.push({
      question: q('complaint_description', 'Décrivez le problème rencontré et la date à laquelle il s\'est produit.'),
      field_key: 'complaint_description',
      is_required: true,
      order_index: index++,
    })

    questions.push({
      question: q('expected_resolution', 'Quelle solution ou compensation attendez-vous ?'),
      field_key: 'expected_resolution',
      is_required: false,
      order_index: index++,
    })
  }

  if (intent === 'certify') {
    questions.push({
      question: q('certificate_type', 'Quel type d\'attestation souhaitez-vous ? (ex: attestation sur l\'honneur, de résidence, etc.)'),
      field_key: 'certificate_type',
      is_required: true,
      order_index: index++,
    })
  }

  if (intent === 'request') {
    questions.push({
      question: q('request_details', 'Que demandez-vous exactement ? Soyez précis.'),
      field_key: 'request_details',
      is_required: true,
      order_index: index++,
    })
  }

  return questions
}
