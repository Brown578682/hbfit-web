import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/coaches
 * Public endpoint — returns active coaches with bio, title, photo.
 * No auth required (used on the onboarding wizard).
 */
export async function GET() {
  const coaches = await prisma.staff.findMany({
    where: { isActive: true },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      title: true,
      bio: true,
      photoUrl: true,
    },
    orderBy: { firstName: "asc" },
  });
  return NextResponse.json(coaches);
}
