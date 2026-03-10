import type { NextStep } from '@/types'
import { ArrowRight, AlertTriangle, Clock } from 'lucide-react'

interface Props {
  steps: NextStep[]
}

export function NextStepsCard({ steps }: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
        <ArrowRight className="h-4 w-4 text-gray-500" />
        Prochaines étapes
      </h2>

      <ol className="space-y-3">
        {steps.map((step, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
              {i + 1}
            </span>
            <div className="flex-1">
              <p className={`text-sm ${step.important ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                {step.important && (
                  <AlertTriangle className="mr-1 inline h-3.5 w-3.5 text-amber-500" />
                )}
                {step.step}
              </p>
              {step.deadline && (
                <span className="mt-0.5 inline-flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="h-3 w-3" />
                  {step.deadline}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
