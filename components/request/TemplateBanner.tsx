'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ChevronDown, Loader2, X } from 'lucide-react'
import { changeRequestTemplate } from '@/actions/clarify'
import { TEMPLATES, getTemplate } from '@/lib/templates'
import type { IntentType } from '@/types'
import { INTENT_LABELS } from '@/types'
import { toast } from 'sonner'

interface Props {
  requestId: string
  templateKey: string | null
  intentType: IntentType | null
}

export function TemplateBanner({ requestId, templateKey, intentType }: Props) {
  const t = useTranslations('templateBanner')
  const tTemplates = useTranslations('templates')
  const tIntents = useTranslations('intents')
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const activeTemplate = getTemplate(templateKey)

  const handleSelect = (key: string) => {
    if (key === templateKey) {
      setOpen(false)
      return
    }
    startTransition(async () => {
      const result = await changeRequestTemplate(requestId, key)
      if ('error' in result) {
        toast.error(result.error)
      } else {
        setOpen(false)
        router.refresh()
      }
    })
  }

  return (
    <div className="mb-6">
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {activeTemplate ? (
              <>
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg ${activeTemplate.iconBg}`}>
                  {activeTemplate.emoji}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900 text-sm">
                      {tTemplates(activeTemplate.key as Parameters<typeof tTemplates>[0])}
                    </p>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${activeTemplate.badgeColor}`}>
                      {tIntents(activeTemplate.badge as Parameters<typeof tIntents>[0])}
                    </span>
                  </div>
                </div>
              </>
            ) : intentType ? (
              <>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-lg">
                  📄
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${INTENT_LABELS[intentType].color}`}>
                      {tIntents(intentType)}
                    </span>
                    <span className="text-xs text-gray-400">{t('autoDetected')}</span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-400">{t('noTemplate')}</p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            disabled={isPending}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                {t('change')}
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
              </>
            )}
          </button>
        </div>

        {open && (
          <div className="mt-4 border-t border-gray-100 pt-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                {t('chooseTemplate')}
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded p-0.5 text-gray-400 hover:text-gray-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {TEMPLATES.map((tmpl) => {
                const isActive = tmpl.key === templateKey

                return (
                  <button
                    key={tmpl.key}
                    type="button"
                    disabled={isPending}
                    onClick={() => handleSelect(tmpl.key)}
                    className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                      isActive
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-100 bg-gray-50 hover:border-gray-200 hover:bg-white'
                    }`}
                  >
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base ${
                      isActive ? 'bg-white/10' : tmpl.iconBg
                    }`}>
                      {tmpl.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium leading-tight ${isActive ? 'text-white' : 'text-gray-900'}`}>
                        {tTemplates(tmpl.key as Parameters<typeof tTemplates>[0])}
                      </p>
                    </div>
                    <span className={`shrink-0 self-start rounded-full px-2 py-0.5 text-xs font-medium ${
                      isActive ? 'bg-white/15 text-white' : tmpl.badgeColor
                    }`}>
                      {tIntents(tmpl.badge as Parameters<typeof tIntents>[0])}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
