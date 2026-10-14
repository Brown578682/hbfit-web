import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MemberStatus } from "@prisma/client";

// ---------------------------------------------------------------------------
// GET /api/admin/gap
// Returns:
//   applicants  — gapEligible + PENDING (needs review)
//   awaitingBilling — gapEligible + ACTIVE but no stripeSubscriptionId on
//                     any of their Membership rows (approved, not paid yet)
// ---------------------------------------------------------------------------
export async function GET() {
  const [applicants, awaitingBilling] = await Promise.all([
    // Pending: needs admin review
    prisma.member.findMany({
      where: {
        gapEligible: true,
        status: MemberStatus.PENDING,
      },
      include: { user: { select: { email: true } } },
      orderBy: { joinedAt: "asc" },
    }),

    // Approved but no Stripe sub yet — these members have no saved payment method
    // (they applied before the setup-session flow was live)
    prisma.member.findMany({
      where: {
        gapEligible: true,
        status: MemberStatus.ACTIVE,
        memberships: {
          none: { stripeSubscriptionId: { not: null } },
        },
      },
      include: {
        user: { select: { email: true } },
      },
      orderBy: { gapVerifiedAt: "asc" },
    }),
  ]);

  const mapApplicant = (m: typeof applicants[0]) => ({
    id: m.id,
    firstName: m.firstName,
    lastName: m.lastName,
    email: m.user?.email ?? "",
    phone: m.phone ?? "",
    joinedAt: m.joinedAt.toISOString(),
    gapCategory: m.gapCategory,
    gapDocumentUrl: m.gapDocumentUrl ?? null,
  });

  const mapAwaiting = (m: typeof awaitingBilling[0]) => ({
    id: m.id,
    firstName: m.firstName,
    lastName: m.lastName,
    email: m.user?.email ?? "",
    phone: m.phone ?? "",
    approvedAt: m.gapVerifiedAt?.toISOString() ?? m.joinedAt.toISOString(),
    gapVerifiedBy: m.gapVerifiedBy ?? "Admin",
  });

  return NextResponse.json({
    applicants: applicants.map(mapApplicant),
    total: applicants.length,
    awaitingBilling: awaitingBilling.map(mapAwaiting),
  });
}
