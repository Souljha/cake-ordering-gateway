import express from 'express';
import { detectIntent } from '../lib/dialogflow';

const router = express.Router();

router.post('/message', async (req, res) => {
  try {
    console.log('Received request body:', req.body);
    const { text, sessionId } = req.body;
    
    if (!text) {
      console.error('Missing text in request');
      res.status(400).json({ error: 'Text is required' });
      return;
    }
    
    if (!sessionId) {
      console.error('Missing sessionId in request');
      res.status(400).json({ error: 'Session ID is required' });
      return;
    }
    
    console.log(`Processing message: "${text}" for session: ${sessionId}`);
    const response = await detectIntent(text, sessionId);
    console.log('Sending response:', response);
    res.json(response);
  } catch (error: any) {
    console.error('Error in Dialogflow API:', error);
    res.status(500).json({ 
      error: 'Failed to process message',
      details: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
  }
});

export default router;