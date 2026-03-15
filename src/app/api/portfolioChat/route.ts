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
    url: string;
    techStack: string[];
  }>;
  location?: string;
  experience_level?: string;
  preferred_work_type?: string[];
  languages?: string;
  website_url?: string;
  github_url?: string;
  linkedin_url?: string;
  collaborations?: Array<{
    collaborator_name: string;
    project_title: string;
    role: string;
    status: string;
  }>;
};

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

function buildSystemPrompt(portfolio: PortfolioData): string {
  const projectsList = portfolio.projects
    ?.map(p => `- ${p.title}: ${p.description} (Tech: ${p.techStack?.join(', ') || 'N/A'})`)
    .join('\n') || 'No projects listed';

  const collabsList = portfolio.collaborations
    ?.filter(c => c.status === 'accepted')
    .map(c => `- ${c.project_title} with ${c.collaborator_name} (Role: ${c.role})`)
    .join('\n') || 'No collaborations listed';

  return `You are an AI assistant representing ${portfolio.name}'s professional portfolio on TalentAgent. You speak in third person about ${portfolio.name} — you are NOT ${portfolio.name}, you are their portfolio AI agent.

Your job is to help anyone (recruiters, hiring managers, potential collaborators, or ${portfolio.name} themselves) learn about ${portfolio.name}'s skills, experience, and work. Be helpful, professional, and honest. If you don't have information about something, say so clearly rather than making things up.

Here is everything you know about ${portfolio.name}:

**Profile:**
- Name: ${portfolio.name}
- Title: ${portfolio.title || 'Not specified'}
- Role: ${portfolio.job_title || 'Not specified'}
- Location: ${portfolio.location || 'Not specified'}
- Experience Level: ${portfolio.experience_level || 'Not specified'}
- Preferred Work: ${portfolio.preferred_work_type?.join(', ') || 'Not specified'}
- Languages: ${portfolio.languages || 'Not specified'}

**About:**
${portfolio.description || 'No description provided'}

**Skills:**
${portfolio.skills?.join(', ') || 'No skills listed'}

**Projects:**
${projectsList}

**Collaborations:**
${collabsList}

**Links:**
- Website: ${portfolio.website_url || 'N/A'}
- GitHub: ${portfolio.github_url || 'N/A'}
- LinkedIn: ${portfolio.linkedin_url || 'N/A'}

Guidelines:
- Keep responses concise (2-4 sentences) unless the user asks for detail
- Highlight specific projects and skills when relevant
- Be honest about gaps — if something isn't in the portfolio, say "${portfolio.name} hasn't listed that information yet"
- When asked about fit for a role, be balanced — mention strengths AND potential gaps
- Use a friendly, professional tone
- If asked something personal or inappropriate, politely redirect to professional topics`;
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'AI chat is not configured' },
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

    const { message, portfolio, portfolioId, history } = await request.json() as {
      message: string;
      portfolio: PortfolioData;
      portfolioId?: string;
      history: Message[];
    };

    if (!message || !portfolio) {
      return NextResponse.json(
        { error: 'Message and portfolio data are required' },
        { status: 400 }
      );
    }

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: buildSystemPrompt(portfolio) },
    ];

    // Add conversation history (last 10 messages to keep context manageable)
    const recentHistory = (history || []).slice(-10);
    for (const msg of recentHistory) {
      messages.push({ role: msg.role, content: msg.content });
    }

    // Add the new user message
    messages.push({ role: 'user', content: message });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 300,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.';

    // Track chat event (fire-and-forget)
    if (portfolioId) {
      fetch(`${request.nextUrl.origin}/api/analytics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portfolio_id: portfolioId, event_type: 'chat' }),
      }).catch(() => {});
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Portfolio chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}
