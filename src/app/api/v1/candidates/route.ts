import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

// GET /api/v1/candidates?skills=React,TypeScript&limit=20&offset=0
export async function GET(request: NextRequest) {
  try {
    const apiKey = request.headers.get("x-api-key");
    if (!apiKey || apiKey !== process.env.ATS_API_KEY) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const skills = searchParams.get("skills")?.split(",").map(s => s.trim()) || [];
    const location = searchParams.get("location") || "";
    const experience = searchParams.get("experience_level") || "";
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = supabase
      .from("portfolios")
      .select("id, name, username, job_title, title, description, skills, location, experience_level, preferred_work_type, languages, github_url, linkedin_url, website_url, is_verified, created_at", { count: "exact" })
      .eq("user_role", "candidate");

    if (location) {
      query = query.ilike("location", `%${location}%`);
    }
    if (experience) {
      query = query.eq("experience_level", experience);
    }

    const { data, count, error } = await query
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "Failed to fetch candidates" }, { status: 500 });
    }

    // Filter by skills client-side (JSONB array)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let candidates: any[] = data || [];
    if (skills.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      candidates = candidates.filter((c: any) =>
        skills.some(skill =>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (c.skills || []).some((s: any) => s.toLowerCase().includes(skill.toLowerCase()))
        )
      );
    }

    // Strip private fields
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sanitized = candidates.map((c: any) => ({
      id: c.id,
      name: c.name,
      username: c.username,
      job_title: c.job_title,
      title: c.title,
      description: c.description?.slice(0, 300),
      skills: c.skills,
      location: c.location,
      experience_level: c.experience_level,
      preferred_work_type: c.preferred_work_type,
      languages: c.languages,
      github_url: c.github_url,
      linkedin_url: c.linkedin_url,
      website_url: c.website_url,
      is_verified: c.is_verified,
      profile_url: `https://talentagent.com/portfolio/${c.id}`,
    }));

    return NextResponse.json({
      candidates: sanitized,
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error("ATS API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
