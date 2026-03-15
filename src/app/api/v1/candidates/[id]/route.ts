import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

// GET /api/v1/candidates/:id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const apiKey = request.headers.get("x-api-key");
    if (!apiKey || apiKey !== process.env.ATS_API_KEY) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    const { id } = await params;

    const { data, error } = await supabase
      .from("portfolios")
      .select("id, name, username, job_title, title, description, skills, projects, location, experience_level, preferred_work_type, languages, github_url, linkedin_url, website_url, is_verified, created_at, updated_at")
      .eq("id", id)
      .eq("user_role", "candidate")
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
    }

    return NextResponse.json({
      candidate: {
        ...data,
        profile_url: `https://talentagent.com/portfolio/${data.id}`,
      },
    });
  } catch (error) {
    console.error("ATS API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
