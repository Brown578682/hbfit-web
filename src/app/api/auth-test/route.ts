import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  const logs: string[] = []
  const t = (label: string) => { logs.push(`[${Date.now()}] ${label}`) }

  try {
    t('start')
    const { email, password } = await req.json()
    t('parsed body')

    const user = await Promise.race([
      prisma.user.findFirst({
        where: { email: { equals: email, mode: 'insensitive' } },
        select: { id: true, email: true, passwordHash: true, role: true },
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('DB_TIMEOUT after 8s')), 8000)),
    ]) as any
    t(`db query done — found: ${!!user}`)

    if (!user || !user.passwordHash) {
      return NextResponse.json({ ok: false, logs, reason: 'no user or no hash' })
    }

    const valid = await Promise.race([
      bcrypt.compare(password, user.passwordHash),
      new Promise((_, reject) => setTimeout(() => reject(new Error('BCRYPT_TIMEOUT after 5s')), 5000)),
    ]) as boolean
    t(`bcrypt done — valid: ${valid}`)

    return NextResponse.json({ ok: valid, logs, email: user.email, role: user.role })
  } catch (err: any) {
    t(`ERROR: ${err.message}`)
    return NextResponse.json({ ok: false, logs, error: err.message }, { status: 500 })
  }
}
