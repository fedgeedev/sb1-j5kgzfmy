import { useCallback } from 'react';
import { StripePriceId, StripeMode } from '../stripe-config';

interface CreateCheckoutSessionOptions {
  priceId: StripePriceId;
  mode: StripeMode;
  successUrl: string;
  cancelUrl: string;
}

export function useStripe() {
  const createCheckoutSession = useCallback(async ({ priceId, mode, successUrl, cancelUrl }: CreateCheckoutSessionOptions) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          price_id: priceId,
          mode,
          success_url: successUrl,
          cancel_url: cancelUrl,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      return url;
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }, []);

  return { createCheckoutSession };
}