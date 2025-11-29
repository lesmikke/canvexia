import { createClient } from '@supabase/supabase-js';

// Read the URL from the environment file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

// Read the Key from the environment file
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Safety Check: Crash if keys are missing so we know immediately
if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase URL or Key. Check your .env.local file!");
}

// Create and export the connection
export const supabase = createClient(supabaseUrl, supabaseKey);