// This file maps the subscription tiers shown in the UI to the database values

export const SUBSCRIPTION_TIERS = {
  FREE: {
    name: 'Everyday Cake',
    designsPerDay: 1,
    price: 0,
    slug: 'everyday-cake-plan',
    freeDelivery: false
  },
  STANDARD: {
    name: 'Cake Lovers',
    designsPerDay: 5,
    price: 150,
    slug: 'cake-lovers-plan',
    freeDelivery: true
  },
  PREMIUM: {
    name: 'Super Cake Lovers',
    designsPerDay: 10,
    price: 350,
    slug: 'super-cake-lovers-plan',
    freeDelivery: true
  },
};

export type SubscriptionTierKey = keyof typeof SUBSCRIPTION_TIERS;

// Helper function to get tier by name
export function getTierByName(name: string): SubscriptionTierKey {
  name = name.toLowerCase();
  
  if (name.includes('super') || name.includes('premium')) {
    return 'PREMIUM';
  } else if (name.includes('lover')) {
    return 'STANDARD';
  } else {
    return 'FREE';
  }
}

// Helper function to get designs per day limit by plan name
export function getDesignsPerDayByPlanName(planName: string | null): number {
  if (!planName) return 1;
  
  const tierKey = getTierByName(planName);
  return SUBSCRIPTION_TIERS[tierKey].designsPerDay;
}