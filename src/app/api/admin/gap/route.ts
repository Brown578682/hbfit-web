import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MemberStatus } from "@prisma/client";

// ---------------------------------------------------------------------------
// GET /api/admin/gap
// Returns all members where gapEligible=true AND status=PENDING
// ---------------------------------------------------------------------------
export async function GET() {
  const applicants = await prisma.member.findMany({
    where: {
      gapEligible: true,
      status: MemberStatus.PENDING,
    },
    include: {
      user: { select: { email: true } },
    },
    orderBy: { joinedAt: "asc" },
  });

  const result = applicants.map((m) => ({
    id: m.id,
    firstName: m.firstName,
    lastName: m.lastName,
    email: m.user.email,
    phone: m.phone ?? "",
    joinedAt: m.joinedAt.toISOString(),
    gapCategory: m.gapCategory,
    gapDocumentUrl: m.gapDocumentUrl ?? null,
  }));

  return NextResponse.json({ applicants: result, total: result.length });
}
