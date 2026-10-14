// DB-backed replacement for schedule-data.ts getSlotById()
// All booking/availability APIs should use this instead of the static file.

import { prisma } from '@/lib/prisma'

export interface DBSlot {
  id: string          // = slotKey (e.g. 's1', 'og1') — used as slotId everywhere
  typeName: string    // classType.name
  instructor: string  // 'First Last' or ''
  instructorId: string | null  // Staff.id for ClassSession.instructorId
  time: string        // formatted '5:00 AM'
  startHour: number
  startMinute: number
  durationMin: number
  days: number[]
  capacity: number
}

function formatTime(hour: number, minute: number): string {
  const period = hour < 12 ? 'AM' : 'PM'
  const h = hour % 12 === 0 ? 12 : hour % 12
  const m = minute === 0 ? '' : `:${minute.toString().padStart(2, '0')}`
  return `${h}${m} ${period}`
}

export async function getSlotByKey(slotKey: string): Promise<DBSlot | null> {
  const slot = await prisma.scheduleSlot.findFirst({
    where: { slotKey, isActive: true },
    include: {
      classType:  { select: { name: true } },
      instructor: { select: { firstName: true, lastName: true } },
    },
  })
  if (!slot) return null
  return {
    id:          slot.slotKey,
    typeName:    slot.classType.name,
    instructor:  slot.instructor ? `${slot.instructor.firstName} ${slot.instructor.lastName}` : '',
    instructorId: slot.instructorId ?? null,
    time:        formatTime(slot.startHour, slot.startMinute),
    startHour:   slot.startHour,
    startMinute: slot.startMinute,
    durationMin: slot.durationMin,
    days:        slot.days,
    capacity:    slot.capacity,
  }
}

export async function getAllActiveSlots(): Promise<DBSlot[]> {
  const slots = await prisma.scheduleSlot.findMany({
    where: { isActive: true },
    orderBy: [{ startHour: 'asc' }, { startMinute: 'asc' }],
    include: {
      classType:  { select: { name: true } },
      instructor: { select: { firstName: true, lastName: true } },
    },
  })
  return slots.map(slot => ({
    id:          slot.slotKey,
    typeName:    slot.classType.name,
    instructor:  slot.instructor ? `${slot.instructor.firstName} ${slot.instructor.lastName}` : '',
    instructorId: slot.instructorId ?? null,
    time:        formatTime(slot.startHour, slot.startMinute),
    startHour:   slot.startHour,
    startMinute: slot.startMinute,
    durationMin: slot.durationMin,
    days:        slot.days,
    capacity:    slot.capacity,
  }))
}
