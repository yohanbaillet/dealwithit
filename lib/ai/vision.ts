import Anthropic from '@anthropic-ai/sdk'
import sharp from 'sharp'
import type { IntentType } from '@/types'

// Force direct Anthropic endpoint — overrides any system-level ANTHROPIC_BASE_URL proxy
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: 'https://api.anthropic.com',
})

type ImageMediaType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'

// Max dimension sent to Claude — balances readability vs token cost.
// At 1024px, a typical document photo costs ~800–1200 input tokens for the image.
const MAX_IMAGE_DIMENSION = 1024

export interface DocumentExtractionResult {
  rawText: string
  detectedIntent: IntentType | null
  entities: Record<string, string | null>
}

const EXTRACTION_PROMPT = `Tu es un assistant spécialisé dans l'analyse de documents administratifs français.

Lis attentivement ce document et extrais toutes les informations pertinentes.

Réponds UNIQUEMENT avec un objet JSON valide ayant cette structure exacte :
{
  "rawText": "transcription complète du texte visible dans le document",
  "detectedIntent": "terminate | contest | complain | request | certify | null",
  "entities": {
    "sender_name": "nom complet du titulaire/client/destinataire du document (pas le nom de l'entreprise)",
    "sender_address": "adresse postale complète du titulaire/client",
    "company_name": "nom de l'entreprise ou organisme émetteur du document",
    "contract_number": "numéro de contrat, d'abonnement, de membre, de référence client, ou tout identifiant numérique unique",
    "termination_date": "date de résiliation, d'échéance ou date clé principale au format YYYY-MM-DD",
    "fine_reference": "numéro de l'avis de contravention ou référence de l'amende",
    "fine_amount": "montant de l'amende ou de la pénalité (ex: '135€')",
    "vehicle_plate": "numéro d'immatriculation du véhicule",
    "offense_date": "date de l'infraction ou de l'amende au format YYYY-MM-DD",
    "offense_city": "ville ou commune de l'infraction"
  }
}

Règles importantes :
- detectedIntent : "terminate" pour résiliation/annulation, "contest" pour contestation d'amende ou facture, "complain" pour réclamation/plainte, "request" pour demande formelle, "certify" pour attestation/certificat
- sender_name = NOM DU CLIENT/TITULAIRE du document, jamais le nom de l'entreprise
- Les dates DOIVENT être au format YYYY-MM-DD (ex: 2025-03-01)
- Utilise null pour les champs absents, jamais une chaîne vide
- contract_number : prend le numéro le plus pertinent (membre, contrat, référence client, etc.)
- Réponds UNIQUEMENT avec le JSON, sans texte avant ni après`

/**
 * Resize an image so its longest side is at most MAX_IMAGE_DIMENSION px,
 * then re-encode as JPEG. Returns { base64, mediaType }.
 * Skips resize if the image is already small enough.
 */
async function resizeImage(
  buffer: ArrayBuffer
): Promise<{ base64: string; mediaType: ImageMediaType }> {
  const input = Buffer.from(buffer)
  const metadata = await sharp(input).metadata()

  const { width = 0, height = 0 } = metadata
  const needsResize = width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION

  const output = needsResize
    ? await sharp(input)
        .resize(MAX_IMAGE_DIMENSION, MAX_IMAGE_DIMENSION, {
          fit: 'inside',       // preserves aspect ratio, never upscales
          withoutEnlargement: true,
        })
        .jpeg({ quality: 85 }) // JPEG keeps file size small
        .toBuffer()
    : await sharp(input).jpeg({ quality: 85 }).toBuffer()

  return { base64: output.toString('base64'), mediaType: 'image/jpeg' }
}

export async function extractFromDocument(file: File): Promise<DocumentExtractionResult> {
  const buffer = await file.arrayBuffer()
  const mimeType = file.type

  const isImage = (['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'] as string[]).includes(mimeType)
  const isPDF = mimeType === 'application/pdf'

  if (!isImage && !isPDF) {
    throw new Error(`Type de fichier non supporté : ${mimeType}. Utilisez une image (JPG, PNG, WebP) ou un PDF.`)
  }

  let responseText: string

  if (isPDF) {
    // PDFs are sent as-is — sharp can't resize PDFs, and Anthropic handles them natively
    const base64 = Buffer.from(buffer).toString('base64')
    const response = await anthropic.beta.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      betas: ['pdfs-2024-09-25'],
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: { type: 'base64', media_type: 'application/pdf', data: base64 },
            } as Parameters<typeof anthropic.beta.messages.create>[0]['messages'][0]['content'][0],
            { type: 'text', text: EXTRACTION_PROMPT },
          ],
        },
      ],
    })
    responseText = response.content[0].type === 'text' ? response.content[0].text : ''
  } else {
    // Resize image before sending to keep token cost low
    const { base64, mediaType } = await resizeImage(buffer)
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64 },
            },
            { type: 'text', text: EXTRACTION_PROMPT },
          ],
        },
      ],
    })
    responseText = response.content[0].type === 'text' ? response.content[0].text : ''
  }

  try {
    // Strip any markdown code fences if Claude adds them
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as DocumentExtractionResult
    }
  } catch {
    // fall through to default
  }

  return { rawText: responseText, detectedIntent: null, entities: {} }
}
