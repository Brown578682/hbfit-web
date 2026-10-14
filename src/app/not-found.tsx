'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

// App-area prefixes that have their own full-page layouts — no public nav/footer
const APP_PREFIXES = ['/coach', '/dashboard', '/admin', '/onboarding', '/set-password', '/kiosk', '/login']

export default function NotFound() {
  const pathname = usePathname()
  const isAppArea = APP_PREFIXES.some(p => pathname?.startsWith(p))

  if (isAppArea) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="font-montserrat text-xs uppercase tracking-widest text-zinc-500 mb-3">404</p>
          <h1 className="font-montserrat font-black text-2xl uppercase mb-4">Page Not Found</h1>
          <Link href="/coach" className="text-zinc-400 hover:text-white text-sm underline transition-colors">
            ← Back to Portal
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <p className="font-montserrat text-xs uppercase tracking-widest text-zinc-500 mb-3">404</p>
        <h1 className="font-montserrat font-black text-2xl uppercase mb-4">Page Not Found</h1>
        <Link href="/" className="text-zinc-400 hover:text-white text-sm underline transition-colors">
          ← Back to Home
        </Link>
      </div>
    </div>
  )
}
