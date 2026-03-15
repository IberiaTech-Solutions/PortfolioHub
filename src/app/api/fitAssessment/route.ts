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

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'AI assessment is not configured' },
        { status: 503 }
      );
    }

    // Basic auth check - verify request has auth cookie
    const cookieHeader = request.headers.get("cookie") || "";
    if (!cookieHeader.includes("sb-")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const { jobDescription, portfolio, portfolioId } = await request.json() as {
      jobDescription: string;
      portfolio: PortfolioData;
      portfolioId?: string;
    };

    if (!jobDescription || !portfolio) {
      return NextResponse.json(
        { error: 'Job description and portfolio data are required' },
        { status: 400 }
      );
    }

    const prompt = `You are an honest career assessment AI. Analyze the fit between this candidate and the job posting. Be genuinely helpful — if the fit is poor, say so clearly. This honesty builds trust.

**Candidate Profile:**
- Name: ${portfolio.name}
- Current Role: ${portfolio.job_title || 'Not specified'}
- Experience Level: ${portfolio.experience_level || 'Not specified'}
- Skills: ${portfolio.skills?.join(', ') || 'None listed'}
- Location: ${portfolio.location || 'Not specified'}
- Preferred Work: ${portfolio.preferred_work_type?.join(', ') || 'Not specified'}
- About: ${portfolio.description || 'No description'}
- Projects: ${portfolio.projects?.map(p => `${p.title} (${p.techStack?.join(', ')})`).join('; ') || 'None listed'}

**Job Posting:**
${jobDescription}

Respond in EXACTLY this JSON format (no markdown, no code blocks):
{
  "score": <number 0-100>,
  "verdict": "<one of: Strong Match|Good Match|Moderate Match|Weak Match|Not Recommended>",
  "summary": "<1-2 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "gaps": ["<gap 1>", "<gap 2>"],
  "advice": "<1-2 sentence actionable advice for the candidate>",
  "shouldApply": <true or false>
}

Be honest. A score of 30 with "don't apply" is more valuable than false encouragement.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a career assessment AI. Always respond with valid JSON only, no markdown formatting.',
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 400,
      temperature: 0.5,
    });

    const responseText = completion.choices[0]?.message?.content || '';

    try {
      const assessment = JSON.parse(responseText);

      // Track fit assessment event
      if (portfolioId) {
        fetch(`${request.nextUrl.origin}/api/analytics`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ portfolio_id: portfolioId, event_type: 'fit_assessment' }),
        }).catch(() => {});
      }

      return NextResponse.json({ assessment });
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse assessment response' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Fit assessment error:', error);
    return NextResponse.json(
      { error: 'Failed to generate fit assessment' },
      { status: 500 }
    );
  }
}
