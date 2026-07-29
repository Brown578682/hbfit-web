import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MemberStatus } from "@prisma/client";

// ---------------------------------------------------------------------------
// GET /api/admin/members
// Query params: search, status (ACTIVE|PENDING|INACTIVE|LEAD|VISITOR|all),
//               limit (default 50), offset (default 0)
// ---------------------------------------------------------------------------
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const search = searchParams.get("search") ?? "";
  const statusParam = searchParams.get("status") ?? "all";
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50", 10), 200);
  const offset = parseInt(searchParams.get("offset") ?? "0", 10);

  // Build status filter
  const statusFilter =
    statusParam !== "all" &&
    Object.values(MemberStatus).includes(statusParam as MemberStatus)
      ? (statusParam as MemberStatus)
      : undefined;

  // Build search filter
  const searchFilter = search
    ? {
        OR: [
          { firstName: { contains: search, mode: "insensitive" as const } },
          { lastName: { contains: search, mode: "insensitive" as const } },
          {
            user: {
              email: { contains: search, mode: "insensitive" as const },
            },
          },
        ],
      }
    : {};

  const where = {
    ...searchFilter,
    ...(statusFilter ? { status: statusFilter } : {}),
  };

  const [members, total] = await Promise.all([
    prisma.member.findMany({
      where,
      include: {
        user: { select: { email: true } },
        memberships: {
          where: { status: "ACTIVE" },
          include: { plan: { select: { name: true } } },
          take: 1,
        },
      },
      orderBy: { joinedAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.member.count({ where }),
  ]);

  const result = members.map((m) => ({
    id: m.id,
    firstName: m.firstName,
    lastName: m.lastName,
    email: m.user.email,
    phone: m.phone ?? "",
    status: m.status,
    joinedAt: m.joinedAt.toISOString(),
    lastVisit: m.lastVisit ? m.lastVisit.toISOString() : null,
    planName: m.memberships[0]?.plan?.name ?? null,
    gapEligible: m.gapEligible,
  }));

  return NextResponse.json({ members: result, total });
}
