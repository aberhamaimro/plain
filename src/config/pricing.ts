import { PricingPlan } from '../types';

export interface PricingConfig {
  freeCredits: number;
  plans: PricingPlan[];
}

export const PRICING_CONFIG: PricingConfig = {
  freeCredits: 1,
  plans: [
    {
      id: 'pack_5',
      name: '5-Document Pack',
      price: '$4.99',
      cadence: 'one-time payment',
      badge: 'Flexible & Simple',
      description: 'Ideal for occasional hospital bills, lease signings, or annual reviews. Credits never expire.',
      features: [
        '5 full document analyses',
        'Deep red-flag & hidden fee detection',
        'Formal dispute & negotiation letter drafter',
        'Interactive follow-up document chat',
        'Supports all 8 languages (Spanish, Arabic, etc.)',
        'Masks SSN and sensitive banking info',
      ],
    },
    {
      id: 'unlimited',
      name: 'Unlimited',
      price: '$7.99',
      cadence: 'per month',
      popular: true,
      badge: 'Most Popular',
      description: 'For active renters, freelancers, medical patients, and families handling frequent paperwork.',
      features: [
        'Unlimited document & photo analyses',
        'Instant priority queue processing',
        'Priority legal emergency flags & guidance',
        'Unlimited reply letters & dispute drafting',
        'Full saved document archive & export',
        'Cancel anytime with a single click',
      ],
    },
  ],
};

/**
 * Placeholder function for Stripe checkout session creation.
 * Connects to Stripe backend endpoint in production.
 */
export async function createCheckoutSession(planId: string): Promise<{ success: boolean; sessionUrl?: string; message: string }> {
  console.log(`[Pricing Scaffolding] Creating checkout session for plan: ${planId}`);
  
  // Simulate network roundtrip
  await new Promise((resolve) => setTimeout(resolve, 600));

  return {
    success: true,
    sessionUrl: `https://checkout.stripe.com/pay/mock_session_${planId}`,
    message: `Ready to connect to Stripe: Selected plan "${planId}".`,
  };
}
