import React from 'react';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { Loader2 } from 'lucide-react';

interface PayPalCheckoutProps {
  amount: number;
  currency: string;
  orderId?: string;
  isSubscription?: boolean;
  onSuccess: (details: any) => void;
  onError: (error: string) => void;
}

const PayPalCheckout: React.FC<PayPalCheckoutProps> = ({
  amount,
  currency,
  orderId,
  isSubscription,
  onSuccess,
  onError
}) => {
  const [{ isPending }] = usePayPalScriptReducer();

  if (isPending) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-cake-pink" />
      </div>
    );
  }

  return (
    <div className="w-full">
      {isSubscription ? (
        <PayPalButtons
          style={{ layout: 'vertical', color: 'gold' }}
          createSubscription={(data, actions) => {
            return actions.subscription.create({
              plan_id: orderId || '',
            });
          }}
          onApprove={(data, actions) => {
            onSuccess({
              subscriptionID: data.subscriptionID,
              orderID: data.orderID,
            });
            return Promise.resolve();
          }}
          onError={(err) => {
            onError(err?.toString?.() || 'Unknown PayPal error');
          }}
        />
      ) : (
        <PayPalButtons
          style={{ layout: 'vertical', color: 'gold' }}
          createOrder={(data, actions) => {
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: amount.toFixed(2),
                    currency_code: currency,
                  },
                },
              ],
            });
          }}
          onApprove={async (data, actions) => {
            if (actions.order) {
              const details = await actions.order.capture();
              onSuccess(details);
            } else {
              onSuccess(data);
            }
          }}
          onError={(err) => {
            onError(err?.toString?.() || 'Unknown PayPal error');
          }}
        />
      )}
    </div>
  );
};

export default PayPalCheckout;