import type { IntentType, ExtractedEntityInput } from '@/types'

// TODO: replace with Claude API call
// Send text + intent to Claude, get structured entities back
export async function extractEntities(
  text: string,
  intent: IntentType
): Promise<ExtractedEntityInput[]> {
  await new Promise((r) => setTimeout(r, 800))

  const entities: ExtractedEntityInput[] = []
  const lower = text.toLowerCase()

  // Extract company name (simple heuristic for mock)
  const companyPatterns = [
    { pattern: /basic.?fit/i, name: 'Basic-Fit' },
    { pattern: /fitness park/i, name: 'Fitness Park' },
    { pattern: /neoness/i, name: 'Neoness' },
    { pattern: /orange/i, name: 'Orange' },
    { pattern: /sfr/i, name: 'SFR' },
    { pattern: /free\b/i, name: 'Free' },
    { pattern: /bouygues/i, name: 'Bouygues Telecom' },
    { pattern: /edf/i, name: 'EDF' },
    { pattern: /engie/i, name: 'Engie' },
    { pattern: /axa/i, name: 'AXA' },
    { pattern: /maif/i, name: 'MAIF' },
    { pattern: /netflix/i, name: 'Netflix' },
    { pattern: /canal\+?/i, name: 'Canal+' },
    { pattern: /bnp/i, name: 'BNP Paribas' },
  ]

  for (const { pattern, name } of companyPatterns) {
    if (pattern.test(text)) {
      entities.push({
        entity_type: 'company_name',
        value: name,
        confidence: 0.92,
        source: 'ai_extraction',
      })
      break
    }
  }

  if (entities.length === 0) {
    entities.push({
      entity_type: 'company_name',
      value: null,
      confidence: 0.1,
      source: 'ai_extraction',
    })
  }

  // Extract contract/membership number
  const contractMatch = text.match(/(?:contrat|numéro|référence|contract|number|ref)[^\d]*(\d{4,})/i)
  if (contractMatch) {
    entities.push({
      entity_type: 'contract_number',
      value: contractMatch[1],
      confidence: 0.88,
      source: 'ai_extraction',
    })
  }

  // Extract date
  const dateMatch = text.match(/\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})\b/)
  if (dateMatch) {
    entities.push({
      entity_type: 'termination_date',
      value: dateMatch[1],
      confidence: 0.75,
      source: 'ai_extraction',
    })
  }

  // Sender name — patterns from French documents: "Titulaire:", "Client:", "Abonné:", "Nom:"
  const senderNameMatch = text.match(
    /(?:titulaire|client|abonné|nom)\s*:?\s*([A-ZÀ-Ÿ][a-zà-ÿ\-]+(?:\s+[A-ZÀ-Ÿ][a-zà-ÿ\-]+)+)/i
  )
  if (senderNameMatch) {
    entities.push({
      entity_type: 'sender_name',
      value: senderNameMatch[1].trim(),
      confidence: 0.82,
      source: 'ai_extraction',
    })
  }

  // Sender address — look for "Adresse:" followed by street + postal code
  const senderAddressMatch = text.match(
    /(?:adresse|domicile)\s*:?\s*([^\n]+(?:,\s*\d{5}[^\n]*|\d{5}[^\n]*))/i
  )
  if (senderAddressMatch) {
    entities.push({
      entity_type: 'sender_address',
      value: senderAddressMatch[1].trim(),
      confidence: 0.78,
      source: 'ai_extraction',
    })
  }

  // Intent-specific fields
  if (intent === 'terminate') {
    entities.push({
      entity_type: 'notice_reason',
      value: lower.includes('déménag') ? 'Déménagement' :
             lower.includes('prix') || lower.includes('tarif') ? 'Motif financier' :
             null,
      confidence: 0.6,
      source: 'ai_extraction',
    })
  }

  if (intent === 'contest') {
    // Detect whether this is a fine/amende contestation
    const isFine = /amende|contravention|\bpv\b|procès.verbal|radar|vitesse|stationnement|\bfps\b|forfait post/i.test(text)

    if (isFine) {
      // Determine fine sub-type
      let fineType = 'contravention'
      if (/radar|vitesse|excès de vitesse|antai/i.test(lower)) {
        fineType = 'radar'
      } else if (/stationnement|parking|\bfps\b|forfait post/i.test(lower)) {
        fineType = 'stationnement'
      }

      entities.push({
        entity_type: 'fine_type',
        value: fineType,
        confidence: 0.88,
        source: 'ai_extraction',
      })

      // Override company_name — fines don't involve a company
      const compIdx = entities.findIndex((e) => e.entity_type === 'company_name')
      const nullCompany = { entity_type: 'company_name', value: null, confidence: 0.0, source: 'ai_extraction' as const }
      if (compIdx >= 0) entities[compIdx] = nullCompany
      else entities.push(nullCompany)

      // Extract fine reference number (avis de contravention)
      const fineRefMatch =
        text.match(/(?:n°|numéro|numero|avis|référence|reference|contravention)[^:\d\n]*:?\s*([A-Z0-9][A-Z0-9\-]{5,17})/i) ||
        text.match(/\b(\d{2}[-\s]\d{2,3}[-\s]\d{6,12})\b/) ||
        text.match(/\b(FPS[A-Z0-9]{5,15})\b/i)
      if (fineRefMatch) {
        entities.push({
          entity_type: 'fine_reference',
          value: fineRefMatch[1].trim().toUpperCase(),
          confidence: 0.88,
          source: 'ai_extraction',
        })
      }

      // Extract vehicle plate (French format: AB-123-CD, or old format: 1234 AB 75)
      const plateMatch =
        text.match(/\b([A-Z]{2}[-\s]?\d{3}[-\s]?[A-Z]{2})\b/i) ||
        text.match(/\b(\d{1,4}[-\s][A-Z]{2,3}[-\s]\d{2})\b/)
      if (plateMatch) {
        entities.push({
          entity_type: 'vehicle_plate',
          value: plateMatch[1].toUpperCase().replace(/\s/g, '-'),
          confidence: 0.92,
          source: 'ai_extraction',
        })
      }

      // Extract offense city / location
      const cityMatch = text.match(/(?:à|a|sur la|en)\s+([A-ZÀ-Ÿ][a-zà-ÿ\-]+(?:\s+[A-ZÀ-Ÿ][a-zà-ÿ\-]+)*)/i)
      if (cityMatch) {
        const stopWords = ['le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'mon', 'ma', 'mes', 'votre', 'leur']
        const city = cityMatch[1].trim()
        if (!stopWords.includes(city.toLowerCase()) && city.length > 2) {
          entities.push({
            entity_type: 'offense_city',
            value: city,
            confidence: 0.55,
            source: 'ai_extraction',
          })
        }
      }
    }

    // Fine amount (for all contest types)
    const fineMatch = text.match(/(\d+)\s*€|\b(\d+)\s*euros?/i)
    if (fineMatch) {
      entities.push({
        entity_type: 'fine_amount',
        value: `${fineMatch[1] || fineMatch[2]}€`,
        confidence: 0.9,
        source: 'ai_extraction',
      })
    }

    entities.push({
      entity_type: 'contest_reason',
      value: null,
      confidence: 0.1,
      source: 'ai_extraction',
    })
  }

  return entities
}

// Extract entities from OCR'd document text
// TODO: replace with Claude vision/document understanding
export async function extractEntitiesFromDocument(
  ocrText: string,
  intent: IntentType
): Promise<ExtractedEntityInput[]> {
  return extractEntities(ocrText, intent)
}
