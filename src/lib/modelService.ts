import { HfInference } from '@huggingface/inference';

// Environment variable utility
const getEnvVariable = (key: string): string => {
  const value = import.meta.env[key];
  if (!value) {
    console.warn(`Environment variable ${key} is not set`);
    return '';
  }
  return value;
};

// Initialize the Hugging Face client
const hf = new HfInference(getEnvVariable('VITE_HUGGINGFACE_API_KEY'));

// Message type definition matching what's used in ChatBot.tsx
type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

/**
 * Generates a chat response using Hugging Face's API
 * This replaces the previous Ollama-based implementation
 */
export async function generateChatResponse(messages: ChatMessage[]): Promise<string> {
  try {
    // Extract the last user message and system prompt for context
    const userMessages = messages.filter(m => m.role === 'user');
    const systemMessages = messages.filter(m => m.role === 'system');
    
    const lastUserMessage = userMessages[userMessages.length - 1]?.content || '';
    const systemPrompt = systemMessages[0]?.content || '';
    
    // Format the prompt for the model
    const prompt = `${systemPrompt}\n\nUser: ${lastUserMessage}\n\nAssistant:`;
    
    // Use a text generation model from Hugging Face
    const result = await hf.textGeneration({
      model: 'google/flan-t5-base', // A good general-purpose model that's not too large
      inputs: prompt,
      parameters: {
        max_new_tokens: 150,
        temperature: 0.7,
        top_p: 0.95,
        repetition_penalty: 1.15
      }
    });
    
    return result.generated_text.trim();
  } catch (error) {
    console.error('Error generating text with Hugging Face:', error);
    throw new Error(`Failed to generate response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Alternative implementation using chat completion models if available
 * This is more accurate but may require a paid API plan for some models
 */
export async function generateChatResponseWithChatModel(messages: ChatMessage[]): Promise<string> {
  try {
    // Convert our message format to what the HF API expects
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    // Use a chat completion model
    const result = await hf.chatCompletion({
      model: 'mistralai/Mistral-7B-Instruct-v0.2', // A good open chat model
      messages: formattedMessages,
      temperature: 0.7,
      max_new_tokens: 150
    });
    
    return typeof result.generated_text === 'string' ? result.generated_text : '';
  } catch (error) {
    // Fall back to the text generation approach
    console.warn('Chat completion failed, falling back to text generation:', error);
    return generateChatResponse(messages);
  }
}