import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

// Prefix to namespace set-password tokens in the VerificationToken table
const SET_PASSWORD_PREFIX = 'set-password:';
const TOKEN_TTL_HOURS = 24;

/** Generate a secure set-password token and store it in VerificationToken. */
export async function createSetPasswordToken(email: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const identifier = `${SET_PASSWORD_PREFIX}${email}`;
  const expires = new Date(Date.now() + TOKEN_TTL_HOURS * 60 * 60 * 1000);

  // Delete any existing token for this email (re-send safety)
  await prisma.verificationToken.deleteMany({ where: { identifier } });

  await prisma.verificationToken.create({
    data: { identifier, token, expires },
  });

  return token;
}

/** Validate token. Returns email if valid. Deletes token on use (one-time). */
export async function consumeSetPasswordToken(token: string): Promise<string> {
  const record = await prisma.verificationToken.findUnique({ where: { token } });

  if (!record) throw new Error('Invalid or expired link.');
  if (!record.identifier.startsWith(SET_PASSWORD_PREFIX)) throw new Error('Invalid token type.');
  if (record.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token } });
    throw new Error('This link has expired. Please contact us for a new one.');
  }

  // Consume — one-time use
  await prisma.verificationToken.delete({ where: { token } });

  return record.identifier.slice(SET_PASSWORD_PREFIX.length);
}
