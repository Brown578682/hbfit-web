// GET /api/classes/slots — all active schedule slots (public)
import { NextResponse } from 'next/server'
import { getAllActiveSlots } from '@/lib/schedule-db'

export const runtime = 'nodejs'

export async function GET() {
  const slots = await getAllActiveSlots()
  return NextResponse.json(slots)
}
