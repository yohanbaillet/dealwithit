'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { submitAnswers } from '@/actions/clarify'
import { extractFromDocumentForClarify } from '@/actions/upload'
import type { ClarificationQuestion } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Camera, CheckCircle2, Loader2, Upload, X } from 'lucide-react'
import { toast } from 'sonner'

const TEXTAREA_KEYS = ['complaint_description', 'request_details', 'contest_reason', 'expected_resolution']
const DATE_KEYS = ['termination_date', 'offense_date']

interface Props {
  requestId: string
  questions: ClarificationQuestion[]
}

export function ClarificationForm({ requestId, questions }: Props) {
  const [loading, setLoading] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [autoFilledKeys, setAutoFilledKeys] = useState<Set<string>>(new Set())
  const [selectedScanFile, setSelectedScanFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Controlled values — initialised from DB answers (may already be pre-filled by upload flow)
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(questions.map((q) => [q.field_key, q.answer || '']))
  )

  const handlePhotoSelect = (file: File) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf']
    if (!allowed.includes(file.type) && !file.name.toLowerCase().endsWith('.heic')) {
      toast.error('Format non supporté. Utilisez une image ou un PDF.')
      return
    }
    setSelectedScanFile(file)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handlePhotoSelect(file)
  }, [])

  const handleScan = async () => {
    if (!selectedScanFile) return
    setScanning(true)

    const formData = new FormData()
    formData.append('file', selectedScanFile)

    const result = await extractFromDocumentForClarify(requestId, formData)

    if ('error' in result) {
      toast.error(result.error)
      setScanning(false)
      return
    }

    const { extractedValues } = result
    const filled = new Set<string>()

    setValues((prev) => {
      const next = { ...prev }
      for (const [key, value] of Object.entries(extractedValues)) {
        if (value && questions.some((q) => q.field_key === key)) {
          next[key] = value
          filled.add(key)
        }
      }
      return next
    })

    setAutoFilledKeys(filled)
    setScanning(false)
    setSelectedScanFile(null)

    const count = filled.size
    if (count > 0) {
      toast.success(`${count} champ${count > 1 ? 's' : ''} rempli${count > 1 ? 's' : ''} automatiquement`)
    } else {
      toast.info("Aucune information extraite — remplissez les champs manuellement.")
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData()
    for (const [key, value] of Object.entries(values)) {
      formData.append(key, value)
    }

    // Check required fields
    for (const q of questions.filter((q) => q.is_required)) {
      const val = values[q.field_key]
      if (!val || !val.trim()) {
        toast.error(`Veuillez répondre : "${q.question}"`)
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
        <p className="text-gray-500">Toutes les informations ont été extraites automatiquement.</p>
        <Button
          onClick={() => router.push(`/request/${requestId}/result`)}
          className="mt-4 bg-gray-900 hover:bg-gray-800"
        >
          Générer ma lettre →
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Photo upload zone — auto-fill shortcut */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <p className="mb-3 text-sm font-medium text-gray-700">
          <Camera className="mr-1.5 inline h-4 w-4 text-gray-400" />
          Remplir depuis une photo
        </p>

        {!selectedScanFile ? (
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
              Glissez votre document ou{' '}
              <span className="font-medium text-gray-700">cliquez pour choisir</span>
            </p>
            <p className="mt-1 text-xs text-gray-400">JPG · PNG · HEIC · PDF</p>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-800">{selectedScanFile.name}</p>
            </div>
            <Button
              type="button"
              onClick={handleScan}
              disabled={scanning}
              size="sm"
              className="shrink-0 bg-gray-900 hover:bg-gray-800"
            >
              {scanning ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Analyse...
                </>
              ) : (
                'Analyser →'
              )}
            </Button>
            <button
              type="button"
              disabled={scanning}
              onClick={() => setSelectedScanFile(null)}
              className="rounded p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>
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

        {autoFilledKeys.size > 0 && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {autoFilledKeys.size} champ{autoFilledKeys.size > 1 ? 's' : ''} rempli{autoFilledKeys.size > 1 ? 's' : ''} automatiquement — vérifiez avant de continuer
          </p>
        )}
      </div>

      {/* Clarification form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {questions.map((q) => {
          const isAutoFilled = autoFilledKeys.has(q.field_key)
          const value = values[q.field_key] ?? ''

          return (
            <div key={q.id} className="space-y-1.5">
              <Label htmlFor={q.field_key} className="text-sm font-medium text-gray-800">
                {q.question}
                {q.is_required && <span className="ml-1 text-red-500">*</span>}
                {isAutoFilled && (
                  <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-normal text-emerald-600">
                    <CheckCircle2 className="h-3 w-3" />
                    Auto-rempli
                  </span>
                )}
              </Label>

              {TEXTAREA_KEYS.includes(q.field_key) ? (
                <Textarea
                  id={q.field_key}
                  name={q.field_key}
                  value={value}
                  onChange={(e) => setValues((prev) => ({ ...prev, [q.field_key]: e.target.value }))}
                  placeholder="Votre réponse..."
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
                  placeholder="Votre réponse..."
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
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Génération de la lettre...
              </>
            ) : (
              'Générer ma lettre →'
            )}
          </Button>
          <p className="mt-2 text-center text-xs text-gray-400">
            Vous pourrez modifier la lettre avant de la télécharger
          </p>
        </div>
      </form>
    </div>
  )
}
