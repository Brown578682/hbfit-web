import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSetPasswordToken } from '@/lib/tokens';
import { sendPasswordResetEmail } from '@/lib/email';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
  }

  const normalized = email.toLowerCase().trim();

  // Always return success — never reveal whether an account exists
  const user = await prisma.user.findFirst({
    where: { email: { equals: normalized, mode: 'insensitive' } },
    include: {
      member: { select: { firstName: true } },
    },
  });

  if (user) {
    try {
      const token = await createSetPasswordToken(normalized);
      const setPasswordUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/set-password?token=${token}`;
      const firstName = user.member?.firstName ?? 'there';
      await sendPasswordResetEmail({ to: normalized, firstName, setPasswordUrl });
    } catch (err) {
      console.error('Failed to send password reset email:', err);
    }
  }

  return NextResponse.json({ ok: true });
}
