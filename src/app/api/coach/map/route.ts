import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ZIP centroid cache (add more as needed — Fredericksburg area focus)
const ZIP_COORDS: Record<string, [number, number]> = {
  '22401': [38.3032, -77.4605], '22405': [38.3282, -77.3851], '22406': [38.3956, -77.4397],
  '22407': [38.2693, -77.5188], '22408': [38.2401, -77.4571], '22551': [38.1965, -77.8134],
  '22554': [38.4665, -77.4138], '22560': [37.9554, -76.9438], '22630': [38.9182, -78.1665],
  '22641': [38.9835, -78.3432], '22650': [38.7929, -78.4001], '22655': [39.1926, -78.1695],
  '22656': [39.1848, -78.1418], '22657': [38.9293, -78.3557], '22660': [38.9043, -78.5057],
  '22663': [39.1362, -78.0515], '22664': [38.8554, -78.6257], '20106': [38.7004, -77.9587],
  '20109': [38.7879, -77.5163], '20110': [38.7512, -77.4763], '20111': [38.7318, -77.4271],
  '20112': [38.6540, -77.4293], '20115': [38.8651, -77.8565], '20117': [38.9668, -77.7576],
  '20118': [38.9724, -77.7804], '20119': [38.6268, -77.5440], '20120': [38.8285, -77.4249],
  '20121': [38.8118, -77.4527], '20122': [38.8540, -77.4373],
}

export async function GET() {
  const members = await prisma.member.findMany({
    select: { zip: true, status: true },
    where: { zip: { not: null } },
  })

  // Aggregate by zip + status, no PII
  const byZip: Record<string, { zip: string; lat?: number; lng?: number; active: number; lead: number; inactive: number }> = {}

  for (const m of members) {
    const zip = m.zip?.trim().slice(0, 5) ?? ''
    if (!zip) continue
    if (!byZip[zip]) {
      const coords = ZIP_COORDS[zip]
      byZip[zip] = { zip, lat: coords?.[0], lng: coords?.[1], active: 0, lead: 0, inactive: 0 }
    }
    if (m.status === 'ACTIVE') byZip[zip].active++
    else if (m.status === 'LEAD' || m.status === 'VISITOR' || m.status === 'PENDING') byZip[zip].lead++
    else byZip[zip].inactive++
  }

  return NextResponse.json(Object.values(byZip).filter(z => z.lat && z.lng))
}
