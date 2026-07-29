import { decode } from 'next-auth/jwt'
import { cookies } from 'next/headers'

export interface SessionUser {
  id: string
  email: string
  name?: string | null
  role: string
}

export async function getSession(): Promise<{ user: SessionUser } | null> {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET
  if (!secret) return null

  const isProd = process.env.NODE_ENV === 'production'
  const cookieName = isProd
    ? '__Secure-authjs.session-token'
    : 'authjs.session-token'

  const cookieStore = await cookies()
  const cookieValue = cookieStore.get(cookieName)?.value
  if (!cookieValue) return null

  try {
    const token = await decode({
      token: cookieValue,
      secret,
      salt: cookieName,
    }) as any

    if (!token?.sub) return null

    return {
      user: {
        id: token.sub,
        email: token.email,
        name: token.name,
        role: token.role ?? 'MEMBER',
      },
    }
  } catch {
    return null
  }
}
