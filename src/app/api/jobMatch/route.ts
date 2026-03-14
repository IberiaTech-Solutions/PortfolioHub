import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

type PortfolioData = {
  name: string;
  job_title: string;
  title: string;
  description: string;
  skills: string[];
  projects: Array<{
    title: string;
    description: string;
    techStack: string[];
  }>;
  location?: string;
  experience_level?: string;
  preferred_work_type?: string[];
  languages?: string;
};

type JobData = {
  title: string;
  company: string;
  description: string;
  requirements?: string;
  skills: string[];
  location?: string;
  work_type?: string;
  remote_policy?: string;
  experience_level?: string;
};

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'AI matching is not configured' },
        { status: 503 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const { job, portfolio } = await request.json() as {
      job: JobData;
      portfolio: PortfolioData;
    };

    if (!job || !portfolio) {
      return NextResponse.json(
        { error: 'Job and portfolio data are required' },
        { status: 400 }
      );
    }

    const prompt = `You are an honest AI career advisor. Assess the fit between this candidate and this job. Be genuinely helpful — tell them the truth.

**Candidate:**
- Current Role: ${portfolio.job_title || 'Not specified'}
- Experience: ${portfolio.experience_level || 'Not specified'}
- Skills: ${portfolio.skills?.join(', ') || 'None listed'}
- Location: ${portfolio.location || 'Not specified'}
- Preferred Work: ${portfolio.preferred_work_type?.join(', ') || 'Not specified'}
- Projects: ${portfolio.projects?.map(p => `${p.title} (${p.techStack?.join(', ')})`).join('; ') || 'None'}

**Job:**
- Title: ${job.title}
- Company: ${job.company}
- Description: ${job.description}
- Requirements: ${job.requirements || 'Not specified'}
- Required Skills: ${job.skills?.join(', ') || 'Not specified'}
- Location: ${job.location || 'Not specified'}
- Work Type: ${job.work_type || 'Not specified'}
- Remote: ${job.remote_policy || 'Not specified'}
- Level: ${job.experience_level || 'Not specified'}

Respond in EXACTLY this JSON format (no markdown, no code blocks):
{
  "score": <number 0-100>,
  "verdict": "<Strong Match|Good Match|Moderate Match|Weak Match|Not Recommended>",
  "summary": "<1 sentence assessment>",
  "matchingSkills": ["<skill that matches>"],
  "missingSkills": ["<skill they lack>"],
  "shouldApply": <true or false>,
  "tip": "<1 sentence actionable advice>"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a career matching AI. Always respond with valid JSON only.',
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 300,
      temperature: 0.5,
    });

    const responseText = completion.choices[0]?.message?.content || '';

    try {
      const match = JSON.parse(responseText);
      return NextResponse.json({ match });
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse match response' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Job match error:', error);
    return NextResponse.json(
      { error: 'Failed to generate job match' },
      { status: 500 }
    );
  }
}
