'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { FileText, LogOut, LayoutDashboard } from 'lucide-react'

interface NavbarProps {
  userEmail?: string | null
}

export function Navbar({ userEmail }: NavbarProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-900">
            <FileText className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-gray-900">dealWithIt</span>
        </Link>

        <div className="flex items-center gap-2">
          {userEmail ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Mes lettres</span>
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="gap-1.5 text-gray-500"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Déconnexion</span>
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Connexion</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-gray-900 hover:bg-gray-800">
                  Commencer
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
