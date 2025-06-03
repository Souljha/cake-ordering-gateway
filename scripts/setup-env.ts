import { config } from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
const result = config({ path: resolve(__dirname, '../.env') });

if (result.error) {
  console.warn('Error loading .env file:', result.error);
}

console.log('.env file processed from:', resolve(__dirname, '../.env'));

// Check if the Hugging Face API key is set
if (!process.env.VITE_HUGGINGFACE_API_KEY) {
  console.warn('Warning: VITE_HUGGINGFACE_API_KEY is not set in your .env file');
  console.warn('You can still use the Hugging Face API without a key, but with rate limits');
}
