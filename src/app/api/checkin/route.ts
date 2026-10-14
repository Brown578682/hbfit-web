import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/checkin  { code: "0386" }
// Accepts the member's 4-digit memberCode (kiosk PIN pad) or legacy checkInCode.
// Writes a real CheckIn row to the DB.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { code?: unknown };
    const raw = typeof body.code === 'string' ? body.code.trim() : null;

    if (!raw) {
      return NextResponse.json({ success: false, error: 'Missing check-in code' }, { status: 400 });
    }

    // Try memberCode first (4-digit numeric), then legacy checkInCode
    const member = await prisma.member.findFirst({
      where: {
        OR: [
          { memberCode: raw },
          { checkInCode: raw },
          { checkInCode: raw.toUpperCase() },
        ],
      },
      include: {
        memberships: {
          where: { status: 'ACTIVE' },
          include: { plan: { select: { name: true } } },
          take: 1,
        },
      },
    });

    if (!member) {
      return NextResponse.json(
        { success: false, error: 'Code not recognised. Please try again or see the front desk.' },
        { status: 404 },
      );
    }

    if (member.status === 'INACTIVE' || member.status === 'SUSPENDED') {
      return NextResponse.json(
        { success: false, error: 'Membership inactive. Please see the front desk.' },
        { status: 403 },
      );
    }

    if (member.status === 'PENDING' || member.status === 'MIGRATING') {
      return NextResponse.json(
        { success: false, error: 'Membership is being set up. Please see staff.' },
        { status: 403 },
      );
    }

    // Record the check-in
    await prisma.checkIn.create({
      data: {
        memberId: member.id,
        method: 'kiosk',
      },
    });

    // Update lastVisit
    await prisma.member.update({
      where: { id: member.id },
      data: { lastVisit: new Date() },
    });

    const planName = member.memberships[0]?.plan?.name ?? 'Member';

    return NextResponse.json({
      success: true,
      member: {
        firstName: member.firstName,
        lastName: member.lastName,
        membership: planName,
        photoUrl: member.photoUrl ?? null,
      },
      checkedInAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[API /checkin] error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// GET /api/checkin — today's check-in count + recent list (for kiosk footer)
export async function GET() {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const checkIns = await prisma.checkIn.findMany({
      where: { checkedAt: { gte: todayStart } },
      include: { member: { select: { firstName: true, lastName: true } } },
      orderBy: { checkedAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({
      count: checkIns.length,
      checkIns: checkIns.map(c => ({
        name: `${c.member.firstName} ${c.member.lastName}`,
        time: c.checkedAt,
      })),
    });
  } catch (err) {
    return NextResponse.json({ count: 0, checkIns: [] });
  }
}
