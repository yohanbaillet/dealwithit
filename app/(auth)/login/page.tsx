'use client'

export const dynamic = 'force-dynamic'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GoogleButton } from '@/components/auth/GoogleButton'
import { FileText, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    router.push(redirectTo)
    router.refresh()
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900">dealWithIt</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Bon retour</h1>
          <p className="mt-1 text-gray-500">Connectez-vous à votre compte</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <GoogleButton redirectTo={redirectTo} />

          <div className="my-4 flex items-center gap-3">
            <div className="flex-1 border-t border-gray-100" />
            <span className="text-xs text-gray-400">ou</span>
            <div className="flex-1 border-t border-gray-100" />
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="vous@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gray-900 hover:bg-gray-800"
              disabled={loading}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-gray-500">
          Pas encore de compte ?{' '}
          <Link href="/signup" className="font-medium text-gray-900 hover:underline">
            Créer un compte
          </Link>
        </p>

        <div className="mt-6 text-center">
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600">
            <ArrowLeft className="h-3 w-3" />
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
