// Shared schedule data — single source of truth for both UI and booking API
// Capacities: S&C = 12, Homeschool Heroes = 10

export type ScheduleSlot = {
  id: string
  type: 'SC' | 'HH'           // SC = Strength & Conditioning, HH = Homeschool Heroes
  typeName: string
  instructor: string
  time: string                 // display string e.g. "5:00 AM"
  startHour: number            // 24h hour
  startMinute: number
  durationMin: number          // always 60
  days: number[]               // 0=Sun, 1=Mon … 6=Sat
  capacity: number
}

export const SCHEDULE_DATA: ScheduleSlot[] = [
  { id: 's1', type: 'SC', typeName: 'Strength & Conditioning Group Class', instructor: 'Heather Traves', time: '5:00 AM',  startHour: 5,  startMinute: 0,  durationMin: 60, days: [1,2,3,4,5], capacity: 12 },
  { id: 's2', type: 'SC', typeName: 'Strength & Conditioning Group Class', instructor: 'Heather Traves', time: '6:00 AM',  startHour: 6,  startMinute: 0,  durationMin: 60, days: [1,2,3,4,5], capacity: 12 },
  { id: 's3', type: 'SC', typeName: 'Strength & Conditioning Group Class', instructor: 'Heather Traves', time: '9:30 AM',  startHour: 9,  startMinute: 30, durationMin: 60, days: [1,2,3,4,5], capacity: 12 },
  { id: 's4', type: 'HH', typeName: 'Homeschool Heroes',                  instructor: 'Randy Franklin',  time: '1:00 PM',  startHour: 13, startMinute: 0,  durationMin: 60, days: [2,4],       capacity: 10 },
  { id: 's5', type: 'SC', typeName: 'Strength & Conditioning Group Class', instructor: 'Heather Traves', time: '4:00 PM',  startHour: 16, startMinute: 0,  durationMin: 60, days: [1,2,3,4,5], capacity: 12 },
  { id: 's6', type: 'SC', typeName: 'Strength & Conditioning Group Class', instructor: 'Heather Traves', time: '5:00 PM',  startHour: 17, startMinute: 0,  durationMin: 60, days: [1,2,3,4,5], capacity: 12 },
  { id: 's7', type: 'SC', typeName: 'Strength & Conditioning Group Class', instructor: 'Randy Franklin',  time: '6:00 PM',  startHour: 18, startMinute: 0,  durationMin: 60, days: [1,4],       capacity: 12 },
  { id: 's8', type: 'SC', typeName: 'Strength & Conditioning Group Class', instructor: 'Randy Franklin',  time: '8:30 AM',  startHour: 8,  startMinute: 30, durationMin: 60, days: [6],         capacity: 12 },
]

// Given a slot + a specific date, return start/end DateTime in UTC
// dateStr = 'YYYY-MM-DD' in Eastern time
export function slotToDateTimes(slot: ScheduleSlot, dateStr: string): { startTime: Date; endTime: Date } {
  // Parse as Eastern time (America/New_York)
  // Use the offset-aware approach: build ISO string with timezone
  const start = new Date(`${dateStr}T${pad(slot.startHour)}:${pad(slot.startMinute)}:00`)
  const end   = new Date(start.getTime() + slot.durationMin * 60 * 1000)
  return { startTime: start, endTime: end }
}

function pad(n: number) { return n.toString().padStart(2, '0') }

// Returns the next N occurrences of a slot starting from today
export function getUpcomingDates(slot: ScheduleSlot, fromDate: Date, days = 14): string[] {
  const dates: string[] = []
  const cursor = new Date(fromDate)
  cursor.setHours(0, 0, 0, 0)
  for (let i = 0; i < days && dates.length < days; i++) {
    const dow = cursor.getDay()
    if (slot.days.includes(dow)) {
      dates.push(cursor.toISOString().slice(0, 10))
    }
    cursor.setDate(cursor.getDate() + 1)
  }
  return dates
}

export function getSlotById(id: string): ScheduleSlot | undefined {
  return SCHEDULE_DATA.find(s => s.id === id)
}
