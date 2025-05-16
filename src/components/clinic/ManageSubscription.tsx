import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { STRIPE_PRODUCTS } from '../../stripe-config';
import { CreditCard, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import SubscriptionButton from '../SubscriptionButton';

const ManageSubscription: React.FC = () => {
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const fetchSubscriptionStatus = async () => {
    try {
      const session = (await supabase.auth.getSession()).data.session;

      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/stripe_user_subscriptions`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch subscription status');

      const data = await response.json();
      setSubscription(data?.[0] || null);
    } catch (err) {
      setError('Failed to load subscription information');
      console.error('Subscription fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50';
      case 'past_due':
        return 'text-red-600 bg-red-50';
      case 'canceled':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-yellow-600 bg-yellow-50';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004D4D]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <div className="flex items-center gap-2">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-[#004D4D]">Manage Subscription</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your clinic listing subscription</p>
        </div>

        <div className="p-6">
          {subscription ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Current Plan</h3>
                  <p className="text-sm text-gray-500">Clinic Listing Subscription</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription.subscription_status)}`}>
                  {subscription.subscription_status.charAt(0).toUpperCase() + subscription.subscription_status.slice(1)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={20} className="text-[#004D4D]" />
                    <h4 className="font-medium">Billing Period</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Current period: {formatDate(subscription.current_period_start)} – {formatDate(subscription.current_period_end)}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard size={20} className="text-[#004D4D]" />
                    <h4 className="font-medium">Payment Method</h4>
                  </div>
                  {subscription.payment_method_brand && (
                    <p className="text-sm text-gray-600">
                      {subscription.payment_method_brand.charAt(0).toUpperCase() + subscription.payment_method_brand.slice(1)} ending in {subscription.payment_method_last4}
                    </p>
                  )}
                </div>
              </div>

              {subscription.subscription_status === 'active' && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 p-4 rounded-lg">
                  <CheckCircle size={20} />
                  <p className="text-sm">Your subscription is active and will automatically renew.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No Active Subscription</h3>
              <p className="text-gray-500 mb-6">Subscribe to list your clinic on TheraWay.</p>
              <SubscriptionButton
                priceId={STRIPE_PRODUCTS.CLINIC_LISTING.priceId}
                mode={STRIPE_PRODUCTS.CLINIC_LISTING.mode}
                className="px-6 py-2 bg-[#004D4D] text-white rounded-lg hover:bg-[#003939] transition-colors"
              >
                Subscribe Now
              </SubscriptionButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageSubscription;

