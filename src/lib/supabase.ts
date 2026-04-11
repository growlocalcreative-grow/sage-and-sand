import { createClient } from '@supabase/supabase-js';

// These lines pull the secret keys we just put in .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// This creates our "Communication Bridge"
export const supabase = createClient(supabaseUrl, supabaseAnonKey);