export type EventCategory = 'Charity' | 'Competition' | 'Ruck Progression' | 'Community'

export interface HBFITEvent {
  title: string
  slug: string
  description: string
  /** ISO date string, e.g. "2026-11-22" — required to appear on schedule */
  date?: string
  /** time string for display, e.g. "9:00 AM" */
  time?: string
  location?: string
  entry?: string
  beneficiary?: string
  category: EventCategory
  runsignupUrl?: string
  /** If true, this event is in the past and hidden by default */
  past?: boolean
}

export const events: HBFITEvent[] = [
  // ── Past ────────────────────────────────────────────────────────────────────
  {
    title: 'Ruck Hunger 2026',
    slug: 'ruck-hunger-2026',
    description:
      'A team-based charity ruck march organized by Honor Bound FIT to directly support the Fredericksburg Regional Food Bank and combat food insecurity in our community. Teams collect shelf-stable food donations in advance and physically ruck those donations over a 3-mile route from the launch location to the food bank. The team that delivers the greatest total weight of donated food wins $1,000, a trophy, and bragging rights for the year.',
    date: '2026-04-11',
    location: '1501 Central Park Blvd, Suite 14, Fredericksburg, VA',
    beneficiary: 'Fredericksburg Regional Food Bank',
    category: 'Charity',
    runsignupUrl: 'https://runsignup.com/Race/VA/Fredericksburg/RuckHunger',
    past: true,
  },
  {
    title: '2026 Manion WOD',
    slug: 'manion-wod-2026',
    description:
      "Honor the sacrifice of 1stLt Travis Manion, USMC, by completing the 2026 Manion WOD — a tribute workout uniting veterans, families of the fallen, and inspired civilians. The workout features 7 rounds of a 400-meter run and 29 weighted back squats, with accessible modifications for all fitness levels.",
    date: '2026-04-25',
    location: 'Honor Bound FIT · 45 Centreport Pkwy, Fredericksburg, VA',
    entry: '$34',
    beneficiary: 'Travis Manion Foundation',
    category: 'Charity',
    runsignupUrl: 'https://runsignup.com/Race/VA/Fredericksburg/ManionWODHonorBoundFIT',
    past: true,
  },
  // Ruck Progression — May (past)
  {
    title: 'Ruck Progression: May — 6 Miles',
    slug: 'ruck-progression-may-2026',
    description:
      'Opening event of the 2026 Monthly Ruck Progression series. 6 miles to start building your base for GUIDON22. All experience levels welcome.',
    date: '2026-05-16',
    time: '9:00 AM',
    location: '1501 Central Park Blvd, Fredericksburg, VA',
    entry: 'Free',
    category: 'Ruck Progression',
    runsignupUrl: 'https://runsignup.com/Race/VA/Fredericksburg/MonthlyRuckProgression',
    past: true,
  },
  // Warrior Workout — May (past)
  {
    title: 'Warrior Workout — May',
    slug: 'warrior-workout-may-2026',
    description:
      'Monthly warrior workout hosted by Whiskey Valor Foundation. Each session opens with the reading of a Medal of Honor citation, then drives into a high-intensity circuit of functional movements. Free, open to all.',
    date: '2026-05-09',
    time: '9:00 AM',
    location: 'Fredericksburg, VA',
    entry: 'Free',
    beneficiary: 'Whiskey Valor Foundation',
    category: 'Charity',
    runsignupUrl: 'https://runsignup.com/Race/VA/Fredericksburg/WhiskeyValorFoundationWarriorWorkoutSeries',
    past: true,
  },

  // ── Upcoming ─────────────────────────────────────────────────────────────────
  {
    title: 'Warrior Workout — June',
    slug: 'warrior-workout-jun-2026',
    description:
      'Monthly warrior workout hosted by Whiskey Valor Foundation. Each free session begins with the reading of a Medal of Honor citation or a dedication to a local veteran, then drives into a high-intensity circuit of functional movements designed to test grit, strength, and endurance.',
    date: '2026-06-13',
    time: '9:00 AM',
    location: 'Fredericksburg, VA',
    entry: 'Free',
    beneficiary: 'Whiskey Valor Foundation',
    category: 'Charity',
    runsignupUrl: 'https://runsignup.com/Race/VA/Fredericksburg/WhiskeyValorFoundationWarriorWorkoutSeries',
    past: true,
  },
  {
    title: 'Ruck Progression: June — 9 Miles',
    slug: 'ruck-progression-jun-2026',
    description:
      'Month 2 of the 2026 Ruck Progression. 9 miles — distance increases, so does your readiness. Designed to systematically prepare participants for GUIDON22.',
    date: '2026-06-20',
    time: '7:00 AM',
    location: '1501 Central Park Blvd, Fredericksburg, VA',
    entry: 'Free',
    category: 'Ruck Progression',
    runsignupUrl: 'https://runsignup.com/Race/VA/Fredericksburg/MonthlyRuckProgression',
    past: true,
  },
  {
    title: 'Warrior Workout — July',
    slug: 'warrior-workout-jul-2026',
    description:
      'Monthly warrior workout hosted by Whiskey Valor Foundation. Each free session begins with the reading of a Medal of Honor citation or a dedication to a local veteran, then drives into a high-intensity circuit of functional movements designed to test grit, strength, and endurance.',
    date: '2026-07-11',
    time: '9:00 AM',
    location: 'Fredericksburg, VA',
    entry: 'Free',
    beneficiary: 'Whiskey Valor Foundation',
    category: 'Charity',
    runsignupUrl: 'https://runsignup.com/Race/VA/Fredericksburg/WhiskeyValorFoundationWarriorWorkoutSeries',
    past: true,
  },
  {
    title: 'Ruck Progression: July — 9 Miles Overnight',
    slug: 'ruck-progression-jul-2026',
    description:
      'Month 3 of the 2026 Ruck Progression. 9 miles overnight through historic downtown Fredericksburg. Experience the city under the stars while you earn your miles.',
    date: '2026-07-18',
    time: '7:00 PM',
    location: 'Historic Downtown Fredericksburg, VA',
    entry: 'Free',
    category: 'Ruck Progression',
    runsignupUrl: 'https://runsignup.com/Race/VA/Fredericksburg/MonthlyRuckProgression',
    past: true,
  },
  {
    title: 'Warrior Workout — August',
    slug: 'warrior-workout-aug-2026',
    description:
      'Monthly warrior workout hosted by Whiskey Valor Foundation. Each free session begins with the reading of a Medal of Honor citation or a dedication to a local veteran, then drives into a high-intensity circuit of functional movements designed to test grit, strength, and endurance.',
    date: '2026-08-01',
    time: '9:00 AM',
    location: 'Fredericksburg, VA',
    entry: 'Free',
    beneficiary: 'Whiskey Valor Foundation',
    category: 'Charity',
    runsignupUrl: 'https://runsignup.com/Race/VA/Fredericksburg/WhiskeyValorFoundationWarriorWorkoutSeries',
  },
  {
    title: 'Ruck Progression: August — 12 Miles Overnight',
    slug: 'ruck-progression-aug-2026',
    description:
      'Month 4 of the 2026 Ruck Progression. 12 miles overnight — the longest overnight push yet. Load discipline and foot care are the focus at this distance.',
    date: '2026-08-15',
    time: '7:00 PM',
    location: '1501 Central Park Blvd, Fredericksburg, VA',
    entry: 'Free',
    category: 'Ruck Progression',
    runsignupUrl: 'https://runsignup.com/Race/VA/Fredericksburg/MonthlyRuckProgression',
  },
  {
    title: 'Warrior Workout — September',
    slug: 'warrior-workout-sep-2026',
    description:
      'Final monthly warrior workout of the 2026 season, hosted by Whiskey Valor Foundation. Each free session begins with the reading of a Medal of Honor citation or a dedication to a local veteran, then drives into a high-intensity circuit of functional movements.',
    date: '2026-09-05',
    time: '9:00 AM',
    location: 'Fredericksburg, VA',
    entry: 'Free',
    beneficiary: 'Whiskey Valor Foundation',
    category: 'Charity',
    runsignupUrl: 'https://runsignup.com/Race/VA/Fredericksburg/WhiskeyValorFoundationWarriorWorkoutSeries',
  },
  {
    title: 'Ruck with Pups — Fall Fur Festival',
    slug: 'ruck-with-pups',
    description:
      'A fun, purpose-driven community ruck that brings together people, dogs, and service-minded hearts for a morning of movement and impact. Hosted in partnership by Honor Bound FIT and The Guidon Foundation, supported by Old Dominion Humane Society and the Stafford County Sheriff\'s Office. Participants are invited to carry weight (optional), leash up a pup, and hit the trail together.',
    date: '2026-09-19',
    location: 'John Lee Pratt Park · 120 River Rd, Fredericksburg, VA',
    entry: 'Free',
    beneficiary: 'The Guidon Foundation',
    category: 'Charity',
    runsignupUrl: 'https://runsignup.com/Race/VA/Fredericksburg/RuckWithPups',
  },
  {
    title: 'Ruck Progression: October — 15 Miles',
    slug: 'ruck-progression-oct-2026',
    description:
      'The final event of the 2026 Ruck Progression series and the capstone before GUIDON22. 15 miles — full readiness check. If you\'ve been building since May, this is where it pays off.',
    date: '2026-10-17',
    time: '8:00 AM',
    location: '1501 Central Park Blvd, Fredericksburg, VA',
    entry: 'Free',
    category: 'Ruck Progression',
    runsignupUrl: 'https://runsignup.com/Race/VA/Fredericksburg/MonthlyRuckProgression',
  },
  {
    title: 'GUIDON22',
    slug: 'guidon22',
    description:
      "A 22-mile ruck event on November 22 starting at 5.11 Tactical Fredericksburg. $22 entry fee. All proceeds benefit Hero's Bridge.",
    date: '2026-11-22',
    location: '5.11 Tactical, Fredericksburg, VA',
    entry: '$22',
    beneficiary: "Hero's Bridge",
    category: 'Charity',
  },
]

/** Returns events whose date falls within [weekStart, weekStart + 6 days] */
export function getEventsForWeek(weekStart: Date): HBFITEvent[] {
  const start = new Date(weekStart)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  end.setHours(23, 59, 59, 999)

  return events.filter((e) => {
    if (!e.date || e.past) return false
    const d = new Date(e.date + 'T12:00:00') // noon local to avoid TZ edge cases
    return d >= start && d <= end
  })
}
