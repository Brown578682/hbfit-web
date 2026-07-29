// Membership plan definitions — single source of truth
export type MembershipPlan = {
  slug: string;
  name: string;
  price: number;
  addOn: number;
  cap: number;
  description: string;
  isGap: boolean;
  requiresApproval: boolean;
  stripePriceId: string;
  stripeFamilyAddonPriceId?: string;
  openGymOnly?: boolean;
};

export const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    slug: "base",
    name: "Base Membership",
    price: 100_00,
    addOn: 50_00,
    cap: 200_00,
    description: "Full access to all classes and facilities.",
    isGap: false,
    requiresApproval: false,
    stripePriceId: "price_1TyNW3Amxrz1YL7G3ryHrNhp",
  },
  {
    slug: "gap",
    name: "Guardian Angel Program",
    price: 75_00,
    addOn: 50_00,
    cap: 200_00,
    description: "Discounted rate for veterans, active duty, first responders, and other qualifying community members.",
    isGap: true,
    requiresApproval: true,
    stripePriceId: "price_1TyNW4Amxrz1YL7G9yurhMGx",
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
    stripePriceId: "price_1TyNW4Amxrz1YL7GK5gK2Nhv",
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
    stripePriceId: "price_1TyNW5Amxrz1YL7GVJgmzu4L",
  },
  {
    slug: "open-gym",
    name: "Open Gym",
    price: 35_00,
    addOn: 35_00,
    cap: 0,
    description: "Access during scheduled Open Gym windows only.",
    isGap: false,
    requiresApproval: false,
    openGymOnly: true,
    stripePriceId: "price_1TyNW5Amxrz1YL7G1ojD4rqg",
    stripeFamilyAddonPriceId: "price_1TyNW6Amxrz1YL7GKIInzYQN",
  },
];

export const STRIPE_PRICE_FAMILY_ADDON = "price_1TyNW7Amxrz1YL7GQaoVkMc2";
export const STRIPE_PRICE_SITG_DONATION = "price_1TyNW7Amxrz1YL7G2qsQ2UON";

export const HOUSEHOLD_CAP_CENTS = 200_00;
export const FAMILY_ADDON_CENTS = 50_00;

export function calculateHouseholdBilling(memberCount: number, plan: MembershipPlan): number {
  if (memberCount <= 1) return plan.price;
  const total = plan.price + (memberCount - 1) * plan.addOn;
  return plan.cap > 0 ? Math.min(total, plan.cap) : total;
}

export function getFamilyAddonPriceId(plan: MembershipPlan): string {
  return plan.stripeFamilyAddonPriceId ?? STRIPE_PRICE_FAMILY_ADDON;
}
