'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createRequestFromText } from '@/actions/request'
import { createRequestFromUpload } from '@/actions/upload'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, MessageSquare, Camera, Loader2, Upload, X, FileText, Image } from 'lucide-react'
import { toast } from 'sonner'

type Mode = 'text' | 'upload'

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

export default function NewRequestPage() {
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<Mode>(
    searchParams.get('mode') === 'upload' ? 'upload' : 'text'
  )
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    const example = searchParams.get('example')
    if (example) setText(decodeURIComponent(example))
  }, [searchParams])

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    setLoading(true)
    const formData = new FormData()
    formData.append('rawInput', text)
    formData.append('language', 'fr')
    try {
      await createRequestFromText(formData)
    } catch {
      // redirect handled by server action
    }
  }

  const handleFileSelect = (file: File) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf']
    if (!allowed.includes(file.type) && !file.name.toLowerCase().endsWith('.heic')) {
      toast.error('Format non supporté. Utilisez une image (JPG, PNG, HEIC, WebP) ou un PDF.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Fichier trop volumineux. Maximum 10 Mo.')
      return
    }
    setSelectedFile(file)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => setIsDragging(false), [])

  const handleUploadSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedFile) return
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    try {
      await createRequestFromUpload(formData)
    } catch {
      // redirect handled by server action
    }
  }

  const isImageFile = selectedFile?.type.startsWith('image/')

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Retour
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Nouvelle demande</h1>
        <p className="mt-1 text-gray-500">
          Décrivez votre situation ou importez un document
        </p>
      </div>

      {/* Mode selector — upload first */}
      <div className="mb-6 flex gap-2 rounded-xl border border-gray-200 bg-gray-50 p-1">
        <button
          onClick={() => setMode('upload')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
            mode === 'upload'
              ? 'bg-white shadow-sm text-gray-900'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Camera className="h-4 w-4" />
          J'importe un document
        </button>
        <button
          onClick={() => setMode('text')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
            mode === 'text'
              ? 'bg-white shadow-sm text-gray-900'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          Je décris ma situation
        </button>
      </div>

      {mode === 'text' ? (
        <form onSubmit={handleTextSubmit} className="space-y-4">
          <div>
            <Textarea
              placeholder="Ex: Je veux résilier mon abonnement Basic-Fit. Mon numéro de client est 123456. Je souhaite que la résiliation prenne effet le 1er avril 2025."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              className="resize-none text-base leading-relaxed"
              required
            />
            <p className="mt-1.5 text-xs text-gray-400">
              Plus vous donnez de détails, moins on vous posera de questions
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              name="language"
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
              defaultValue="fr"
            >
              <option value="fr">🇫🇷 Français</option>
              <option value="en">🇬🇧 English</option>
              <option value="de">🇩🇪 Deutsch</option>
              <option value="es">🇪🇸 Español</option>
              <option value="it">🇮🇹 Italiano</option>
            </select>

            <Button
              type="submit"
              className="flex-1 bg-gray-900 hover:bg-gray-800"
              disabled={loading || !text.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyse en cours...
                </>
              ) : (
                'Analyser ma situation →'
              )}
            </Button>
          </div>
        </form>
      ) : (
        <form ref={formRef} onSubmit={handleUploadSubmit} className="space-y-4">
          <input type="hidden" name="language" value="fr" />

          {/* Drop zone */}
          {!selectedFile ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
                isDragging
                  ? 'border-gray-400 bg-gray-100'
                  : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'
              }`}
            >
              <Upload className="mx-auto mb-3 h-10 w-10 text-gray-300" />
              <p className="font-medium text-gray-700">
                Glissez votre document ici
              </p>
              <p className="mt-1 text-sm text-gray-400">
                ou cliquez pour choisir un fichier
              </p>
              <p className="mt-3 text-xs text-gray-300">
                JPG · PNG · HEIC · WebP · PDF — 10 Mo max
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                {isImageFile ? (
                  <Image className="h-6 w-6 text-gray-400" />
                ) : (
                  <FileText className="h-6 w-6 text-gray-400" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-800">{selectedFile.name}</p>
                <p className="text-xs text-gray-400">{formatFileSize(selectedFile.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null)
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            name="file"
            accept="image/*,.pdf,.heic"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFileSelect(file)
            }}
          />

          <Button
            type="submit"
            className="w-full bg-gray-900 hover:bg-gray-800"
            disabled={loading || !selectedFile}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyse du document en cours...
              </>
            ) : (
              'Analyser le document →'
            )}
          </Button>

          {selectedFile && (
            <p className="text-center text-xs text-gray-400">
              On va extraire les infos automatiquement — vous pourrez tout vérifier ensuite
            </p>
          )}
        </form>
      )}

      {/* Examples */}
      {mode === 'text' && (
        <div className="mt-6">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
            Exemples
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              'Je veux résilier mon abonnement Basic-Fit',
              'Je veux contester une amende de 135€',
              'Je veux résilier mon assurance habitation AXA',
              'Je veux faire une réclamation auprès d\'Orange',
            ].map((ex) => (
              <button
                key={ex}
                onClick={() => setText(ex)}
                className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
