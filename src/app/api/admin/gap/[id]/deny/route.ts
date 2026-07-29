import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MemberStatus } from "@prisma/client";

// ---------------------------------------------------------------------------
// POST /api/admin/gap/[id]/deny
// ---------------------------------------------------------------------------
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const member = await prisma.member.findUnique({ where: { id } });
  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  let note = "";
  try {
    const body = await req.json();
    if (body?.note) note = body.note;
  } catch {
    // no body
  }

  await prisma.member.update({
    where: { id },
    data: {
      status: MemberStatus.INACTIVE,
      notes: note
        ? `GAP denied: ${note}`
        : `${member.notes ? member.notes + "\n" : ""}GAP application denied.`,
    },
  });

  return NextResponse.json({ ok: true });
}
