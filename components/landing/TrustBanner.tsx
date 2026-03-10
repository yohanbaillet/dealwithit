import { Shield, FileCheck, Globe } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export async function TrustBanner() {
  const t = await getTranslations('landing.trust')

  const TRUST_ITEMS = [
    {
      icon: FileCheck,
      title: t('item1Title'),
      description: t('item1Desc'),
    },
    {
      icon: Shield,
      title: t('item2Title'),
      description: t('item2Desc'),
    },
    {
      icon: Globe,
      title: t('item3Title'),
      description: t('item3Desc'),
    },
  ]

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
            ⚠️ <strong>dealWithIt</strong> {t('disclaimer')}
          </p>
        </div>
      </div>
    </section>
  )
}
