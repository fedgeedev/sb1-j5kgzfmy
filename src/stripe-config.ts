export const STRIPE_PRODUCTS = {
  CLINIC_LISTING: {
    priceId: 'price_1RL7fZGGGIXgykUWETlFJuYU',
    name: 'Clinic Listing',
    description: 'Monthly clinic listing subscription',
    mode: 'subscription' as const
  },
  THERAWAY_MEMBERSHIP: {
    priceId: 'price_1RIPZ5GGGIXgykUW09iBXSL6',
    name: 'TheraWay Membership',
    description: 'One Month TheraWay Subscription',
    mode: 'subscription' as const
  }
} as const;

export type StripePriceId = typeof STRIPE_PRODUCTS[keyof typeof STRIPE_PRODUCTS]['priceId'];
export type StripeMode = typeof STRIPE_PRODUCTS[keyof typeof STRIPE_PRODUCTS]['mode'];