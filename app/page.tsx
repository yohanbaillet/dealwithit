import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { ExampleCards } from '@/components/landing/ExampleCards'
import { TrustBanner } from '@/components/landing/TrustBanner'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar userEmail={user?.email} />
      <main className="flex-1">
        <ExampleCards />
        <TrustBanner />
      </main>
      <footer className="border-t border-gray-100 py-6 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} dealWithIt · Vos lettres administratives simplifiées
      </footer>
    </div>
  )
}
