// Import fetch for making HTTP requests
import fetch from 'node-fetch';

async function testDialogflowAPI() {
  try {
    console.log('Testing Dialogflow API endpoint...');
    
    const response = await fetch('http://localhost:3001/api/dialogflow/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: 'Hello',
        sessionId: `test_session_${Date.now()}`,
      }),
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Failed to get response: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    console.log('API response data:', data);
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testDialogflowAPI();