import axios from 'axios';

// API Key is read from Vite environment variables (prefixed with VITE_)
// Ensure your .env file has VITE_GROQ_API_KEY=your_actual_key
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || 'YOUR_GROQ_API_KEY_PLACEHOLDER'; 
// TODO: Verify the correct API endpoint from Groq Cloud documentation
const GROQ_API_BASE_URL = 'https://api.groq.com/openai/v1'; 
const TIMEOUT_MS = 45000;

// User selected model
const DEFAULT_MODEL = 'llama3-70b-8192';

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GroqCompletionOptions {
  model: string;
  messages: GroqMessage[];
  temperature?: number;
  top_p?: number;
  max_tokens?: number; // Groq uses max_tokens
  // Add other Groq-specific options if needed
}

interface GroqCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: GroqMessage;
    finish_reason: string;
  }>;
  usage?: { // Usage might be optional or structured differently
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function generateCompletion(options: GroqCompletionOptions): Promise<GroqCompletionResponse> {
  if (!GROQ_API_KEY || GROQ_API_KEY === 'YOUR_GROQ_API_KEY_PLACEHOLDER') {
    console.error('Groq API key is not configured. Please set it in your environment variables.');
    throw new Error('Groq API key not configured.');
  }
  try {
    // Using the chat completions endpoint, common for OpenAI-compatible APIs
    const response = await axios.post(`${GROQ_API_BASE_URL}/chat/completions`, options, {
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: TIMEOUT_MS,
    });
    return response.data;
  } catch (error) {
    console.error('Error calling Groq API:', error);
    throw error;
  }
}

export async function generateChatResponse(
  messages: Array<GroqMessage>, // Use GroqMessage type
  model: string = DEFAULT_MODEL
): Promise<string> {
  try {
    const groqMessages: GroqMessage[] = messages.map(msg => ({
      role: msg.role as 'system' | 'user' | 'assistant', // Ensure role is of the correct type
      content: msg.content,
    }));

    const response = await generateCompletion({
      model,
      messages: groqMessages, // Pass the messages array directly
      temperature: 0.7,
      max_tokens: 256, // Use max_tokens
      // top_p: 0.9, // Optionally add other parameters
    });
    
    // Extract response from the Groq API structure
    if (response.choices && response.choices.length > 0 && response.choices[0].message) {
      return response.choices[0].message.content;
    } else {
      console.error('Unexpected response structure from Groq API:', response);
      return "I'm sorry, I received an unexpected response from the AI service.";
    }
  } catch (error) {
    console.error('Error generating chat response with Groq:', error);
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Log more details if available from the API response
        console.error('Groq API Error Response:', error.response.data);
        return `I'm sorry, there was an issue with the AI service (Status: ${error.response.status}). Please try again later.`;
      } else if (error.request) {
        return "I'm sorry, I couldn't connect to the AI service. Please check your network connection and try again.";
      } else {
        return "I'm sorry, an unexpected error occurred while trying to reach the AI service.";
      }
    }
    return "I'm sorry, an unexpected error occurred. Please try again later.";
  }
}
