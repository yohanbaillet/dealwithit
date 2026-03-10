import type { IntentType, ExtractedEntity } from '@/types'
import { INTENT_LABELS } from '@/types'
import { AlertCircle } from 'lucide-react'

interface Props {
  intent: IntentType
  entities: ExtractedEntity[]
  rawInput?: string | null
}

const ENTITY_LABELS: Record<string, string> = {
  company_name: 'Entreprise',
  contract_number: 'N° contrat/client',
  termination_date: 'Date de résiliation',
  notice_reason: 'Motif',
  fine_amount: 'Montant contesté',
  contest_reason: 'Motif de contestation',
}

export function IntentSummary({ intent, entities, rawInput }: Props) {
  const intentLabel = INTENT_LABELS[intent]
  const relevantEntities = entities.filter((e) => e.value && ENTITY_LABELS[e.entity_type])

  return (
    <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${intentLabel.color}`}>
          {intentLabel.fr}
        </span>
        <span className="text-sm text-gray-500">détecté automatiquement</span>
      </div>

      {relevantEntities.length > 0 && (
        <div className="space-y-2">
          {relevantEntities.map((entity) => (
            <div key={entity.id} className="flex items-start justify-between gap-2">
              <span className="text-sm text-gray-500">{ENTITY_LABELS[entity.entity_type] || entity.entity_type}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-gray-900">{entity.value}</span>
                {entity.confidence < 0.7 && (
                  <span
                    title="Valeur incertaine — veuillez vérifier"
                    className="flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-xs text-amber-700"
                  >
                    <AlertCircle className="h-3 w-3" />
                    À vérifier
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {rawInput && (
        <details className="mt-3">
          <summary className="cursor-pointer text-xs text-gray-400 hover:text-gray-600">
            Voir votre description originale
          </summary>
          <p className="mt-2 rounded-lg bg-gray-50 p-3 text-xs leading-relaxed text-gray-600">
            {rawInput}
          </p>
        </details>
      )}
    </div>
  )
}
