import { createClient } from "@supabase/supabase-js";

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

export { supabaseAdmin };
