'use client'

import { useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { uploadDocumentAndProcess } from '@/actions/upload'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Upload, Camera, FileText, Loader2, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import type { IntentType } from '@/types'
import { INTENT_LABELS } from '@/types'
import { useTranslations } from 'next-intl'

const INTENTS: { value: IntentType; emoji: string }[] = [
  { value: 'terminate', emoji: '🔴' },
  { value: 'contest', emoji: '⚠️' },
  { value: 'complain', emoji: '📢' },
  { value: 'request', emoji: '📋' },
]

export default function UploadPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [intent, setIntent] = useState<IntentType | null>(null)
  const [loading, setLoading] = useState(false)
  const [ocrPreview, setOcrPreview] = useState<string | null>(null)

  const t = useTranslations('upload')
  const tIntents = useTranslations('intents')

  const handleFile = (f: File) => {
    if (f.size > 10 * 1024 * 1024) {
      toast.error(t('fileTooLarge'))
      return
    }
    setFile(f)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const handleSubmit = async () => {
    if (!file) return toast.error(t('selectFile'))
    setLoading(true)

    const formData = new FormData()
    formData.append('file', file)

    const result = await uploadDocumentAndProcess(id, formData, intent || undefined)

    if ('error' in result && result.error) {
      toast.error(result.error)
      setLoading(false)
      return
    }

    if ('ocrText' in result) {
      setOcrPreview(result.ocrText || null)
      setTimeout(() => {
        router.push(`/request/${id}/clarify`)
      }, 1500)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {t('back')}
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <p className="mt-1 text-gray-500">{t('subtitle')}</p>
      </div>

      {/* Upload zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileRef.current?.click()}
        className={`mb-6 cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
          file
            ? 'border-green-300 bg-green-50'
            : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'
        }`}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          capture="environment"
        />

        {file ? (
          <div className="flex flex-col items-center gap-2">
            <CheckCircle className="h-10 w-10 text-green-500" />
            <p className="font-medium text-green-700">{file.name}</p>
            <p className="text-sm text-green-600">
              {(file.size / 1024).toFixed(0)} Ko
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-3">
              <Upload className="h-8 w-8 text-gray-300" />
              <Camera className="h-8 w-8 text-gray-300" />
            </div>
            <p className="font-medium text-gray-700">{t('dragDrop')}</p>
            <p className="text-sm text-gray-400">{t('formats')}</p>
          </div>
        )}
      </div>

      {/* Intent override */}
      <div className="mb-6">
        <p className="mb-3 text-sm font-medium text-gray-700">
          {t('intentLabel')} <span className="font-normal text-gray-400">{t('intentHint')}</span>
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {INTENTS.map(({ value, emoji }) => (
            <button
              key={value}
              onClick={() => setIntent(intent === value ? null : value)}
              className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${
                intent === value
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              {emoji} {tIntents(value)}
            </button>
          ))}
        </div>
      </div>

      {/* OCR preview */}
      {ocrPreview && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-500" />
            <p className="text-sm font-medium text-gray-700">{t('extractedText')}</p>
          </div>
          <pre className="whitespace-pre-wrap text-xs text-gray-500">{ocrPreview}</pre>
        </div>
      )}

      <Button
        onClick={handleSubmit}
        className="w-full bg-gray-900 hover:bg-gray-800"
        disabled={loading || !file}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('analyzing')}
          </>
        ) : (
          t('analyze')
        )}
      </Button>
    </div>
  )
}
