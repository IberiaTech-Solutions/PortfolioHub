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

    const formData = await request.formData();
    const file = formData.get('resume') as File | null;
    const textContent = formData.get('text') as string | null;

    let resumeText = textContent || '';

    if (file && !textContent) {
      // Read file as text (works for .txt, .md)
      // For PDFs, we extract text on the client side
      resumeText = await file.text();
    }

    if (!resumeText || resumeText.trim().length < 50) {
      return NextResponse.json(
        { error: 'Resume text is too short or empty. Please paste your resume text or upload a text-based file.' },
        { status: 400 }
      );
    }

    // Truncate to avoid token limits
    const truncated = resumeText.slice(0, 6000);

    const prompt = `You are an expert resume parser. Extract structured data from this resume text and return ONLY valid JSON (no markdown, no code blocks).

Resume text:
"""
${truncated}
"""

Return this exact JSON structure:
{
  "name": "<full name>",
  "job_title": "<most recent or primary job title>",
  "title": "<professional headline, e.g. 'Senior Full-Stack Developer with 5+ years experience'>",
  "description": "<2-3 sentence professional summary. If resume has a summary section, use that. Otherwise generate one from the experience.>",
  "skills": ["<skill1>", "<skill2>", "...up to 15 skills"],
  "location": "<city, state/country or 'Remote' if not specified>",
  "experience_level": "<Junior|Mid-level|Senior|Lead based on years of experience>",
  "preferred_work_type": ["<full-time|part-time|contract|freelance>"],
  "languages": "<spoken languages if mentioned, otherwise 'English'>",
  "website_url": "<personal website if found, otherwise empty string>",
  "github_url": "<github url if found, otherwise empty string>",
  "linkedin_url": "<linkedin url if found, otherwise empty string>",
  "projects": [
    {
      "title": "<project or company name>",
      "description": "<what they did there, 1-2 sentences>",
      "url": "",
      "techStack": ["<tech1>", "<tech2>"]
    }
  ]
}

Rules:
- Extract real data, don't invent anything
- Skills should be specific technologies, tools, and methodologies
- Projects should come from work experience or personal projects mentioned
- Maximum 5 projects, ordered by relevance
- If information is not in the resume, use empty string or empty array`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a resume parser. Always respond with valid JSON only.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 1500,
      temperature: 0.3,
    });

    const responseText = completion.choices[0]?.message?.content || '';

    // Clean potential markdown code blocks
    const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    try {
      const parsed = JSON.parse(cleaned);
      return NextResponse.json({ data: parsed });
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse resume data. Please try again.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Resume parse error:', error);
    return NextResponse.json(
      { error: 'Failed to parse resume' },
      { status: 500 }
    );
  }
}
