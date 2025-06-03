import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, Stripe, StripeElementsOptions } from '@stripe/stripe-js';

// Initialize Stripe outside of component for performance
// Load Stripe.js with your Stripe publishable key
const stripePromise: Promise<Stripe | null> = loadStripe(process.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_REPLACE_ME'); // Replace with your real publishable key or use env var

// Define appearance options for Stripe Elements
const appearance: StripeElementsOptions['appearance'] = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#f87171', // Customize to match your app's color scheme
    colorBackground: '#ffffff',
    colorText: '#30313d',
    colorDanger: '#ef4444',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    spacingUnit: '4px',
    borderRadius: '8px',
  }
};

interface StripeProviderProps {
  children: React.ReactNode;
  clientSecret?: string | null;
}

const StripeProvider: React.FC<StripeProviderProps> = ({
  children,
  clientSecret
}) => {
  const options: StripeElementsOptions = {
    clientSecret: clientSecret || undefined, // Pass clientSecret here
    appearance,
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
};

export default StripeProvider;
