'use client'

import { useState } from 'react'
import type { AttachmentChecklist as AttachmentItem } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { Paperclip, CheckSquare, Square } from 'lucide-react'

interface Props {
  items: AttachmentItem[]
}

export function AttachmentChecklist({ items }: Props) {
  const [checked, setChecked] = useState<Record<string, boolean>>(
    Object.fromEntries(items.map((i) => [i.id, i.is_provided]))
  )
  const supabase = createClient()

  const toggle = async (id: string) => {
    const newVal = !checked[id]
    setChecked((prev) => ({ ...prev, [id]: newVal }))
    await supabase
      .from('attachments_checklists')
      .update({ is_provided: newVal })
      .eq('id', id)
  }

  const required = items.filter((i) => i.is_required)
  const optional = items.filter((i) => !i.is_required)

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
        <Paperclip className="h-4 w-4 text-gray-500" />
        Pièces justificatives
      </h2>

      {required.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Obligatoires
          </p>
          <div className="space-y-2">
            {required.map((item) => (
              <button
                key={item.id}
                onClick={() => toggle(item.id)}
                className="flex w-full items-start gap-3 text-left"
              >
                {checked[item.id] ? (
                  <CheckSquare className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                ) : (
                  <Square className="mt-0.5 h-5 w-5 shrink-0 text-gray-300" />
                )}
                <div>
                  <p className={`text-sm font-medium ${checked[item.id] ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                    {item.item_name}
                  </p>
                  {item.description && (
                    <p className="text-xs text-gray-400">{item.description}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {optional.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Recommandées
          </p>
          <div className="space-y-2">
            {optional.map((item) => (
              <button
                key={item.id}
                onClick={() => toggle(item.id)}
                className="flex w-full items-start gap-3 text-left"
              >
                {checked[item.id] ? (
                  <CheckSquare className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                ) : (
                  <Square className="mt-0.5 h-5 w-5 shrink-0 text-gray-300" />
                )}
                <div>
                  <p className={`text-sm font-medium ${checked[item.id] ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                    {item.item_name}
                  </p>
                  {item.description && (
                    <p className="text-xs text-gray-400">{item.description}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
