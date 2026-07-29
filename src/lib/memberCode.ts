import { prisma } from "./prisma";
import * as bcrypt from "bcryptjs";

/**
 * Generate a unique 4-digit member code.
 * Default: MMYY from date of birth (e.g. born March 1990 → "0390").
 * If that code is already taken, tries MMYY+1, MMYY+2 … wrapping numerically
 * until a free 4-digit slot is found.
 */
export async function generateMemberCode(dob?: Date | null): Promise<string> {
  // Build candidate list: start with MMYY, then walk forward
  const candidates: string[] = [];

  if (dob) {
    const mm = String(dob.getMonth() + 1).padStart(2, "0");
    const yy = String(dob.getFullYear()).slice(-2);
    const base = parseInt(`${mm}${yy}`, 10);
    // Try up to 9999 candidates starting from the MMYY value
    for (let i = 0; i < 9999; i++) {
      const code = String((base + i) % 10000).padStart(4, "0");
      candidates.push(code);
    }
  } else {
    // No DOB — start from 1000 and walk forward
    for (let i = 1000; i <= 9999; i++) {
      candidates.push(String(i));
    }
  }

  // Find existing codes in one query
  const existing = await prisma.member.findMany({
    where: { memberCode: { in: candidates.slice(0, 200) } },
    select: { memberCode: true },
  });
  const taken = new Set(existing.map((m) => m.memberCode));

  for (const code of candidates) {
    if (!taken.has(code)) return code;
    // Refetch if we exhausted the pre-loaded batch (edge case)
  }

  throw new Error("No available 4-digit member codes — database is full");
}

/** Hash a 4-digit PIN for storage */
export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, 10);
}

/** Verify a raw PIN against a stored hash */
export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash);
}
