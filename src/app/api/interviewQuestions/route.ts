import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'AI not configured' }, { status: 503 });
    }

    // Basic auth check - verify request has auth cookie
    const cookieHeader = request.headers.get("cookie") || "";
    if (!cookieHeader.includes("sb-")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const { jobTitle, jobDescription, jobSkills, candidateSkills, candidateGaps } = await request.json();

    if (!jobTitle) {
      return NextResponse.json({ error: 'Job title required' }, { status: 400 });
    }

    const prompt = `Generate 5 interview preparation questions for a candidate applying to this role. Return ONLY valid JSON.

Role: ${jobTitle}
Job Description: ${jobDescription?.slice(0, 400) || 'Not provided'}
Required Skills: ${jobSkills?.join(', ') || 'Not specified'}
Candidate's Strengths: ${candidateSkills?.join(', ') || 'Not specified'}
Candidate's Gaps: ${candidateGaps?.join(', ') || 'None identified'}

Generate questions that:
- 2 questions should test their strongest skills (to let them shine)
- 2 questions should probe their gaps (to help them prepare)
- 1 behavioral/situational question relevant to the role

JSON format:
{
  "questions": [
    {"question": "...", "type": "strength", "tip": "Brief tip for answering well"},
    {"question": "...", "type": "strength", "tip": "..."},
    {"question": "...", "type": "gap", "tip": "..."},
    {"question": "...", "type": "gap", "tip": "..."},
    {"question": "...", "type": "behavioral", "tip": "..."}
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an interview coach. Return only valid JSON.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 600,
      temperature: 0.7,
    });

    const text = completion.choices[0]?.message?.content || '';
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    try {
      const result = JSON.parse(cleaned);
      return NextResponse.json(result);
    } catch {
      return NextResponse.json({ error: 'Failed to parse questions' }, { status: 500 });
    }
  } catch (error) {
    console.error('Interview questions error:', error);
    return NextResponse.json({ error: 'Failed to generate questions' }, { status: 500 });
  }
}
