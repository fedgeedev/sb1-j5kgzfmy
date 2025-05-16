import React, { useState } from 'react';
import { useStripe } from '../hooks/useStripe';
import { StripePriceId, StripeMode } from '../stripe-config';
import { supabase } from '../lib/supabaseClient';

interface SubscriptionButtonProps {
  priceId: StripePriceId;
  mode: StripeMode;
  children: React.ReactNode;
  className?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export default function SubscriptionButton({
  priceId,
  mode,
  children,
  className = '',
  onSuccess,
  onError
}: SubscriptionButtonProps) {
  const [loading, setLoading] = useState(false);
  const { createCheckoutSession } = useStripe();

  const handleClick = async () => {
    try {
      setLoading(true);

      const successUrl = `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = window.location.href;

      const checkoutUrl = await createCheckoutSession({
        priceId,
        mode,
        successUrl,
        cancelUrl,
      });

      // Extract session_id from checkout URL
      const urlObj = new URL(checkoutUrl);
      const sessionId = urlObj.searchParams.get('session_id') ?? 'unknown';

      // Get current user for logging
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const userId = user?.id || null;
      const userEmail = user?.email || 'anonymous';

      // 🧾 Log the checkout attempt
      await supabase.from('audit_logs').insert({
        actor_id: userId,
        actor_email: userEmail,
        action: 'Initiated Stripe Checkout',
        target: 'stripe_checkout_session',
        details: `Mode: ${mode}, Price ID: ${priceId}`,
      });

      // 💾 Store the session ID
      await supabase.from('stripe_sessions').insert({
        user_id: userId,
        session_id: sessionId,
        price_id: priceId,
        mode,
        created_at: new Date().toISOString(),
        status: 'pending',
      });

      // Redirect to Stripe
      window.location.href = checkoutUrl;
      onSuccess?.();
    } catch (error: any) {
      console.error('Stripe Checkout error:', error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`relative ${className}`}
    >
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : null}
      <span className={loading ? 'invisible' : ''}>{children}</span>
    </button>
  );
}
