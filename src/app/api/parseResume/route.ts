import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getAuthUser } from '@/utils/authCheck';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'AI not configured' }, { status: 503 });
    }

    const { user: authUser, error: authError } = await getAuthUser(request);
    if (authError || !authUser) return authError || NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const formData = await request.formData();
    const file = formData.get('resume') as File | null;
    const textContent = formData.get('text') as string | null;

    let resumeText = textContent || '';

    if (file && !textContent) {
      if (file.name.endsWith('.pdf') || file.type === 'application/pdf') {
        // Parse PDF server-side using pdf-parse v1
        try {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const pdfParse = require('pdf-parse');
          const buffer = Buffer.from(await file.arrayBuffer());
          const data = await pdfParse(buffer);
          resumeText = data.text || '';
        } catch (pdfError) {
          console.error('PDF parse error:', pdfError);
          return NextResponse.json(
            { error: 'Failed to read PDF. Try copying and pasting the text instead.' },
            { status: 400 }
          );
        }
      } else if (file.name.endsWith('.docx') || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        // Parse Word .docx server-side using mammoth
        try {
          const mammoth = await import('mammoth');
          const buffer = Buffer.from(await file.arrayBuffer());
          const result = await mammoth.extractRawText({ buffer });
          resumeText = result.value || '';
        } catch (docxError) {
          console.error('DOCX parse error:', docxError);
          return NextResponse.json(
            { error: 'Failed to read Word document. Try saving as PDF or pasting the text.' },
            { status: 400 }
          );
        }
      } else {
        // Read text files directly (.txt, .md)
        resumeText = await file.text();
      }
    }

    if (!resumeText || resumeText.trim().length < 50) {
      return NextResponse.json(
        { error: 'Resume text is too short or empty. Please paste your resume text or upload a text-based file.' },
        { status: 400 }
      );
    }

    // Pre-extract URLs from raw text (PDF hyperlinks often get stripped)
    const urlMatches = resumeText.match(/https?:\/\/[^\s,)>]+/gi) || [];
    const detectedGithub = urlMatches.find(u => u.includes('github.com')) || '';
    const detectedLinkedin = urlMatches.find(u => u.includes('linkedin.com')) || '';
    const detectedWebsite = urlMatches.find(u => !u.includes('github.com') && !u.includes('linkedin.com')) || '';

    // Truncate to avoid token limits (10k chars ≈ 2.5k tokens input)
    const truncated = resumeText.slice(0, 10000);

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
  "description": "<Comprehensive professional summary — 4-6 sentences covering experience, expertise, and key achievements. If resume has a summary/about section, expand on it. Include years of experience, domain expertise, and what makes this candidate stand out.>",
  "skills": ["<skill1>", "<skill2>", "...up to 15 skills"],
  "location": "<city, state/country or 'Remote' if not specified>",
  "experience_level": "<Junior|Mid-level|Senior|Lead based on years of experience>",
  "preferred_work_type": ["<full-time|part-time|contract|freelance>"],
  "languages": "<spoken languages if mentioned, otherwise 'English'>",
  "website_url": "<personal website if found, otherwise empty string>",
  "github_url": "<github url if found, otherwise empty string>",
  "linkedin_url": "<linkedin url if found, otherwise empty string>",
  "certifications": ["<certification name — issuer, e.g. 'AWS Solutions Architect — Amazon', 'PMP — PMI'>"],
  "education": "<degree, school, year — e.g. 'BS Computer Science, Stanford University, 2016'>",
  "projects": [
    {
      "title": "<company name> — <role title>",
      "description": "<2-3 sentences about key achievements and responsibilities at this role. Include metrics if mentioned (e.g. 'reduced costs by 40%').>",
      "url": "",
      "techStack": ["<tech1>", "<tech2>"],
      "dates": "<start date — end date, e.g. '2021 — 2023' or '2022 — Present'>"
    }
  ]
}

Rules:
- Extract real data, don't invent anything
- Skills should be specific technologies, tools, and methodologies
- Projects should come from work EXPERIENCE entries (each job/role = one project entry)
- Format title as "Company Name — Role Title" (e.g. "Stripe — Senior Software Engineer")
- Include actual date ranges from the resume, NOT today's date
- Maximum 5 entries, ordered by most recent first
- If information is not in the resume, use empty string or empty array`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a resume parser. Always respond with valid JSON only.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 2000,
      temperature: 0.3,
    });

    const responseText = completion.choices[0]?.message?.content || '';

    // Clean potential markdown code blocks
    const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    try {
      const parsed = JSON.parse(cleaned);

      // Merge regex-detected URLs as fallback (AI often misses hyperlinks in PDFs)
      if (!parsed.github_url && detectedGithub) parsed.github_url = detectedGithub;
      if (!parsed.linkedin_url && detectedLinkedin) parsed.linkedin_url = detectedLinkedin;
      if (!parsed.website_url && detectedWebsite) parsed.website_url = detectedWebsite;

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
