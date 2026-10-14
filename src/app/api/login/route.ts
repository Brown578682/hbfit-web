import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { encode } from 'next-auth/jwt'

export async function POST(req: Request) {
  try {
    const { email, username, password } = await req.json()

    // Support login by email OR username (for minor accounts)
    let user: { id: string; email: string | null; username: string | null; name: string | null; passwordHash: string | null; role: string } | null = null

    if (email) {
      user = await prisma.user.findFirst({
        where: { email: { equals: email.trim(), mode: 'insensitive' } },
        select: { id: true, email: true, username: true, name: true, passwordHash: true, role: true },
      })
    } else if (username) {
      user = await prisma.user.findFirst({
        where: { username: { equals: username.trim(), mode: 'insensitive' } },
        select: { id: true, email: true, username: true, name: true, passwordHash: true, role: true },
      })
    }

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Build JWT token — use username as identifier if no email
    const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET!
    const token = await encode({
      token: {
        sub:      user.id,
        email:    user.email ?? undefined,
        name:     user.name,
        role:     user.role,
      },
      secret,
      salt: process.env.NODE_ENV === 'production'
        ? '__Secure-authjs.session-token'
        : 'authjs.session-token',
    })

    const isProd     = process.env.NODE_ENV === 'production'
    const cookieName = isProd ? '__Secure-authjs.session-token' : 'authjs.session-token'

    const res = NextResponse.json({ ok: true, role: user.role })
    res.cookies.set(cookieName, token, {
      httpOnly: true,
      secure:   isProd,
      sameSite: 'lax',
      path:     '/',
      maxAge:   60 * 60 * 24 * 30,
    })

    return res
  } catch (err: any) {
    console.error('Login error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
