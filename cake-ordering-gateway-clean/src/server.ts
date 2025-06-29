import express from 'express';
import cors from 'cors';
import { detectIntent } from './lib/dialogflow';
import { setupStripeWebhook } from '../scripts/stripeWebhook';

const app = express();
const PORT = process.env.PORT || 3001;

setupStripeWebhook(app);

// Configure CORS properly
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // Add your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON request bodies
app.use(express.json());

// Add detailed logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Dialogflow API server is running');
});

// Dialogflow endpoint
app.post('/api/dialogflow/message', async (req, res) => {
  try {
    console.log('Received request body:', req.body);
    const { text, sessionId } = req.body;
    
    if (!text) {
      console.error('Missing text in request');
      res.status(400).json({ error: 'Text is required' });
      return;
    }
    
    console.log(`Processing intent detection for: "${text}" (sessionId: ${sessionId})`);
    
    const result = await detectIntent(text, sessionId);
    console.log('Dialogflow response:', result);
    res.json(result);
  } catch (error: any) {
    console.error('Error in /api/dialogflow/message:', error);
    res.status(500).json({
      error: 'Failed to process request',
      details: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} at http://localhost:${PORT}`);
  console.log(`API endpoint available at http://localhost:${PORT}/api/dialogflow/message`);
});