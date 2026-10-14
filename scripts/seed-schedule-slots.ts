/**
 * Seed ScheduleSlot table from schedule-data.ts (one-time migration).
 * Safe to re-run — upserts on slotKey.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { SCHEDULE_DATA } from '../src/lib/schedule-data'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false },
})
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

const INSTRUCTOR_MAP: Record<string, string> = {
  'Heather Traves': 'cms66k9k100056ajh91nun469',
  'Randy Franklin':  'cms66k9cf00036ajhousdzylx',
}

async function main() {
  // Build classType name → id map
  const classTypes = await prisma.classType.findMany({ select: { id: true, name: true } })
  const ctMap: Record<string, string> = {}
  for (const ct of classTypes) ctMap[ct.name] = ct.id

  for (const slot of SCHEDULE_DATA) {
    const classTypeId = ctMap[slot.typeName]
    if (!classTypeId) {
      console.warn(`  ⚠ No ClassType found for "${slot.typeName}" — skipping ${slot.id}`)
      continue
    }
    const instructorId = slot.instructor ? (INSTRUCTOR_MAP[slot.instructor] ?? null) : null

    await prisma.scheduleSlot.upsert({
      where: { slotKey: slot.id },
      create: {
        slotKey:     slot.id,
        classTypeId,
        instructorId,
        startHour:   slot.startHour,
        startMinute: slot.startMinute,
        durationMin: slot.durationMin,
        days:        slot.days,
        capacity:    slot.capacity,
        isActive:    true,
      },
      update: {
        classTypeId,
        instructorId,
        startHour:   slot.startHour,
        startMinute: slot.startMinute,
        durationMin: slot.durationMin,
        days:        slot.days,
        capacity:    slot.capacity,
      },
    })
    console.log(`  ✓ ${slot.id}: ${slot.typeName} @ ${slot.time} (${slot.instructor || 'unassigned'})`)
  }

  const count = await prisma.scheduleSlot.count()
  console.log(`\nDone. ${count} slots in DB.`)
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => pool.end())
