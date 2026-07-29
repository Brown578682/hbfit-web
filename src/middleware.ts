import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const { nextUrl } = req
  const session = await auth()
  const isLoggedIn = !!session?.user
  const userRole = (session?.user as any)?.role as string | undefined

  // /admin — ADMIN only
  if (nextUrl.pathname.startsWith('/admin')) {
    if (!isLoggedIn) return NextResponse.redirect(new URL('/login?from=admin', nextUrl))
    if (userRole !== 'ADMIN') return NextResponse.redirect(new URL('/', nextUrl))
  }

  // /coach — COACH or ADMIN
  if (nextUrl.pathname.startsWith('/coach')) {
    if (!isLoggedIn) return NextResponse.redirect(new URL('/login?from=coach', nextUrl))
    if (userRole !== 'COACH' && userRole !== 'ADMIN') return NextResponse.redirect(new URL('/', nextUrl))
  }

  // /dashboard — any authenticated user
  if (nextUrl.pathname.startsWith('/dashboard')) {
    if (!isLoggedIn) return NextResponse.redirect(new URL('/login', nextUrl))
  }

  // /onboarding — any authenticated user
  if (nextUrl.pathname.startsWith('/onboarding')) {
    if (!isLoggedIn) return NextResponse.redirect(new URL('/login', nextUrl))
  }

  // /api/admin — ADMIN only
  if (nextUrl.pathname.startsWith('/api/admin')) {
    if (!isLoggedIn || userRole !== 'ADMIN')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // /api/coach — COACH or ADMIN
  if (nextUrl.pathname.startsWith('/api/coach')) {
    if (!isLoggedIn || (userRole !== 'COACH' && userRole !== 'ADMIN'))
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/coach/:path*', '/dashboard/:path*', '/onboarding/:path*', '/onboarding', '/api/admin/:path*', '/api/coach/:path*'],
}
