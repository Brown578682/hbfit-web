import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const { nextUrl } = req

  const token = await getToken({ req, secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET })
  const isLoggedIn = !!token
  const userRole = (token as any)?.role as string | undefined

  // DEV PREVIEW: bypass auth in development
  if (process.env.NODE_ENV === 'development') return NextResponse.next()

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
