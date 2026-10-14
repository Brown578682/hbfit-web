// Membership plan definitions — single source of truth

export type MembershipPlan = {
  slug: string;
  name: string;
  price: number;
  baseIncludes: number;
  addOn: number;
  cap: number;
  description: string;
  isGap: boolean;
  requiresApproval: boolean;
  accessLevel: 'FULL' | 'HH_AND_OG' | 'TRIBAL_ELDERS_ONLY' | 'OPEN_GYM_ONLY';
  stripePriceId: string;
  stripeFamilyAddonPriceId?: string;
  openGymOnly?: boolean;
  joinHidden?: boolean;
};

export const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    slug:            'base',
    name:            'Unlimited Membership',
    price:           100_00,
    baseIncludes:    1,
    addOn:           50_00,
    cap:             200_00,
    description:     'Unlimited access to all classes and sessions. Each additional household member is $50/cycle.',
    isGap:           false,
    requiresApproval: false,
    accessLevel:     'FULL',
    stripePriceId:   'price_1TyNW3Amxrz1YL7G3ryHrNhp',
    stripeFamilyAddonPriceId: 'price_1U85qsAmxrz1YL7GsVLUL1g0',
  },
  {
    slug:            'gap',
    name:            'Guardian Angel Program',
    price:           75_00,
    baseIncludes:    1,
    addOn:           50_00,
    cap:             200_00,
    description:     'Discounted rate for veterans, active duty, first responders, medical students, and clergy. Same full access as Base. Requires verification.',
    isGap:           true,
    requiresApproval: true,
    accessLevel:     'FULL',
    stripePriceId:   'price_1TyNW4Amxrz1YL7G9yurhMGx',
    stripeFamilyAddonPriceId: 'price_1TyNW7Amxrz1YL7GQaoVkMc2', // 28-day cycle, matches base sub
  },
  {
    slug:            'homeschool-heroes',
    name:            'Homeschool Heroes',
    price:           75_00,
    baseIncludes:    2, // 1 adult + 1 kid included in base price
    addOn:           50_00,
    cap:             200_00,
    description:     'Tue & Thu 1–2 PM. Structured PE for homeschool families. Base price covers 1 adult + 1 student. Each additional member (adult or child) is $50/cycle. Access limited to HH sessions and Open Gym.',
    isGap:           false,
    requiresApproval: false,
    accessLevel:     'HH_AND_OG',
    stripePriceId:   'price_1TyNW4Amxrz1YL7GK5gK2Nhv',
    stripeFamilyAddonPriceId: 'price_1TyNW7Amxrz1YL7GQaoVkMc2',
  },
  {
    slug:            'tribal-elders',
    name:            'Tribal Elders',
    price:           75_00,
    baseIncludes:    1,
    addOn:           50_00,
    cap:             200_00,
    description:     'Programming designed for longevity, mobility, and strength. Access limited to Tribal Elders sessions and Open Gym.',
    isGap:           false,
    requiresApproval: false,
    accessLevel:     'TRIBAL_ELDERS_ONLY',
    stripePriceId:   'price_1TyNW5Amxrz1YL7GVJgmzu4L',
  },
  {
    slug:            'open-gym',
    name:            'Open Gym',
    price:           35_00,
    baseIncludes:    1,
    addOn:           35_00,
    cap:             0,
    description:     'Access during scheduled Open Gym windows only. No class access.',
    isGap:           false,
    requiresApproval: false,
    accessLevel:     'OPEN_GYM_ONLY',
    openGymOnly:     true,
    joinHidden:      false,
    stripePriceId:   'price_1TyNW5Amxrz1YL7G1ojD4rqg',
    stripeFamilyAddonPriceId: 'price_1TyNW6Amxrz1YL7GKIInzYQN',
  },
  {
    slug:            'poolee',
    name:            'DEP Poolee',
    price:           0,
    baseIncludes:    1,
    addOn:           0,
    cap:             0,
    description:     'Free membership for active military poolees enrolled in the Delayed Entry Program (DEP). Valid while DEP enrollment is active. Full class access.',
    isGap:           false,
    requiresApproval: true,
    accessLevel:     'FULL',
    stripePriceId:   '',
    joinHidden:      true,
  },
] satisfies MembershipPlan[];

export const STRIPE_PRICE_FAMILY_ADDON  = 'price_1TyNW7Amxrz1YL7GQaoVkMc2';
export const STRIPE_PRICE_SITG_DONATION = 'price_1TyNW7Amxrz1YL7G2qsQ2UON';
export const STRIPE_PRICE_DROP_IN       = 'price_1U6yqJAmxrz1YL7G45WzOR7A';
export const STRIPE_PRICE_TEN_PACK      = 'price_1U6yqKAmxrz1YL7GIRBWbnWc';

export const HOUSEHOLD_CAP_CENTS = 200_00;
export const FAMILY_ADDON_CENTS  = 50_00;

/**
 * Calculate total billing for a household.
 * baseIncludes = number of people covered by the flat price.
 * Beyond that, each additional member is addOn cents, capped at cap.
 */
export function calculateHouseholdBilling(memberCount: number, plan: MembershipPlan): number {
  if (memberCount <= plan.baseIncludes) return plan.price;
  const extras = memberCount - plan.baseIncludes;
  const total  = plan.price + extras * plan.addOn;
  return plan.cap > 0 ? Math.min(total, plan.cap) : total;
}

export function getFamilyAddonPriceId(plan: MembershipPlan): string {
  return plan.stripeFamilyAddonPriceId ?? STRIPE_PRICE_FAMILY_ADDON;
}

/**
 * Check whether a member's accessLevel permits booking a given ClassCategory.
 * Returns null if allowed, or a string upgrade prompt if blocked.
 */
export function checkAccessForBooking(
  accessLevel: 'FULL' | 'HH_AND_OG' | 'TRIBAL_ELDERS_ONLY' | 'OPEN_GYM_ONLY',
  classCategory: 'FULL_ACCESS' | 'HH' | 'OPEN_GYM' | 'TRIBAL_ELDERS' | 'FREE_EVENT',
): string | null {
  if (classCategory === 'FREE_EVENT') return null;
  if (classCategory === 'OPEN_GYM')  return null; // all plans can access Open Gym

  switch (accessLevel) {
    case 'FULL':
      return null; // Base/GAP can book anything
    case 'HH_AND_OG':
      if (classCategory === 'HH') return null;
      return 'Your Homeschool Heroes membership only includes HH sessions and Open Gym. Upgrade to an Unlimited Membership for unlimited class access.';
    case 'TRIBAL_ELDERS_ONLY':
      if (classCategory === 'TRIBAL_ELDERS') return null;
      return 'Your Tribal Elders membership only includes Tribal Elders sessions and Open Gym. Upgrade to an Unlimited Membership for unlimited class access.';
    case 'OPEN_GYM_ONLY':
      return 'Your Open Gym membership does not include class bookings. Upgrade to access group training sessions.';
  }
}
