import { Shield, FileCheck, Globe } from 'lucide-react'

const TRUST_ITEMS = [
  {
    icon: FileCheck,
    title: 'Brouillon à relire',
    description: 'Chaque lettre est présentée comme un brouillon à vérifier avant envoi',
  },
  {
    icon: Shield,
    title: 'Données protégées',
    description: 'Vos informations sont chiffrées et ne sont jamais partagées',
  },
  {
    icon: Globe,
    title: '6 pays couverts',
    description: 'France, Allemagne, Royaume-Uni, Espagne, Italie, États-Unis',
  },
]

export function TrustBanner() {
  return (
    <section className="border-t border-gray-100 bg-gray-50 px-4 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="grid gap-8 sm:grid-cols-3">
          {TRUST_ITEMS.map(({ icon: Icon, title, description }) => (
            <div key={title} className="text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                <Icon className="h-5 w-5 text-gray-700" />
              </div>
              <h3 className="mb-1 font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500">{description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-xl border border-amber-200 bg-amber-50 px-6 py-4 text-center">
          <p className="text-sm text-amber-800">
            ⚠️ <strong>dealWithIt</strong> génère des brouillons administratifs à titre indicatif.
            Ce service ne constitue pas un conseil juridique. Relisez toujours vos lettres avant envoi.
          </p>
        </div>
      </div>
    </section>
  )
}
