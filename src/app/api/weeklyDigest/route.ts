import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

// This route is intended to be called by a cron job (e.g., Vercel Cron)
// It generates personalized weekly digest emails for all candidates

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI not configured" }, { status: 503 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Fetch all candidate portfolios
    const { data: candidates, error: candidatesError } = await supabaseAdmin
      .from("portfolios")
      .select("id, user_id, name, job_title, skills, location, experience_level")
      .eq("user_role", "candidate");

    if (candidatesError || !candidates) {
      return NextResponse.json({ error: "Failed to fetch candidates" }, { status: 500 });
    }

    // Fetch jobs posted in the last 7 days
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: recentJobs, error: jobsError } = await supabaseAdmin
      .from("jobs")
      .select("*")
      .eq("is_active", true)
      .gte("created_at", oneWeekAgo)
      .order("created_at", { ascending: false });

    if (jobsError || !recentJobs || recentJobs.length === 0) {
      return NextResponse.json({ message: "No new jobs this week", digests: 0 });
    }

    const digests = [];

    for (const candidate of candidates) {
      // Simple skill-based matching
      const candidateSkills = (candidate.skills || []).map((s: string) => s.toLowerCase());

      const matchedJobs = recentJobs
        .map((job) => {
          const jobSkills = (job.skills || []).map((s: string) => s.toLowerCase());
          const matchingSkills = candidateSkills.filter((s: string) =>
            jobSkills.some((js: string) => js.includes(s) || s.includes(js))
          );
          const score = jobSkills.length > 0
            ? Math.round((matchingSkills.length / jobSkills.length) * 100)
            : 0;
          return { ...job, matchScore: score, matchingSkills };
        })
        .filter((j) => j.matchScore > 20)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 5);

      if (matchedJobs.length === 0) continue;

      // Generate personalized summary with AI
      const topJob = matchedJobs[0];
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You write concise, encouraging weekly career digest emails. 2-3 sentences max. Be specific about the top match.",
          },
          {
            role: "user",
            content: `Write a weekly digest intro for ${candidate.name} (${candidate.job_title}). Their top job match this week is "${topJob.title}" at ${topJob.company} with a ${topJob.matchScore}% skill match. They have ${matchedJobs.length} total matches this week.`,
          },
        ],
        max_tokens: 150,
        temperature: 0.7,
      });

      const summary = completion.choices[0]?.message?.content || "";

      // Store digest as a notification
      await supabaseAdmin.from("notifications").insert({
        user_id: candidate.user_id,
        type: "job_match",
        title: `${matchedJobs.length} new job matches this week`,
        message: summary || `Top match: ${topJob.title} at ${topJob.company} (${topJob.matchScore}%)`,
        link: "/jobs",
        read: false,
      });

      digests.push({
        candidate: candidate.name,
        matchCount: matchedJobs.length,
        topMatch: { title: topJob.title, company: topJob.company, score: topJob.matchScore },
      });
    }

    return NextResponse.json({
      message: `Generated ${digests.length} weekly digests`,
      digests,
    });
  } catch (error) {
    console.error("Weekly digest error:", error);
    return NextResponse.json({ error: "Failed to generate digests" }, { status: 500 });
  }
}
