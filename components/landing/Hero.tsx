import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Camera } from 'lucide-react'

export function Hero() {
  return (
    <section className="px-4 pb-16 pt-20 text-center md:pb-24 md:pt-28">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-600">
          ✨ Vos lettres administratives en quelques secondes
        </div>

        <h1 className="mb-5 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
          Décrivez votre situation,
          <br />
          <span className="text-gray-500">on rédige la lettre.</span>
        </h1>

        <p className="mb-10 text-lg leading-relaxed text-gray-500 md:text-xl">
          Résiliation, contestation, réclamation — expliquez simplement
          votre problème et recevez un courrier officiel prêt à envoyer.
        </p>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href="/request/new" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full gap-2 bg-gray-900 px-8 py-6 text-base hover:bg-gray-800 sm:w-auto"
            >
              Je décris ma situation
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/request/new?mode=upload" className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="outline"
              className="w-full gap-2 px-8 py-6 text-base sm:w-auto"
            >
              <Camera className="h-4 w-4" />
              Je prends un document en photo
            </Button>
          </Link>
        </div>

        <p className="mt-6 text-sm text-gray-400">
          Gratuit pour commencer · Aucune carte bancaire requise
        </p>
      </div>
    </section>
  )
}
