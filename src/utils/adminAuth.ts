import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/utils/supabase";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function isAdmin(userId: string): Promise<boolean> {
  if (!userId) return false;

  const { data } = await supabaseAdmin
    .from("portfolios")
    .select("user_role")
    .eq("user_id", userId)
    .maybeSingle();

  return (data as { user_role?: string } | null)?.user_role === "admin";
}

// Client-side admin check — use in page components
// Checks app_metadata.role from Supabase Auth (no portfolio needed)
export async function checkAdminClient(): Promise<{ authorized: boolean; userId: string | null }> {
  if (!supabase) return { authorized: false, userId: null };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { authorized: false, userId: null };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isAdminRole = (user as any).app_metadata?.role === "admin";
  return { authorized: isAdminRole, userId: user.id };
}

export { supabaseAdmin };
