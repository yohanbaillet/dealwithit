'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Camera, Loader2, PenLine } from 'lucide-react'
import { createRequestFromText } from '@/actions/request'

const EXAMPLES = [
  {
    emoji: '🏋️',
    title: 'Résilier ma salle de sport',
    description: 'Je veux résilier mon abonnement Basic-Fit',
    badge: 'Résiliation',
    badgeColor: 'bg-orange-100 text-orange-700',
    iconBg: 'bg-orange-50',
  },
  {
    emoji: '🚗',
    title: 'Contester une amende',
    description: "J'ai reçu une amende injuste que je veux contester",
    badge: 'Contestation',
    badgeColor: 'bg-red-100 text-red-700',
    iconBg: 'bg-red-50',
  },
  {
    emoji: '🏠',
    title: 'Résilier mon assurance habitation',
    description: 'Je déménage et veux résilier mon contrat AXA',
    badge: 'Résiliation',
    badgeColor: 'bg-blue-100 text-blue-700',
    iconBg: 'bg-blue-50',
  },
  {
    emoji: '📱',
    title: 'Résilier mon abonnement téléphone',
    description: "Je veux changer d'opérateur et résilier mon contrat Orange",
    badge: 'Résiliation',
    badgeColor: 'bg-violet-100 text-violet-700',
    iconBg: 'bg-violet-50',
  },
  {
    emoji: '💡',
    title: 'Contester une facture EDF',
    description: "Ma facture d'électricité est anormalement élevée",
    badge: 'Contestation',
    badgeColor: 'bg-yellow-100 text-yellow-700',
    iconBg: 'bg-yellow-50',
  },
  {
    emoji: '📦',
    title: 'Réclamer un remboursement',
    description: "Mon colis n'est jamais arrivé, je demande un remboursement",
    badge: 'Réclamation',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    iconBg: 'bg-emerald-50',
  },
]

export function ExampleCards() {
  const [loadingExample, setLoadingExample] = useState<string | null>(null)

  const handleExampleClick = async (description: string) => {
    setLoadingExample(description)
    const formData = new FormData()
    formData.append('rawInput', description)
    formData.append('language', 'fr')
    try {
      await createRequestFromText(formData)
    } catch {
      // redirect handled by server action (throws NEXT_REDIRECT)
      setLoadingExample(null)
    }
  }

  return (
    <section className="min-h-[calc(100vh-64px)] bg-gray-50 px-4 py-16">
      <div className="mx-auto max-w-4xl">
        {/* Hero header */}
        <div className="mb-10 text-center">
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            Votre lettre administrative
            <br />
            <span className="text-gray-400">en quelques secondes.</span>
          </h1>
          <p className="text-gray-500">
            Choisissez votre situation — ou importez un document pour tout remplir automatiquement.
          </p>
        </div>

        {/* Photo upload shortcut */}
        <Link
          href="/request/new?mode=upload"
          className="mb-6 flex items-center gap-3 rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-4 transition-colors hover:border-gray-400 hover:bg-gray-50"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100">
            <Camera className="h-5 w-5 text-gray-500" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-800">Importer une photo ou un document</p>
            <p className="text-sm text-gray-400">
              Facture, contrat, courrier — on remplit tout automatiquement
            </p>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-gray-400" />
        </Link>

        <div className="mb-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
            ou choisissez un cas
          </span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Example cards grid */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {EXAMPLES.map((example) => {
            const isLoading = loadingExample === example.description
            const isDisabled = !!loadingExample

            return (
              <button
                key={example.title}
                onClick={() => handleExampleClick(example.description)}
                disabled={isDisabled}
                className={`group flex w-full flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition-all duration-200 disabled:cursor-not-allowed ${
                  isLoading
                    ? 'border-gray-300 shadow-md'
                    : 'hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl ${example.iconBg}`}>
                    {example.emoji}
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${example.badgeColor}`}>
                    {example.badge}
                  </span>
                </div>

                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{example.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-gray-500">{example.description}</p>
                </div>

                <div className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                  isLoading ? 'text-gray-700' : 'text-gray-400 group-hover:text-gray-700'
                }`}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Analyse en cours...
                    </>
                  ) : (
                    <>
                      Utiliser cet exemple
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </div>
              </button>
            )
          })}

          {/* "Autre situation" card — leads to free text input */}
          <Link
            href="/request/new"
            className={`group flex w-full flex-col gap-4 rounded-2xl border-2 border-dashed border-gray-200 bg-white p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md ${
              loadingExample ? 'pointer-events-none opacity-50' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                <PenLine className="h-5 w-5 text-gray-500" />
              </div>
            </div>

            <div className="flex-1">
              <p className="font-semibold text-gray-900">Autre situation</p>
              <p className="mt-1 text-sm leading-relaxed text-gray-500">
                Décrivez votre problème en quelques mots
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400 transition-colors group-hover:text-gray-700">
              Décrire ma situation
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        </div>
      </div>
    </section>
  )
}
