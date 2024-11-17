'use client';

import { useState } from 'react';

interface PaymentButtonProps {
  amount: number;
  description: string;
}

export default function PaymentButton({ amount, description }: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Initiating payment with data:', {
        amount,
        description: description || 'Premium Access Payment'
      });

      const response = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount.toString()),
          description: description || 'Premium Access Payment'
        }),
      });

      const data = await response.json();
      console.log('Payment response:', data);

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Payment failed');
      }

      if (!data.redirect_url) {
        throw new Error('Invalid payment response: No redirect URL');
      }

      // Redirect to PesaPal payment page
      window.location.href = data.redirect_url;
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      )}
      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Processing...' : `Pay ${amount.toLocaleString()} TZS`}
      </button>
    </div>
  );
}
