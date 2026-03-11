'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  FileText,
  Clock,
  CheckCircle,
  Edit3,
  ChevronRight,
  Trash2,
} from 'lucide-react'
import { deleteRequest } from '@/actions/request'
import { INTENT_LABELS } from '@/types'
import type { IntentType, RequestStatus, Request } from '@/types'
import { toast } from 'sonner'

const STATUS_ICONS: Record<RequestStatus, React.ElementType> = {
  draft: Edit3,
  clarifying: Clock,
  generating: Clock,
  complete: CheckCircle,
}

const STATUS_COLORS: Record<RequestStatus, string> = {
  draft: 'text-gray-400',
  clarifying: 'text-blue-500',
  generating: 'text-purple-500',
  complete: 'text-green-500',
}

interface Props {
  requests: Request[]
  locale: string
  statusLabels: Record<RequestStatus, string>
  untitled: string
}

export function RequestList({ requests, locale, statusLabels, untitled }: Props) {
  const router = useRouter()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)

  const allSelected = requests.length > 0 && selected.size === requests.length
  const someSelected = selected.size > 0

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(requests.map((r) => r.id)))
  }

  async function deleteSelected() {
    setDeleting(true)
    const ids = [...selected]
    const results = await Promise.all(ids.map((id) => deleteRequest(id)))
    const errorCount = results.filter((r) => r?.error).length
    if (errorCount > 0) {
      toast.error(`${errorCount} erreur(s) lors de la suppression`)
    }
    setSelected(new Set())
    setDeleting(false)
    router.refresh()
  }

  return (
    <div className="relative pb-20">
      {/* Select-all header row */}
      <div className="mb-1 flex items-center gap-3 px-1">
        <input
          type="checkbox"
          checked={allSelected}
          onChange={toggleAll}
          className="h-4 w-4 cursor-pointer rounded border-gray-300 accent-gray-900"
          aria-label="Tout sélectionner"
        />
        <span className="text-xs text-gray-400">
          {someSelected
            ? `${selected.size} sélectionnée${selected.size > 1 ? 's' : ''}`
            : 'Tout sélectionner'}
        </span>
      </div>

      <div className="space-y-2">
        {requests.map((req) => {
          const status = req.status as RequestStatus
          const StatusIcon = STATUS_ICONS[status] ?? Edit3
          const statusColor = STATUS_COLORS[status] ?? 'text-gray-400'
          const intentInfo = req.intent_type
            ? INTENT_LABELS[req.intent_type as IntentType]
            : null
          const isSelected = selected.has(req.id)

          const resultLink =
            req.status === 'complete' || req.status === 'generating'
              ? `/request/${req.id}/result`
              : req.status === 'clarifying'
              ? `/request/${req.id}/clarify`
              : `/request/${req.id}/upload`

          return (
            <div
              key={req.id}
              className={`flex min-w-0 items-center rounded-xl border bg-white shadow-sm transition-colors ${
                isSelected ? 'border-gray-900 bg-gray-50' : 'border-gray-100'
              }`}
            >
              {/* Checkbox */}
              <label className="flex cursor-pointer items-center py-4 pl-4 pr-2">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleOne(req.id)}
                  className="h-4 w-4 cursor-pointer rounded border-gray-300 accent-gray-900"
                />
              </label>

              {/* Row link */}
              <Link
                href={resultLink}
                className="flex min-w-0 flex-1 items-center gap-3 py-4 pr-4"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50">
                  <FileText className="h-4 w-4 text-gray-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-gray-900">
                    {req.title || untitled}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2">
                    {intentInfo && (
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${intentInfo.color}`}
                      >
                        {intentInfo.fr}
                      </span>
                    )}
                    <span className="truncate text-xs text-gray-400">
                      {new Date(req.created_at).toLocaleDateString(locale, {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5 pl-2">
                  <div className={`flex items-center gap-1 text-xs font-medium ${statusColor}`}>
                    <StatusIcon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{statusLabels[status]}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-300" />
                </div>
              </Link>
            </div>
          )
        })}
      </div>

      {/* Floating delete bar */}
      {someSelected && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
          <div className="flex items-center gap-3 rounded-2xl bg-gray-900 px-5 py-3 shadow-2xl">
            <span className="text-sm font-medium text-white">
              {selected.size} sélectionnée{selected.size > 1 ? 's' : ''}
            </span>
            <button
              onClick={deleteSelected}
              disabled={deleting}
              className="flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {deleting ? 'Suppression…' : 'Supprimer'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
