// GET /api/admin/booth/leads  — CSV export (admin + coach)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session || !['ADMIN', 'COACH'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const format = searchParams.get('format') ?? 'json'

  const leads = await (prisma as any).boothLead.findMany({
    orderBy: { createdAt: 'desc' },
  })

  if (format === 'csv') {
    const header = 'ID,First Name,Last Name,Email,Phone,Waiver Signed,Marketing Opt-In,Notes,Source,Date\n'
    const rows = leads.map((l: any) =>
      [
        l.id,
        `"${l.firstName}"`,
        `"${l.lastName}"`,
        l.email,
        `"${l.phone}"`,
        l.waiverSigned ? 'Yes' : 'No',
        l.marketingOptIn ? 'Yes' : 'No',
        `"${(l.notes ?? '').replace(/"/g, '""')}"`,
        l.source,
        new Date(l.createdAt).toLocaleString('en-US', { timeZone: 'America/New_York' }),
      ].join(',')
    ).join('\n')

    return new NextResponse(header + rows, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="booth-leads-${new Date().toISOString().slice(0,10)}.csv"`,
      },
    })
  }

  return NextResponse.json({ leads, total: leads.length })
}
