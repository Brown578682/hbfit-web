export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { MemberStatus } from "@prisma/client";
import MembersClient from "./MembersClient";

// ── Server component: fetch initial data ──────────────────────────────────────

async function getInitialData() {
  const [members, statusCounts] = await Promise.all([
    prisma.member.findMany({
      include: {
        user: { select: { email: true } },
        memberships: {
          where: { status: "ACTIVE" },
          include: { plan: { select: { name: true } } },
          take: 1,
        },
      },
      orderBy: { joinedAt: "desc" },
      take: 50,
    }),
    prisma.member.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
  ]);

  const memberData = members.map((m) => ({
    id: m.id,
    firstName: m.firstName,
    lastName: m.lastName,
    email: m.user.email,
    phone: m.phone ?? "",
    status: m.status as string,
    joinedAt: m.joinedAt.toISOString(),
    lastVisit: m.lastVisit ? m.lastVisit.toISOString() : null,
    planName: m.memberships[0]?.plan?.name ?? null,
    gapEligible: m.gapEligible,
  }));

  const counts: Record<string, number> = {};
  for (const row of statusCounts) {
    counts[row.status] = row._count.status;
  }

  return { members: memberData, counts };
}

export default async function MembersPage() {
  const { members, counts } = await getInitialData();

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <MembersClient
      initialMembers={members}
      initialTotal={total}
      statusCounts={counts}
    />
  );
}
