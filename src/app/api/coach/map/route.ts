import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

// ZIP centroid cache (Fredericksburg area focus)
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
  // Manager-only — ADMIN role required
  const session = await getSession()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  // Fetch household primaries (and solo members with no household) with a zip
  const members = await prisma.member.findMany({
    where: {
      zip: { not: null },
      OR: [
        { isHouseholdPrimary: true },
        { householdId: null },
      ],
    },
    select: {
      firstName: true,
      lastName: true,
      zip: true,
      status: true,
    },
  })

  const result: { name: string; zip: string; status: string; lat: number; lng: number }[] = []

  for (const m of members) {
    const zip = m.zip?.trim().slice(0, 5) ?? ''
    const coords = ZIP_COORDS[zip]
    if (!zip || !coords) continue
    result.push({
      name: `${m.firstName} ${m.lastName}`,
      zip,
      status: m.status,
      lat: coords[0],
      lng: coords[1],
    })
  }

  return NextResponse.json(result)
}
