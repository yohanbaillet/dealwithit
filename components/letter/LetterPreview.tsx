'use client'

import { useState } from 'react'
import { updateLetterContent, regenerateLetter } from '@/actions/generate'
import type { GeneratedLetter } from '@/types'
import { Button } from '@/components/ui/button'
import { Download, Mail, FileText, Copy, RefreshCw, Loader2, Check } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  requestId: string
  postalLetter: GeneratedLetter
  emailLetter: GeneratedLetter
}

type Tab = 'postal' | 'email'

export function LetterPreview({ requestId, postalLetter, emailLetter }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('postal')
  const [postalContent, setPostalContent] = useState(postalLetter.content)
  const [emailContent, setEmailContent] = useState(emailLetter.content)
  const [saving, setSaving] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [downloadLoading, setDownloadLoading] = useState(false)

  const currentContent = activeTab === 'postal' ? postalContent : emailContent
  const currentLetter = activeTab === 'postal' ? postalLetter : emailLetter

  const handleContentChange = (value: string) => {
    if (activeTab === 'postal') setPostalContent(value)
    else setEmailContent(value)
  }

  const handleSave = async () => {
    setSaving(true)
    const result = await updateLetterContent(currentLetter.id, currentContent)
    if (result.error) toast.error(result.error)
    else toast.success('Modifications enregistrées')
    setSaving(false)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(currentContent)
    setCopied(true)
    toast.success('Copié dans le presse-papiers')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRegenerate = async () => {
    setRegenerating(true)
    const result = await regenerateLetter(requestId)
    if ('error' in result && result.error) {
      toast.error(result.error)
    } else {
      toast.success('Lettre régénérée')
      window.location.reload()
    }
    setRegenerating(false)
  }

  const handleDownloadPDF = async () => {
    setDownloadLoading(true)
    try {
      const res = await fetch(`/api/requests/${requestId}/pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: postalContent, subject: postalLetter.subject }),
      })

      if (!res.ok) throw new Error('Erreur PDF')

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `lettre-dealwithit.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('PDF téléchargé')
    } catch {
      toast.error('Erreur lors de la génération du PDF')
    }
    setDownloadLoading(false)
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setActiveTab('postal')}
          className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
            activeTab === 'postal'
              ? 'border-b-2 border-gray-900 text-gray-900'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <FileText className="h-4 w-4" />
          Courrier postal
        </button>
        <button
          onClick={() => setActiveTab('email')}
          className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
            activeTab === 'email'
              ? 'border-b-2 border-gray-900 text-gray-900'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Mail className="h-4 w-4" />
          Version email
        </button>
      </div>

      {/* Subject line for email */}
      {activeTab === 'email' && emailLetter.subject && (
        <div className="border-b border-gray-100 px-4 py-2">
          <span className="text-xs text-gray-400">Objet : </span>
          <span className="text-sm font-medium text-gray-700">{emailLetter.subject}</span>
        </div>
      )}

      {/* Editable content */}
      <div className="p-4">
        <textarea
          value={currentContent}
          onChange={(e) => handleContentChange(e.target.value)}
          className="min-h-[400px] w-full resize-none rounded-lg bg-gray-50 p-4 font-mono text-sm leading-relaxed text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-200"
          spellCheck={false}
        />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 border-t border-gray-100 p-4">
        {activeTab === 'postal' && (
          <Button
            onClick={handleDownloadPDF}
            className="flex-1 gap-2 bg-gray-900 hover:bg-gray-800 sm:flex-none"
            disabled={downloadLoading}
          >
            {downloadLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Télécharger PDF
          </Button>
        )}

        <Button
          variant="outline"
          onClick={handleCopy}
          className="flex-1 gap-2 sm:flex-none"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copié !' : 'Copier'}
        </Button>

        <Button
          variant="outline"
          onClick={handleSave}
          className="flex-1 gap-2 sm:flex-none"
          disabled={saving}
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Sauvegarder
        </Button>

        <Button
          variant="ghost"
          onClick={handleRegenerate}
          className="flex-1 gap-2 text-gray-400 sm:flex-none"
          disabled={regenerating}
        >
          {regenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Régénérer
        </Button>
      </div>
    </div>
  )
}
