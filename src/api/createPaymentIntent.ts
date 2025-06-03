import Stripe from 'stripe';
import { Request, Response } from 'express';
import { supabase } from "@/integrations/supabase/client";

export async function createPaymentIntent(req: Request, res: Response) {
  try {
    // Access the environment variable with VITE_ prefix
    const stripeSecretKey = import.meta.env.VITE_STRIPE_SECRET_KEY;
    
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
    }

    // Initialize Stripe with the correct API version
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-04-30.basil',
    });

    const { amount, currency, payment_id, is_subscription, subscription_plan, billing_interval } = req.body;

    // Validate required parameters
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: { message: 'Valid amount is required' } });
    }

    if (!payment_id) {
      return res.status(400).json({ error: { message: 'Payment ID is required' } });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents/smallest currency unit
      currency: (currency || 'zar').toLowerCase(),
      metadata: {
        payment_id,
        is_subscription: is_subscription ? 'true' : 'false',
        subscription_plan: subscription_plan || '',
        billing_interval: billing_interval || ''
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Return the client secret and payment intent ID
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ 
      error: { 
        message: error?.message || 'Internal server error',
        type: error?.type,
        code: error?.code
      } 
    });
  }
}