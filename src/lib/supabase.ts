import { createClient } from '@supabase/supabase-js';

// Use import.meta.env for Vite applications
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

// Create client with proper error handling
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);