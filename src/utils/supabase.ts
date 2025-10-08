import { createClient } from "@supabase/supabase-js";

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
};

// Only create Supabase client if environment variables are available
let supabase: ReturnType<typeof createClient> | null = null;

if (isSupabaseConfigured()) {
  supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    }
  );
} else {
  console.warn('Supabase environment variables not configured');
}

export { supabase };
