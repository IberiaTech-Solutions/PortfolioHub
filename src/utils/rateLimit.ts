import { createClient } from "@supabase/supabase-js";
import { getTierLimits, PlanTier } from "./tierGating";

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  limit: number;
  error?: string;
};

// Check if a user has exceeded their daily rate limit for a given event type
export async function checkRateLimit(
  userId: string,
  eventType: "chat" | "fit_assessment" | "job_match"
): Promise<RateLimitResult> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return { allowed: true, remaining: 0, limit: 0 };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Get user's portfolio and plan tier
  const { data: portfolio } = await supabase
    .from("portfolios")
    .select("id, plan_tier")
    .eq("user_id", userId)
    .maybeSingle();

  if (!portfolio) {
    return { allowed: false, remaining: 0, limit: 0, error: "No portfolio found" };
  }

  const tier = (portfolio.plan_tier as PlanTier) || "free";
  const limits = getTierLimits(tier);

  // Map event type to limit key
  const limitKey = eventType === "chat"
    ? "aiChatsPerDay"
    : eventType === "fit_assessment"
    ? "fitAssessmentsPerDay"
    : "jobMatchesPerWeek";

  const limit = limits[limitKey] as number;
  if (limit === Infinity) {
    return { allowed: true, remaining: Infinity, limit };
  }

  // Count usage in the current period
  const periodStart = eventType === "job_match"
    ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    : new Date(new Date().setHours(0, 0, 0, 0)).toISOString(); // Today midnight

  const { count } = await supabase
    .from("portfolio_analytics")
    .select("id", { count: "exact", head: true })
    .eq("portfolio_id", portfolio.id)
    .eq("event_type", eventType)
    .gte("created_at", periodStart);

  const used = count || 0;
  const remaining = Math.max(0, limit - used);

  if (used >= limit) {
    const period = eventType === "job_match" ? "weekly" : "daily";
    return {
      allowed: false,
      remaining: 0,
      limit,
      error: `You've reached your ${period} limit of ${limit}. Upgrade to Pro for higher limits.`,
    };
  }

  return { allowed: true, remaining, limit };
}
