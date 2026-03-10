'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { submitAnswers } from '@/actions/clarify'
import { extractFromDocumentForClarify } from '@/actions/upload'
import { getTemplate } from '@/lib/templates'
import type { ClarificationQuestion } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Camera, CheckCircle2, Loader2, Upload } from 'lucide-react'
import { toast } from 'sonner'

const TEXTAREA_KEYS = ['complaint_description', 'request_details', 'contest_reason', 'expected_resolution']
const DATE_KEYS = ['termination_date', 'offense_date']

const KNOWN_FIELD_KEYS = [
  'sender_name', 'sender_address', 'company_name', 'contract_number',
  'termination_date', 'fine_reference', 'offense_date', 'vehicle_plate',
  'offense_city', 'fine_amount', 'contest_reason', 'complaint_description',
  'expected_resolution', 'request_details',
]

const SCAN_EMOJIS = ['📸', '🔍', '🧠', '🪄', '✨']

interface Props {
  requestId: string
  questions: ClarificationQuestion[]
  templateKey?: string | null
}

export function ClarificationForm({ requestId, questions, templateKey }: Props) {
  const t = useTranslations('form')
  const tFields = useTranslations('fields')
  const locale = useLocale()
  const [loading, setLoading] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [scanStepIndex, setScanStepIndex] = useState(0)
  const [scanDone, setScanDone] = useState(false)
  const [autoFilledKeys, setAutoFilledKeys] = useState<Set<string>>(new Set())
  const [isDragging, setIsDragging] = useState(false)
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Build field options map from template definition, locale-aware
  const template = templateKey ? getTemplate(templateKey) : null
  const fieldOptionsMap: Record<string, string[]> = {}
  if (template) {
    for (const f of template.fields) {
      if (f.companyOptionsByLocale) {
        fieldOptionsMap[f.key] = f.companyOptionsByLocale[locale] ?? f.companyOptionsByLocale['fr'] ?? []
      }
    }
  }

  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(questions.map((q) => [q.field_key, q.answer || '']))
  )

  // Track which fields with options are in "autre" free-text mode
  const [autreFields, setAutreFields] = useState<Set<string>>(() => {
    const set = new Set<string>()
    for (const q of questions) {
      const opts = fieldOptionsMap[q.field_key]
      if (opts && q.answer && !opts.some((o) => o.toLowerCase() === q.answer!.toLowerCase())) {
        set.add(q.field_key)
      }
    }
    return set
  })

  const steps = SCAN_EMOJIS.map((icon, i) => ({ icon, text: t(`scanStep${i}` as Parameters<typeof t>[0]) }))

  // Animate progress bar and cycle messages while scanning
  useEffect(() => {
    if (!scanning) return

    const progressInterval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 85) return prev
        return prev + (85 - prev) * 0.04 + 0.8
      })
    }, 80)

    const messageInterval = setInterval(() => {
      setScanStepIndex((prev) => (prev + 1) % steps.length)
    }, 1600)

    return () => {
      clearInterval(progressInterval)
      clearInterval(messageInterval)
    }
  }, [scanning, steps.length])

  const getFieldLabel = (fieldKey: string, fallback: string) => {
    if (KNOWN_FIELD_KEYS.includes(fieldKey)) {
      return tFields(fieldKey as Parameters<typeof tFields>[0])
    }
    return fallback
  }

  const startScan = async (file: File) => {
    setScanning(true)
    setScanProgress(0)
    setScanStepIndex(0)
    setScanDone(false)

    const formData = new FormData()
    formData.append('file', file)

    const result = await extractFromDocumentForClarify(requestId, formData)

    if ('error' in result) {
      toast.error(result.error)
      setScanning(false)
      setScanProgress(0)
      return
    }

    const { extractedValues } = result
    const filled = new Set<string>()
    const nextValues = { ...values }
    const nextAutreFields = new Set(autreFields)

    for (const [key, value] of Object.entries(extractedValues)) {
      if (value && questions.some((q) => q.field_key === key)) {
        const opts = fieldOptionsMap[key]
        if (opts) {
          // Try case-insensitive match against known options
          const match = opts.find((o) => o.toLowerCase() === value.toLowerCase())
          if (match) {
            nextValues[key] = match
            nextAutreFields.delete(key)
          } else {
            nextValues[key] = value
            nextAutreFields.add(key)
          }
        } else {
          nextValues[key] = value
        }
        filled.add(key)
      }
    }

    setValues(nextValues)
    setAutreFields(nextAutreFields)
    setAutoFilledKeys(filled)

    // Finish the bar
    setScanProgress(100)
    setScanDone(true)
    await new Promise((r) => setTimeout(r, 600))
    setScanning(false)

    const count = filled.size
    if (count > 0) {
      toast.success(t('autoFilledCount', { count }))
    } else {
      toast.info(t('noExtraction'))
    }
  }

  const handlePhotoSelect = (file: File) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf']
    if (!allowed.includes(file.type) && !file.name.toLowerCase().endsWith('.heic')) {
      toast.error(t('unsupportedFormat'))
      return
    }
    startScan(file)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handlePhotoSelect(file)
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData()
    for (const [key, value] of Object.entries(values)) {
      formData.append(key, value)
    }

    for (const q of questions.filter((q) => q.is_required)) {
      const val = values[q.field_key]
      if (!val || !val.trim()) {
        toast.error(t('requiredField', { question: getFieldLabel(q.field_key, q.question) }))
        setLoading(false)
        return
      }
    }

    try {
      await submitAnswers(requestId, formData)
    } catch {
      // redirect handled server-side
    }
  }

  if (questions.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center">
        <p className="text-gray-500">{t('allExtracted')}</p>
        <Button
          onClick={() => router.push(`/request/${requestId}/result`)}
          className="mt-4 bg-gray-900 hover:bg-gray-800"
        >
          {t('generateLetter')}
        </Button>
      </div>
    )
  }

  const currentStep = steps[scanStepIndex]

  return (
    <div className="space-y-6">
      {/* Photo upload zone */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <p className="mb-3 text-sm font-medium text-gray-700">
          <Camera className="mr-1.5 inline h-4 w-4 text-gray-400" />
          {t('photoTitle')}
        </p>

        {scanning ? (
          /* ---- Scanning progress ---- */
          <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-xl leading-none">{currentStep.icon}</span>
              <p className="text-sm font-medium text-gray-700 transition-all">{currentStep.text}</p>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className={`h-full rounded-full transition-all duration-200 ${
                  scanDone ? 'bg-emerald-500' : 'bg-gray-900'
                }`}
                style={{ width: `${scanProgress}%` }}
              />
            </div>
            <p className="mt-1.5 text-right text-xs text-gray-400">{Math.round(scanProgress)}%</p>
          </div>
        ) : (
          /* ---- Drop zone ---- */
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-lg border-2 border-dashed p-5 text-center transition-colors ${
              isDragging
                ? 'border-gray-400 bg-gray-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Upload className="mx-auto mb-2 h-6 w-6 text-gray-300" />
            <p className="text-sm text-gray-500">
              {t('dragDrop')}{' '}
              <span className="font-medium text-gray-700">{t('clickToChoose')}</span>
            </p>
            <p className="mt-1 text-xs text-gray-400">{t('formats')}</p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf,.heic"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handlePhotoSelect(file)
            e.target.value = ''
          }}
        />

        {autoFilledKeys.size > 0 && !scanning && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {t('autoFilledVerify', { count: autoFilledKeys.size })}
          </p>
        )}
      </div>

      {/* Clarification form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {questions.map((q) => {
          const isAutoFilled = autoFilledKeys.has(q.field_key)
          const value = values[q.field_key] ?? ''
          const label = getFieldLabel(q.field_key, q.question)
          const opts = fieldOptionsMap[q.field_key]
          const isAutre = autreFields.has(q.field_key)

          return (
            <div key={q.id} className="space-y-1.5">
              <Label htmlFor={q.field_key} className="text-sm font-medium text-gray-800">
                {label}
                {q.is_required && <span className="ml-1 text-red-500">*</span>}
                {isAutoFilled && (
                  <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-normal text-emerald-600">
                    <CheckCircle2 className="h-3 w-3" />
                    {t('autoFilled')}
                  </span>
                )}
              </Label>

              {opts ? (
                /* ---- Company picker ---- */
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {opts.map((company) => {
                      const isSelected = value === company && !isAutre
                      return (
                        <button
                          key={company}
                          type="button"
                          onClick={() => {
                            setValues((prev) => ({ ...prev, [q.field_key]: company }))
                            setAutreFields((prev) => { const s = new Set(prev); s.delete(q.field_key); return s })
                          }}
                          className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                            isSelected
                              ? 'border-gray-900 bg-gray-900 text-white'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400 hover:text-gray-900'
                          }`}
                        >
                          {company}
                        </button>
                      )
                    })}
                    <button
                      type="button"
                      onClick={() => {
                        setAutreFields((prev) => new Set([...prev, q.field_key]))
                        setValues((prev) => ({ ...prev, [q.field_key]: isAutre ? value : '' }))
                      }}
                      className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                        isAutre
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400 hover:text-gray-900'
                      }`}
                    >
                      {t('autre')}
                    </button>
                  </div>
                  {isAutre && (
                    <Input
                      id={q.field_key}
                      name={q.field_key}
                      value={value}
                      onChange={(e) => setValues((prev) => ({ ...prev, [q.field_key]: e.target.value }))}
                      placeholder={t('autrePlaceholder')}
                      required={q.is_required}
                      className={isAutoFilled ? 'border-emerald-200 bg-emerald-50/30' : ''}
                      autoFocus
                    />
                  )}
                </div>
              ) : TEXTAREA_KEYS.includes(q.field_key) ? (
                <Textarea
                  id={q.field_key}
                  name={q.field_key}
                  value={value}
                  onChange={(e) => setValues((prev) => ({ ...prev, [q.field_key]: e.target.value }))}
                  placeholder={t('placeholder')}
                  rows={3}
                  required={q.is_required}
                  className={`resize-none ${isAutoFilled ? 'border-emerald-200 bg-emerald-50/30' : ''}`}
                />
              ) : DATE_KEYS.includes(q.field_key) ? (
                <Input
                  id={q.field_key}
                  name={q.field_key}
                  type="date"
                  value={value}
                  onChange={(e) => setValues((prev) => ({ ...prev, [q.field_key]: e.target.value }))}
                  required={q.is_required}
                  className={`w-fit ${isAutoFilled ? 'border-emerald-200 bg-emerald-50/30' : ''}`}
                />
              ) : (
                <Input
                  id={q.field_key}
                  name={q.field_key}
                  value={value}
                  onChange={(e) => setValues((prev) => ({ ...prev, [q.field_key]: e.target.value }))}
                  placeholder={t('placeholder')}
                  required={q.is_required}
                  className={isAutoFilled ? 'border-emerald-200 bg-emerald-50/30' : ''}
                />
              )}
            </div>
          )
        })}

        <div className="pt-2">
          <Button
            type="submit"
            className="w-full bg-gray-900 py-5 text-base hover:bg-gray-800"
            disabled={loading || scanning}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('generating')}
              </>
            ) : (
              t('generateLetter')
            )}
          </Button>
          <p className="mt-2 text-center text-xs text-gray-400">{t('disclaimer')}</p>
        </div>
      </form>
    </div>
  )
}
