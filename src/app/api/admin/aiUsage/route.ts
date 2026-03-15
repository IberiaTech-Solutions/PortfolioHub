import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Returns AI usage stats — counts of AI API calls by type
// Called from admin dashboard
export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: "Not configured" }, { status: 503 });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // Verify admin
    const authHeader = request.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const anonClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "");
    const { data: { user } } = await anonClient.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("portfolios")
      .select("user_role")
      .eq("user_id", user.id)
      .maybeSingle();

    if ((profile as { user_role?: string } | null)?.user_role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get analytics counts by event type (as proxy for AI usage)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [chats30d, assessments30d, chats7d, assessments7d, totalChats, totalAssessments] = await Promise.all([
      supabase.from("portfolio_analytics").select("*", { count: "exact", head: true }).eq("event_type", "chat").gte("created_at", thirtyDaysAgo),
      supabase.from("portfolio_analytics").select("*", { count: "exact", head: true }).eq("event_type", "fit_assessment").gte("created_at", thirtyDaysAgo),
      supabase.from("portfolio_analytics").select("*", { count: "exact", head: true }).eq("event_type", "chat").gte("created_at", sevenDaysAgo),
      supabase.from("portfolio_analytics").select("*", { count: "exact", head: true }).eq("event_type", "fit_assessment").gte("created_at", sevenDaysAgo),
      supabase.from("portfolio_analytics").select("*", { count: "exact", head: true }).eq("event_type", "chat"),
      supabase.from("portfolio_analytics").select("*", { count: "exact", head: true }).eq("event_type", "fit_assessment"),
    ]);

    // Estimate costs (gpt-4o-mini: ~$0.15/1M input, $0.60/1M output, avg ~500 tokens per call)
    const totalAICalls = (totalChats.count || 0) + (totalAssessments.count || 0);
    const estimatedCost = totalAICalls * 0.001; // ~$0.001 per call avg

    return NextResponse.json({
      last30Days: {
        chats: chats30d.count || 0,
        fitAssessments: assessments30d.count || 0,
        total: (chats30d.count || 0) + (assessments30d.count || 0),
      },
      last7Days: {
        chats: chats7d.count || 0,
        fitAssessments: assessments7d.count || 0,
        total: (chats7d.count || 0) + (assessments7d.count || 0),
      },
      allTime: {
        chats: totalChats.count || 0,
        fitAssessments: totalAssessments.count || 0,
        total: totalAICalls,
      },
      estimatedCost: {
        total: `$${estimatedCost.toFixed(2)}`,
        perCall: "$0.001",
        model: "gpt-4o-mini",
      },
    });
  } catch (error) {
    console.error("AI usage error:", error);
    return NextResponse.json({ error: "Failed to fetch AI usage" }, { status: 500 });
  }
}
