import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { memberId, message } = body as { memberId?: string; message?: string };

    if (!memberId || typeof memberId !== "string") {
      return NextResponse.json({ error: "memberId is required" }, { status: 400 });
    }
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }
    if (message.trim().length > 2000) {
      return NextResponse.json({ error: "Message is too long (max 2000 characters)" }, { status: 400 });
    }

    const record = await prisma.kioskMessage.create({
      data: {
        memberId,
        message: message.trim(),
      },
    });

    return NextResponse.json({ ok: true, id: record.id }, { status: 201 });
  } catch (err) {
    console.error("[kiosk/message] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
