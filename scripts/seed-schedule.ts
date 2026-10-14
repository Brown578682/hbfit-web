/**
 * Seed ClassSession rows from ScheduleSlot table (DB-driven, respects isActive).
 * Generates sessions for N days from today. Safe to re-run — skips existing sessions.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false },
})
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

const DAYS_AHEAD = parseInt(process.env.DAYS_AHEAD ?? '28', 10)

async function main() {
  // Only generate from active slots
  const slots = await prisma.scheduleSlot.findMany({
    where: { isActive: true },
    include: {
      classType: { select: { name: true } },
      instructor: { select: { firstName: true, lastName: true } },
    },
  })

  console.log(`Generating sessions from ${slots.length} active slots, ${DAYS_AHEAD} days ahead...`)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let created = 0, skipped = 0

  for (const slot of slots) {
    for (let i = 0; i < DAYS_AHEAD; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() + i)
      const dow = date.getDay()
      if (!slot.days.includes(dow)) continue

      const startTime = new Date(date)
      startTime.setHours(slot.startHour, slot.startMinute, 0, 0)
      const endTime = new Date(startTime.getTime() + slot.durationMin * 60 * 1000)

      const exists = await prisma.classSession.findFirst({
        where: { classTypeId: slot.classTypeId, startTime },
      })
      if (exists) { skipped++; continue }

      await prisma.classSession.create({
        data: {
          classTypeId:   slot.classTypeId,
          instructorId:  slot.instructorId,
          startTime,
          endTime,
          capacity:      slot.capacity,
          scheduleSlotId: slot.slotKey,
          isCanceled:    false,
        },
      })
      created++
    }
  }

  console.log(`Done. Created ${created} sessions, skipped ${skipped} existing.`)
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => pool.end())
