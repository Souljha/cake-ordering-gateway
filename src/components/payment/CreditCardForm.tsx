import React, { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

interface CreditCardFormProps {
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
  orderId: string | null;
}

const CreditCardForm: React.FC<CreditCardFormProps> = ({ 
  onSuccess, 
  onError,
  orderId
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't loaded yet
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-confirmation`,
        },
        redirect: 'if_required'
      });

      if (error) {
        setErrorMessage(error.message);
        onError(error.message || 'An unknown error occurred');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment successful
        onSuccess(orderId || '');
      } else {
        setErrorMessage('Payment processing failed. Please try again.');
        onError('Payment processing failed');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred');
      onError(err.message || 'An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      {errorMessage && (
        <div className="text-red-500 text-sm mt-2">{errorMessage}</div>
      )}
      
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing} 
        className="w-full"
      >
        {isProcessing ? (
          <span className="flex items-center">
            <Spinner className="mr-2" /> Processing...
          </span>
        ) : (
          'Pay Now'
        )}
      </Button>
    </form>
  );
};

export default CreditCardForm;