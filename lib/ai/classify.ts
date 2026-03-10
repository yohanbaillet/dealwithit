import type { IntentType } from '@/types'

// TODO: replace with Claude API call
// POST to /api/classify or use Anthropic SDK directly
export async function classifyIntent(text: string): Promise<IntentType> {
  // Simulate network latency
  await new Promise((r) => setTimeout(r, 600))

  const lower = text.toLowerCase()

  if (
    lower.includes('résili') ||
    lower.includes('cancel') ||
    lower.includes('annul') ||
    lower.includes('quitter') ||
    lower.includes('mettre fin')
  ) {
    return 'terminate'
  }

  if (
    lower.includes('contest') ||
    lower.includes('amende') ||
    lower.includes('conteste') ||
    lower.includes('oppose') ||
    lower.includes('injuste')
  ) {
    return 'contest'
  }

  if (
    lower.includes('réclam') ||
    lower.includes('plainte') ||
    lower.includes('problème') ||
    lower.includes('dysfonctionnement') ||
    lower.includes('complaint')
  ) {
    return 'complain'
  }

  if (
    lower.includes('attestation') ||
    lower.includes('certif') ||
    lower.includes('justificatif') ||
    lower.includes('document officiel')
  ) {
    return 'certify'
  }

  return 'request'
}
