import { Portfolio } from "@/types";

export type TrustLevel = "new" | "basic" | "established" | "trusted" | "verified";

export interface TrustScore {
  score: number; // 0-100
  level: TrustLevel;
  label: string;
  signals: TrustSignal[];
}

export interface TrustSignal {
  name: string;
  met: boolean;
  points: number;
  description: string;
}

export function computeTrustScore(
  portfolio: Portfolio,
  githubScore?: { score: number } | null,
  analyticsData?: { views: number; chats: number; assessments: number } | null
): TrustScore {
  const signals: TrustSignal[] = [];

  // Profile completeness (max 20 pts)
  const hasName = !!portfolio.name;
  const hasTitle = !!portfolio.title;
  const hasDescription = !!portfolio.description && portfolio.description.length > 50;
  const hasProfileImage = !!portfolio.profile_image;
  const hasLocation = !!portfolio.location;
  const completeness = [hasName, hasTitle, hasDescription, hasProfileImage, hasLocation].filter(Boolean).length;

  signals.push({
    name: "Complete profile",
    met: completeness >= 4,
    points: completeness >= 4 ? 15 : Math.floor(completeness * 3),
    description: `${completeness}/5 key fields filled`,
  });

  // Skills (max 10 pts)
  const hasSkills = (portfolio.skills?.length ?? 0) >= 3;
  signals.push({
    name: "Skills listed",
    met: hasSkills,
    points: hasSkills ? 10 : Math.min(portfolio.skills?.length ?? 0, 3) * 3,
    description: `${portfolio.skills?.length ?? 0} skills added`,
  });

  // GitHub connected (max 15 pts)
  const hasGithub = !!portfolio.github_url;
  signals.push({
    name: "GitHub connected",
    met: hasGithub,
    points: hasGithub ? 10 : 0,
    description: hasGithub ? "GitHub profile linked" : "No GitHub profile",
  });

  // GitHub activity score (max 15 pts)
  if (githubScore && githubScore.score > 0) {
    const ghPoints = Math.min(15, Math.floor(githubScore.score / 7));
    signals.push({
      name: "Active GitHub",
      met: githubScore.score >= 30,
      points: ghPoints,
      description: `GitHub score: ${githubScore.score}/100`,
    });
  }

  // Projects (max 10 pts)
  const projectCount = portfolio.projects?.length ?? 0;
  signals.push({
    name: "Projects showcased",
    met: projectCount >= 2,
    points: projectCount >= 2 ? 10 : projectCount * 5,
    description: `${projectCount} project(s)`,
  });

  // Collaborations (max 15 pts)
  const verifiedCollabs = portfolio.collaborations?.filter(
    (c) => c.status === "accepted" || c.status === "verified"
  ).length ?? 0;
  signals.push({
    name: "Verified collaborations",
    met: verifiedCollabs >= 1,
    points: verifiedCollabs >= 2 ? 15 : verifiedCollabs * 10,
    description: `${verifiedCollabs} verified collab(s)`,
  });

  // Verified badge (max 10 pts)
  signals.push({
    name: "Verified by TalentAgent",
    met: !!portfolio.is_verified,
    points: portfolio.is_verified ? 10 : 0,
    description: portfolio.is_verified ? "Manually verified" : "Not yet verified",
  });

  // Platform activity (max 10 pts)
  if (analyticsData) {
    const totalActivity = analyticsData.views + analyticsData.chats * 3 + analyticsData.assessments * 5;
    const activityMet = totalActivity >= 10;
    signals.push({
      name: "Platform activity",
      met: activityMet,
      points: activityMet ? 10 : Math.min(10, totalActivity),
      description: `${analyticsData.views} views, ${analyticsData.chats} chats`,
    });
  }

  // LinkedIn connected (5 pts)
  const hasLinkedin = !!portfolio.linkedin_url;
  signals.push({
    name: "LinkedIn connected",
    met: hasLinkedin,
    points: hasLinkedin ? 5 : 0,
    description: hasLinkedin ? "LinkedIn profile linked" : "No LinkedIn profile",
  });

  const score = Math.min(100, signals.reduce((sum, s) => sum + s.points, 0));

  let level: TrustLevel;
  let label: string;
  if (score >= 80) {
    level = "verified";
    label = "Highly Trusted";
  } else if (score >= 60) {
    level = "trusted";
    label = "Trusted";
  } else if (score >= 40) {
    level = "established";
    label = "Established";
  } else if (score >= 20) {
    level = "basic";
    label = "Basic";
  } else {
    level = "new";
    label = "New";
  }

  return { score, level, label, signals };
}
