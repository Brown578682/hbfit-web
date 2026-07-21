// Membership plan definitions — single source of truth
export const MEMBERSHIP_PLANS = [
  {
    slug: "base",
    name: "Base Membership",
    price: 100_00,
    addOn: 50_00,
    cap: 200_00,
    description: "Full access to all classes and facilities.",
    isGap: false,
    requiresApproval: false,
    stripePriceId: "price_1TvlxvLg281PLi1sXGjqVF2S",
  },
  {
    slug: "gap-veteran",
    name: "GAP Program — Veteran",
    price: 75_00,
    addOn: 50_00,
    cap: 200_00,
    description: "For honorably discharged veterans. DD-214 or VA ID required.",
    isGap: true,
    gapCategory: "VETERAN",
    requiresApproval: true,
    stripePriceId: "price_1TvlxzLg281PLi1svslpa5iN",
  },
  {
    slug: "gap-active",
    name: "GAP Program — Active Duty / Guard / Reserve",
    price: 75_00,
    addOn: 50_00,
    cap: 200_00,
    description: "For active duty, National Guard, and Reserve members. CAC or orders required.",
    isGap: true,
    gapCategory: "ACTIVE_DUTY",
    requiresApproval: true,
    stripePriceId: "price_1Tvly5Lg281PLi1sUE7gt2PP",
  },
  {
    slug: "gap-first-responder",
    name: "GAP Program — First Responder",
    price: 75_00,
    addOn: 50_00,
    cap: 200_00,
    description: "For law enforcement, fire, and EMS. Agency ID or badge required.",
    isGap: true,
    gapCategory: "FIRST_RESPONDER",
    requiresApproval: true,
    stripePriceId: "price_1Tvly9Lg281PLi1s9KylEiZ0",
  },
  {
    slug: "gap-medical",
    name: "GAP Program — Medical Student",
    price: 75_00,
    addOn: 50_00,
    cap: 200_00,
    description: "For enrolled medical students. Student ID or enrollment verification required.",
    isGap: true,
    gapCategory: "MEDICAL_STUDENT",
    requiresApproval: true,
    stripePriceId: "price_1TvlyDLg281PLi1s0P35yWAp",
  },
  {
    slug: "gap-clergy",
    name: "GAP Program — Clergy",
    price: 75_00,
    addOn: 50_00,
    cap: 200_00,
    description: "For ordained clergy. Ordination certificate or church letterhead required.",
    isGap: true,
    gapCategory: "CLERGY",
    requiresApproval: true,
    stripePriceId: "price_1TvlyHLg281PLi1smyL09kw6",
  },
  {
    slug: "homeschool-heroes",
    name: "Homeschool Heroes",
    price: 75_00,
    addOn: 50_00,
    cap: 200_00,
    description: "Tuesday & Thursday 1–2 PM. Structured PE for homeschool families.",
    isGap: false,
    requiresApproval: false,
    stripePriceId: "price_1TvlyMLg281PLi1swaEgpvXs",
  },
  {
    slug: "tribal-elders",
    name: "Tribal Elders",
    price: 75_00,
    addOn: 50_00,
    cap: 200_00,
    description: "Programming designed for longevity, mobility, and strength.",
    isGap: false,
    requiresApproval: false,
    stripePriceId: "price_1TvlyTLg281PLi1sBfbCboFM",
  },
] as const;

export const STRIPE_PRICE_FAMILY_ADDON = "price_1TvlyXLg281PLi1sj0Z1dJsq";

export const HOUSEHOLD_CAP_CENTS = 200_00;
export const FAMILY_ADDON_CENTS = 50_00;

export function calculateHouseholdBilling(memberCount: number, basePriceCents: number): number {
  const total = basePriceCents + (memberCount - 1) * FAMILY_ADDON_CENTS;
  return Math.min(total, HOUSEHOLD_CAP_CENTS);
}
