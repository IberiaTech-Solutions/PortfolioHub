import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { field, content, fieldType, extractSkills } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ suggestions: [], extractedSkills: [] });
    }

    // If extracting skills, use a different prompt
    if (extractSkills && fieldType === 'description') {
      const skillsPrompt = `Extract all technical skills, programming languages, frameworks, tools, and technologies mentioned in this portfolio description. Return only the skill names, one per line, without numbers or bullets.

Content: "${content}"

Focus on:
- Programming languages (JavaScript, Python, Java, etc.)
- Frameworks and libraries (React, Vue, Django, etc.)
- Databases (PostgreSQL, MongoDB, etc.)
- Cloud platforms (AWS, Azure, GCP, etc.)
- Tools and technologies (Docker, Git, Figma, etc.)
- Methodologies (Agile, Scrum, etc.)

Return only the skill names, one per line:`;

      const skillsCompletion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a technical recruiter expert at identifying skills and technologies from job descriptions and portfolio content."
          },
          {
            role: "user",
            content: skillsPrompt
          }
        ],
        max_tokens: 150,
        temperature: 0.3,
      });

      const skillsResponse = skillsCompletion.choices[0]?.message?.content || '';
      const extractedSkills = skillsResponse
        .split('\n')
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0 && !skill.match(/^\d+\./))
        .slice(0, 10); // Limit to 10 skills

      return NextResponse.json({ suggestions: [], extractedSkills });
    }

    // Regular analysis prompt
    const prompt = `Analyze this ${fieldType} field content and provide 3 specific, actionable suggestions to improve it. Focus on clarity, impact, and professional presentation. Keep each suggestion to 1 sentence maximum.

Field: ${field}
Content: "${content}"

Provide exactly 3 suggestions in this format:
1. [suggestion]
2. [suggestion] 
3. [suggestion]

Focus on:
- Adding measurable metrics/numbers
- Using active verbs and strong language
- Improving clarity and readability
- Professional tone and impact
- Missing skills or technologies that could be relevant
- SEO and keyword optimization for job searches`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a professional career coach and resume expert. Provide concise, actionable feedback to help users improve their portfolio content."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || '';
    
    // Parse the numbered suggestions
    const suggestions = response
      .split('\n')
      .filter(line => line.match(/^\d+\./))
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(suggestion => suggestion.length > 0)
      .slice(0, 3);

    return NextResponse.json({ suggestions, extractedSkills: [] });
  } catch (error) {
    console.error('Error analyzing portfolio:', error);
    return NextResponse.json(
      { error: 'Failed to analyze portfolio content' },
      { status: 500 }
    );
  }
}
