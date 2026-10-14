import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendContactNotificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if (message.trim().length > 2000) {
      return NextResponse.json({ error: "Message is too long (max 2000 characters)." }, { status: 400 });
    }

    await prisma.contactMessage.create({
      data: {
        name:    name.trim(),
        email:   email.trim().toLowerCase(),
        subject: subject?.trim() || null,
        message: message.trim(),
      },
    });

    // Fire-and-forget notification email to admin
    sendContactNotificationEmail({
      name:    name.trim(),
      email:   email.trim().toLowerCase(),
      subject: subject?.trim() || null,
      message: message.trim(),
    }).catch((err) => console.error("[contact] notification email failed:", err));

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("[contact] error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
