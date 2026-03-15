import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

// GET /api/v1/jobs — list active jobs
// POST /api/v1/jobs — create a job (for ATS integration)
export async function GET(request: NextRequest) {
  try {
    const apiKey = request.headers.get("x-api-key");
    if (!apiKey || apiKey !== process.env.ATS_API_KEY) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    const { data, count, error } = await supabase
      .from("jobs")
      .select("*", { count: "exact" })
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
    }

    return NextResponse.json({ jobs: data || [], total: count || 0, limit, offset });
  } catch (error) {
    console.error("ATS API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get("x-api-key");
    if (!apiKey || apiKey !== process.env.ATS_API_KEY) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    const body = await request.json();
    const required = ["title", "company", "description"];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    const { data, error } = await supabase
      .from("jobs")
      .insert({
        title: body.title,
        company: body.company,
        company_logo: body.company_logo || null,
        description: body.description,
        requirements: body.requirements || null,
        location: body.location || null,
        work_type: body.work_type || "full-time",
        remote_policy: body.remote_policy || "onsite",
        experience_level: body.experience_level || null,
        salary_min: body.salary_min || null,
        salary_max: body.salary_max || null,
        salary_currency: body.salary_currency || "USD",
        skills: body.skills || [],
        application_url: body.application_url || null,
        application_email: body.application_email || null,
        is_active: true,
        posted_by: body.posted_by || "api",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
    }

    return NextResponse.json({ job: data }, { status: 201 });
  } catch (error) {
    console.error("ATS API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
