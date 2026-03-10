import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Server components can use @react-pdf/renderer
  serverExternalPackages: ['@react-pdf/renderer'],

  // Disable type checking during build for faster MVP iteration
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
