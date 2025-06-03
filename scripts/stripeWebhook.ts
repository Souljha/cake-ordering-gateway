import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-04-30.basil',
});

// This is your Stripe CLI webhook secret for testing
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export function setupStripeWebhook(app: express.Application) {
  // Special raw body parser for Stripe webhook endpoint
  app.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    
    if (!sig || !endpointSecret) {
      console.error('Missing stripe signature or endpoint secret');
      res.status(400).send('Webhook Error: Missing signature or secret');
      return;
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body as Buffer, sig, endpointSecret);
    } catch (err: any) {
      console.error(`Webhook Error: ${err.message}`);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // Handle the event
    console.log(`Received event: ${event.type}`);
    
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
        // Handle successful payment (update order status, etc.)
        break;
        
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log(`Payment failed: ${failedPayment.last_payment_error?.message}`);
        // Handle failed payment
        break;
        
      // Add more event handlers as needed
      
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.send();
    return;
  });
}
