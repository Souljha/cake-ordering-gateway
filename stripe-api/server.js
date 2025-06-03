import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16', // Use the latest stable API version
});

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-production-domain.com'] 
    : ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST'],
  credentials: true
}));

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Stripe API server is running');
});

// Create payment intent endpoint
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency, payment_id, is_subscription } = req.body;

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
        is_subscription: is_subscription ? 'true' : 'false'
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
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ 
      error: { 
        message: error?.message || 'Internal server error',
        type: error?.type,
        code: error?.code
      } 
    });
  }
});

// Stripe webhook endpoint
app.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
      // Then define and call a function to handle the event payment_intent.succeeded
      break;
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log(`Payment failed: ${failedPayment.last_payment_error?.message}`);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.send();
});

// Start server
app.listen(port, () => {
  console.log(`Stripe API server running on port ${port}`);
});