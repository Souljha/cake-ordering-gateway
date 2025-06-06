// This file is automatically generated. Do not edit it directly.
import type { Database } from './types'; // Ensure this 'Database' type is correctly generated and points to your Supabase schema types.
import { supabase as supabaseClientFromLib } from '../../lib/supabase';

// Re-export the supabase client
// The client from '../../lib/supabase' (supabaseClientFromLib) should already be correctly typed
// as SupabaseClient<Database> due to the createClient<Database>() call there.
// Directly exporting it should preserve its type.
export const supabase = supabaseClientFromLib;

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";
