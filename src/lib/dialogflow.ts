import { SessionsClient } from '@google-cloud/dialogflow';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

// Update this to use an absolute path or a more reliable path resolution
const CREDENTIALS_PATH = path.resolve(__dirname, '../../credentials/dialogflow-credentials.json');

// Add debugging to verify the path is correct
console.log('Credentials path:', CREDENTIALS_PATH);
console.log('File exists:', fs.existsSync(CREDENTIALS_PATH));

// Check if credentials file exists
if (!fs.existsSync(CREDENTIALS_PATH)) {
  console.error('Dialogflow credentials file not found at:', CREDENTIALS_PATH);
  console.error('Please ensure you have a valid credentials file in the credentials directory.');
}

// Initialize the Dialogflow client
let sessionsClient: SessionsClient;

try {
  // Set the environment variable for Google credentials
  process.env.GOOGLE_APPLICATION_CREDENTIALS = CREDENTIALS_PATH;
  sessionsClient = new SessionsClient();
} catch (error) {
  console.error('Error initializing Dialogflow client:', error);
}

// The project ID from your Dialogflow agent
const projectId = 'cake-a-day-agent';

export async function detectIntent(text: string, sessionId: string) {
  if (!sessionsClient) {
    throw new Error('Dialogflow client not initialized');
  }

  if (!projectId) {
    throw new Error('DIALOGFLOW_PROJECT_ID environment variable not set');
  }

  try {
    const sessionPath = sessionsClient.projectAgentSessionPath(
      projectId,
      sessionId || uuidv4()
    );

    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: text,
          languageCode: 'en-US',
        },
      },
    };

    const responses = await sessionsClient.detectIntent(request);
    const result = responses[0].queryResult;

    if (!result) {
      throw new Error('No result from Dialogflow');
    }

    return {
      text: result.fulfillmentText || '',
      intent: result.intent?.displayName || '',
      parameters: result.parameters?.fields || {},
      allRequiredParamsPresent: result.allRequiredParamsPresent || false,
    };
  } catch (error) {
    console.error('Error detecting intent:', error);
    throw error;
  }
}