import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/kiosk/checkin
 * Body: { memberId: string }
 * Records a kiosk check-in and updates lastVisit.
 */
export async function POST(req: NextRequest) {
  try {
    const { memberId } = await req.json() as { memberId?: string };
    if (!memberId) {
      return NextResponse.json({ error: "memberId required" }, { status: 400 });
    }

    const [checkIn] = await prisma.$transaction([
      prisma.checkIn.create({
        data: { memberId, method: "kiosk" },
      }),
      prisma.member.update({
        where: { id: memberId },
        data: { lastVisit: new Date() },
      }),
    ]);

    return NextResponse.json({ ok: true, checkInId: checkIn.id });
  } catch (err) {
    console.error("[kiosk/checkin]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
