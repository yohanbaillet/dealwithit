'use client'

import { useState, useMemo } from 'react'
import { ArrowRight, ChevronDown, Loader2, Search, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { createRequestFromText } from '@/actions/request'
import { POPULAR_TEMPLATES, EXTENDED_TEMPLATES } from '@/lib/templates'
import type { IntentType } from '@/types'

const ALL_TEMPLATES = [...POPULAR_TEMPLATES, ...EXTENDED_TEMPLATES]

type FilterKey = 'all' | IntentType

const FILTER_KEYS: FilterKey[] = ['all', 'terminate', 'contest', 'complain', 'request']

export function ExampleCards() {
  const t = useTranslations('landing')
  const tTemplates = useTranslations('templates')
  const tIntents = useTranslations('intents')
  const [loadingKey, setLoadingKey] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')
  const isAnyLoading = !!loadingKey

  const isFiltering = search.trim() !== '' || activeFilter !== 'all'

  const filteredTemplates = useMemo(() => {
    const base = isFiltering ? ALL_TEMPLATES : showAll ? ALL_TEMPLATES : POPULAR_TEMPLATES
    return base.filter((tmpl) => {
      const matchesFilter = activeFilter === 'all' || tmpl.intent === activeFilter
      const matchesSearch = search.trim() === '' ||
        tmpl.description.toLowerCase().includes(search.trim().toLowerCase())
      return matchesFilter && matchesSearch
    })
  }, [search, activeFilter, showAll, isFiltering])

  const handleTemplateClick = async (templateKey: string, description: string) => {
    setLoadingKey(templateKey)
    const formData = new FormData()
    formData.append('rawInput', description)
    formData.append('templateKey', templateKey)
    formData.append('language', 'fr')
    try {
      await createRequestFromText(formData)
    } catch {
      setLoadingKey(null)
    }
  }

  const clearSearch = () => {
    setSearch('')
    setActiveFilter('all')
  }

  return (
    <section id="templates" className="bg-gray-50 px-4 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 text-center">
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            {t('hero.title')}
            <br />
            <span className="text-gray-400">{t('hero.titleHighlight')}</span>
          </h1>
          <p className="text-gray-500">{t('hero.subtitle')}</p>
        </div>

        {/* Search + filters */}
        <div className="mb-5 space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('hero.searchPlaceholder')}
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-10 text-sm text-gray-900 placeholder-gray-400 shadow-sm outline-none transition-colors focus:border-gray-400 focus:ring-0"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {FILTER_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveFilter(key)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  activeFilter === key
                    ? 'bg-gray-900 text-white'
                    : 'border border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                {t(`filters.${key}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {filteredTemplates.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template) => {
              const isLoading = loadingKey === template.key

              return (
                <button
                  key={template.key}
                  onClick={() => handleTemplateClick(template.key, template.description)}
                  disabled={isAnyLoading}
                  className={`group flex w-full flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition-all duration-200 disabled:cursor-not-allowed ${
                    isLoading
                      ? 'border-gray-300 shadow-md'
                      : 'hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl ${template.iconBg}`}>
                      {template.emoji}
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${template.badgeColor}`}>
                      {tIntents(template.badge as Parameters<typeof tIntents>[0])}
                    </span>
                  </div>

                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{tTemplates(template.key as Parameters<typeof tTemplates>[0])}</p>
                  </div>

                  <div className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                    isLoading ? 'text-gray-700' : 'text-gray-400 group-hover:text-gray-700'
                  }`}>
                    {isLoading ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        {t('hero.loading')}
                      </>
                    ) : (
                      <>
                        {t('hero.useTemplate')}
                        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                      </>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-12 text-center">
            <p className="font-medium text-gray-500">{t('hero.noResults')}</p>
            <p className="mt-1 text-sm text-gray-400">{t('hero.noResultsHint')}</p>
            <button
              type="button"
              onClick={clearSearch}
              className="mt-4 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-700"
            >
              {t('hero.reset')}
            </button>
          </div>
        )}

        {/* Show more / less — only when not filtering */}
        {!isFiltering && EXTENDED_TEMPLATES.length > 0 && (
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              disabled={isAnyLoading}
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-500 shadow-sm transition-colors hover:border-gray-300 hover:text-gray-700 disabled:opacity-50"
            >
              {showAll ? (
                <>
                  {t('hero.showLess')}
                  <ChevronDown className="h-4 w-4 rotate-180 transition-transform" />
                </>
              ) : (
                <>
                  {t('hero.showMore', { count: EXTENDED_TEMPLATES.length })}
                  <ChevronDown className="h-4 w-4 transition-transform" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
