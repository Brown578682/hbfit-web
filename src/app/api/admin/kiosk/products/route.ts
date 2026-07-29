import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const products = await prisma.kioskProduct.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.name || !body.priceCents) {
    return NextResponse.json({ error: "name and priceCents required" }, { status: 400 });
  }
  const product = await prisma.kioskProduct.create({ data: body });
  return NextResponse.json(product, { status: 201 });
}
