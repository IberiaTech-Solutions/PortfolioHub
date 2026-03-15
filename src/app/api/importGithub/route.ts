import { NextRequest, NextResponse } from "next/server";

interface GitHubUser {
  name: string | null;
  bio: string | null;
  location: string | null;
  blog: string;
  company: string | null;
  twitter_username: string | null;
  public_repos: number;
  followers: number;
  avatar_url: string;
  html_url: string;
}

interface GitHubRepo {
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics: string[];
  updated_at: string;
  fork: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const { githubUrl } = await request.json();
    if (!githubUrl) {
      return NextResponse.json({ error: "GitHub URL required" }, { status: 400 });
    }

    // Extract username
    const match = githubUrl.match(/github\.com\/([a-zA-Z0-9_-]+)/);
    if (!match) {
      return NextResponse.json({ error: "Invalid GitHub URL" }, { status: 400 });
    }
    const username = match[1];

    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "TalentAgent/1.0",
    };
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
    }

    // Fetch user profile + repos in parallel
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`, { headers }),
      fetch(`https://api.github.com/users/${username}/repos?sort=stars&per_page=30`, { headers }),
    ]);

    if (!userRes.ok) {
      return NextResponse.json({ error: "GitHub user not found" }, { status: 404 });
    }

    const user: GitHubUser = await userRes.json();
    const repos: GitHubRepo[] = reposRes.ok ? await reposRes.json() : [];

    // Extract languages from repos as skills
    const languageCounts: Record<string, number> = {};
    const allTopics = new Set<string>();

    const ownRepos = repos.filter((r) => !r.fork);
    ownRepos.forEach((repo) => {
      if (repo.language) {
        languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
      }
      repo.topics?.forEach((t) => allTopics.add(t));
    });

    // Sort languages by frequency
    const skills = [
      ...Object.entries(languageCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([lang]) => lang),
      ...Array.from(allTopics)
        .filter((t) => !Object.keys(languageCounts).map((l) => l.toLowerCase()).includes(t.toLowerCase()))
        .map((t) => t.charAt(0).toUpperCase() + t.slice(1).replace(/-/g, " "))
        .slice(0, 10),
    ];

    // Top 5 projects (non-fork, by stars)
    const projects = ownRepos
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 5)
      .map((repo) => ({
        title: repo.name.replace(/-/g, " ").replace(/_/g, " "),
        description: repo.description || "",
        url: repo.html_url,
        techStack: [repo.language, ...repo.topics.slice(0, 3)].filter(Boolean) as string[],
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        language: repo.language || undefined,
        lastUpdated: repo.updated_at,
      }));

    // Build profile data
    const profileData = {
      name: user.name || username,
      description: user.bio || "",
      location: user.location || "",
      website_url: user.blog || "",
      github_url: githubUrl,
      profile_image: user.avatar_url,
      skills,
      projects,
      // Estimate job title from bio or top language
      job_title: user.bio
        ? extractJobTitle(user.bio)
        : skills.length > 0
        ? `${skills[0]} Developer`
        : "Software Developer",
    };

    return NextResponse.json({ profile: profileData });
  } catch (error) {
    console.error("GitHub import error:", error);
    return NextResponse.json({ error: "Failed to import from GitHub" }, { status: 500 });
  }
}

function extractJobTitle(bio: string): string {
  // Common patterns in GitHub bios
  const patterns = [
    /(?:^|\s)((?:senior |junior |lead |staff |principal )?(?:software|frontend|backend|full[- ]?stack|mobile|web|devops|data|ml|ai) (?:engineer|developer|architect))/i,
    /(?:^|\s)((?:senior |junior |lead )?(?:designer|product manager|engineering manager))/i,
  ];
  for (const pattern of patterns) {
    const m = bio.match(pattern);
    if (m) return m[1].trim().replace(/^\w/, (c) => c.toUpperCase());
  }
  return "Software Developer";
}
