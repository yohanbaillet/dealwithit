import { useTranslations } from 'next-intl'

export function Footer() {
  const t = useTranslations('footer')
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-gray-100 py-6">
      <div className="mx-auto flex max-w-4xl items-center justify-center px-4">
        <p className="text-sm text-gray-400">
          {t('copyright', { year })}
        </p>
      </div>
    </footer>
  )
}
