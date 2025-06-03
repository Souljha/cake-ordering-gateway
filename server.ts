import express from 'express';
import cors from 'cors';
import { setupStripeWebhook } from './scripts/stripeWebhook';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Important: Set up the Stripe webhook handler BEFORE the express.json() middleware
// This ensures the raw body is available for Stripe signature verification
setupStripeWebhook(app);

// Configure CORS properly
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://your-production-domain.com' 
    : 'http://localhost:5173',
  credentials: true,
}));

// Parse JSON request bodies for all other routes
// This middleware must come AFTER the webhook route
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
