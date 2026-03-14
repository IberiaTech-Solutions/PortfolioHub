import { NextRequest, NextResponse } from 'next/server';

type GitHubRepo = {
  name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  updated_at: string;
  fork: boolean;
  archived: boolean;
  size: number;
};

type GitHubUser = {
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  bio: string | null;
};

export async function POST(request: NextRequest) {
  try {
    const { githubUrl } = await request.json();

    if (!githubUrl) {
      return NextResponse.json({ error: 'GitHub URL required' }, { status: 400 });
    }

    // Extract username from URL
    const match = githubUrl.match(/github\.com\/([^/]+)/);
    if (!match) {
      return NextResponse.json({ error: 'Invalid GitHub URL' }, { status: 400 });
    }
    const username = match[1];

    // Fetch user profile and repos in parallel
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`, {
        headers: { 'Accept': 'application/vnd.github.v3+json' },
      }),
      fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, {
        headers: { 'Accept': 'application/vnd.github.v3+json' },
      }),
    ]);

    if (!userRes.ok) {
      return NextResponse.json({ error: 'GitHub user not found' }, { status: 404 });
    }

    const user: GitHubUser = await userRes.json();
    const repos: GitHubRepo[] = reposRes.ok ? await reposRes.json() : [];

    // Filter out forks and archived repos
    const ownRepos = repos.filter(r => !r.fork && !r.archived);

    // Calculate scores
    const totalStars = ownRepos.reduce((sum, r) => sum + r.stargazers_count, 0);
    const totalForks = ownRepos.reduce((sum, r) => sum + r.forks_count, 0);

    // Languages distribution
    const langMap: Record<string, number> = {};
    ownRepos.forEach(r => {
      if (r.language) langMap[r.language] = (langMap[r.language] || 0) + 1;
    });
    const topLanguages = Object.entries(langMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([lang, count]) => ({ language: lang, repos: count }));

    // Activity score: repos updated in last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const recentRepos = ownRepos.filter(r => new Date(r.updated_at) > sixMonthsAgo).length;

    // Account age in years
    const accountAge = Math.floor((Date.now() - new Date(user.created_at).getTime()) / (365.25 * 24 * 60 * 60 * 1000));

    // Composite score (0-100)
    let score = 0;

    // Repo count (max 20 points)
    score += Math.min(ownRepos.length * 2, 20);

    // Stars (max 25 points)
    score += Math.min(totalStars * 0.5, 25);

    // Recent activity (max 20 points)
    score += Math.min(recentRepos * 4, 20);

    // Language diversity (max 10 points)
    score += Math.min(topLanguages.length * 2, 10);

    // Community (max 15 points)
    score += Math.min(user.followers * 0.3, 10);
    score += Math.min(totalForks * 0.5, 5);

    // Account age bonus (max 10 points)
    score += Math.min(accountAge * 2, 10);

    score = Math.round(Math.min(score, 100));

    // Determine level
    let level: string;
    if (score >= 80) level = "Expert";
    else if (score >= 60) level = "Advanced";
    else if (score >= 40) level = "Intermediate";
    else if (score >= 20) level = "Growing";
    else level = "Beginner";

    return NextResponse.json({
      score,
      level,
      username,
      stats: {
        repos: ownRepos.length,
        stars: totalStars,
        forks: totalForks,
        followers: user.followers,
        recentActivity: recentRepos,
        accountAge,
      },
      topLanguages,
      topRepos: ownRepos
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .slice(0, 3)
        .map(r => ({
          name: r.name,
          description: r.description,
          stars: r.stargazers_count,
          language: r.language,
        })),
    });
  } catch (error) {
    console.error('GitHub score error:', error);
    return NextResponse.json({ error: 'Failed to analyze GitHub profile' }, { status: 500 });
  }
}
