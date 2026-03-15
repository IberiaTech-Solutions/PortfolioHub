import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Server-side auth check for API routes
// Returns the authenticated user or an error response
export async function getAuthUser(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return { user: null, error: NextResponse.json({ error: "Server not configured" }, { status: 503 }) };
  }

  // Get token from Authorization header or cookie
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    // Try to get from cookies (for browser requests)
    const cookieHeader = request.headers.get("cookie") || "";
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { cookie: cookieHeader } },
    });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { user: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
    }
    return { user, error: null };
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  return { user, error: null };
}
