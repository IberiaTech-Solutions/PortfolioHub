import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface GitHubRepo {
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics: string[];
  created_at: string;
  updated_at: string;
}

interface Project {
  title: string;
  description: string;
  url: string;
  techStack: string[];
  stars?: number;
  forks?: number;
  language?: string;
  lastUpdated: string;
}

export async function POST(request: NextRequest) {
  try {
    const { githubUrl, websiteUrl } = await request.json();

    if (!githubUrl && !websiteUrl) {
      return NextResponse.json({ projects: [] });
    }

    const projects: Project[] = [];

    // Fetch GitHub repositories if GitHub URL provided
    if (githubUrl) {
      try {
        const githubProjects = await fetchGitHubProjects(githubUrl);
        projects.push(...githubProjects);
      } catch (error) {
        console.error('Error fetching GitHub projects:', error);
      }
    }

    // Analyze website for projects if website URL provided
    if (websiteUrl) {
      try {
        const websiteProjects = await analyzeWebsiteForProjects(websiteUrl);
        projects.push(...websiteProjects);
      } catch (error) {
        console.error('Error analyzing website:', error);
      }
    }

    // Sort projects by stars/importance and limit to top 5
    const sortedProjects = projects
      .sort((a, b) => (b.stars || 0) - (a.stars || 0))
      .slice(0, 5);

    return NextResponse.json({ projects: sortedProjects });
  } catch (error) {
    console.error('Error detecting projects:', error);
    return NextResponse.json(
      { error: 'Failed to detect projects' },
      { status: 500 }
    );
  }
}

async function fetchGitHubProjects(githubUrl: string): Promise<Project[]> {
  // Extract username from GitHub URL
  const username = extractGitHubUsername(githubUrl);
  if (!username) {
    throw new Error('Invalid GitHub URL');
  }

  // Fetch user's repositories
  const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`, {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'PortfolioHub/1.0',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch GitHub repositories');
  }

  const repos: GitHubRepo[] = await response.json();

  // Filter and transform repositories
  const projects: Project[] = repos
    .filter(repo => !repo.name.includes('test') && !repo.name.includes('example'))
    .map(repo => ({
      title: repo.name.replace(/-/g, ' ').replace(/_/g, ' '),
      description: repo.description || 'No description available',
      url: repo.html_url,
      techStack: repo.language ? [repo.language] : [],
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      language: repo.language || undefined,
      lastUpdated: repo.updated_at,
    }));

  return projects;
}

async function analyzeWebsiteForProjects(websiteUrl: string): Promise<Project[]> {
  try {
    // Fetch website content
    const response = await fetch(websiteUrl, {
      headers: {
        'User-Agent': 'PortfolioHub/1.0',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch website');
    }

    const html = await response.text();
    
    // Use AI to extract project information from website content
    const prompt = `Analyze this website HTML content and extract information about projects, portfolios, or work samples mentioned. 
    Return a JSON array of projects with this structure:
    [
      {
        "title": "Project Name",
        "description": "Brief description",
        "url": "Project URL if mentioned",
        "techStack": ["Technology1", "Technology2"],
        "lastUpdated": "Date if mentioned"
      }
    ]
    
    Website URL: ${websiteUrl}
    HTML Content: ${html.substring(0, 5000)} // Limit content for API
    
    Focus on:
    - Project titles and descriptions
    - Technologies used
    - Links to projects or demos
    - Recent work or featured projects
    
    Return only the JSON array, no other text.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a web scraping expert that extracts project information from portfolio websites. Return only valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.3,
    });

    const responseText = completion.choices[0]?.message?.content || '[]';
    const projects = JSON.parse(responseText);
    
    return Array.isArray(projects) ? projects : [];
  } catch (error) {
    console.error('Error analyzing website:', error);
    return [];
  }
}

function extractGitHubUsername(githubUrl: string): string | null {
  const patterns = [
    /github\.com\/([^\/]+)/,
    /github\.com\/([^\/]+)\/?$/,
  ];

  for (const pattern of patterns) {
    const match = githubUrl.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}
