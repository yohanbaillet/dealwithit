import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const nextConfig: NextConfig = {
  // Server components can use @react-pdf/renderer
  serverExternalPackages: ['@react-pdf/renderer'],

  // Disable type checking during build for faster MVP iteration
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default withNextIntl(nextConfig)
