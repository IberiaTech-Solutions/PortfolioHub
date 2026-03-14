import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

type CandidateMatch = {
  portfolio_id: string;
  name: string;
  job_title: string;
  score: number;
  verdict: string;
  matchingSkills: string[];
  missingSkills: string[];
  profile_image?: string;
};

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'AI not configured' }, { status: 503 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      return NextResponse.json({ error: 'DB not configured' }, { status: 503 });
    }

    const supabase = createClient(url, key);
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const { jobId } = await request.json();
    if (!jobId) {
      return NextResponse.json({ error: 'Job ID required' }, { status: 400 });
    }

    // Fetch the job
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Fetch all candidate portfolios
    const { data: candidates } = await supabase
      .from('portfolios')
      .select('id, name, job_title, skills, description, experience_level, location, projects, profile_image')
      .eq('user_role', 'candidate');

    if (!candidates || candidates.length === 0) {
      return NextResponse.json({ matches: [] });
    }

    // Score each candidate against the job using AI
    const matches: CandidateMatch[] = [];

    // Process in batches of 3 to avoid rate limits
    for (let i = 0; i < Math.min(candidates.length, 20); i++) {
      const candidate = candidates[i];

      const prompt = `Score this candidate's fit for this job. Return ONLY valid JSON.

Job: ${job.title} at ${job.company}
Required Skills: ${job.skills?.join(', ') || 'Not specified'}
Level: ${job.experience_level || 'Not specified'}
Description: ${job.description?.slice(0, 300)}

Candidate: ${candidate.name}
Role: ${candidate.job_title}
Skills: ${candidate.skills?.join(', ') || 'None'}
Experience: ${candidate.experience_level || 'Not specified'}
About: ${candidate.description?.slice(0, 200) || 'No description'}

JSON format:
{"score": <0-100>, "verdict": "<Strong|Good|Moderate|Weak>", "matchingSkills": ["skill1"], "missingSkills": ["skill1"]}`;

      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a job matching AI. Return only valid JSON.' },
            { role: 'user', content: prompt },
          ],
          max_tokens: 200,
          temperature: 0.3,
        });

        const text = completion.choices[0]?.message?.content || '';
        const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const result = JSON.parse(cleaned);

        matches.push({
          portfolio_id: candidate.id,
          name: candidate.name,
          job_title: candidate.job_title,
          score: result.score,
          verdict: result.verdict,
          matchingSkills: result.matchingSkills || [],
          missingSkills: result.missingSkills || [],
          profile_image: candidate.profile_image,
        });
      } catch {
        // Skip candidates that fail to parse
      }
    }

    // Sort by score descending
    matches.sort((a, b) => b.score - a.score);

    return NextResponse.json({ matches: matches.slice(0, 10) });
  } catch (error) {
    console.error('Auto-match error:', error);
    return NextResponse.json({ error: 'Failed to match candidates' }, { status: 500 });
  }
}
