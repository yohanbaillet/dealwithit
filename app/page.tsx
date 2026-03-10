import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
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
      <Footer />
    </div>
  )
}
