import { Portfolio } from "@/types";

export type FraudRisk = "none" | "low" | "medium" | "high";

export interface FraudSignal {
  name: string;
  triggered: boolean;
  weight: number;
  detail: string;
}

export interface FraudReport {
  risk: FraudRisk;
  score: number; // 0-100, higher = more suspicious
  signals: FraudSignal[];
}

export function detectFraud(portfolio: Portfolio): FraudReport {
  const signals: FraudSignal[] = [];

  // 1. No GitHub connected
  signals.push({
    name: "No GitHub profile",
    triggered: !portfolio.github_url,
    weight: 15,
    detail: portfolio.github_url
      ? "GitHub profile linked"
      : "No GitHub — can't verify coding activity",
  });

  // 2. No projects
  const projectCount = portfolio.projects?.length ?? 0;
  signals.push({
    name: "No projects listed",
    triggered: projectCount === 0,
    weight: 15,
    detail:
      projectCount > 0
        ? `${projectCount} project(s) listed`
        : "No projects — hard to verify claimed skills",
  });

  // 3. No collaborations
  const collabCount = portfolio.collaborations?.length ?? 0;
  signals.push({
    name: "No collaborations",
    triggered: collabCount === 0,
    weight: 10,
    detail:
      collabCount > 0
        ? `${collabCount} collaboration(s)`
        : "No third-party endorsements",
  });

  // 4. Generic/short description
  const desc = portfolio.description || "";
  const isShort = desc.length < 100;
  signals.push({
    name: "Very short description",
    triggered: isShort,
    weight: 10,
    detail: isShort
      ? `Only ${desc.length} characters — may be AI-generated placeholder`
      : `${desc.length} character description`,
  });

  // 5. Buzzword density — AI-generated text tends to overuse certain phrases
  const buzzwords = [
    "passionate",
    "leverage",
    "synergy",
    "dynamic",
    "innovative",
    "results-driven",
    "team player",
    "self-motivated",
    "detail-oriented",
    "cutting-edge",
    "thought leader",
    "paradigm",
  ];
  const descLower = desc.toLowerCase();
  const buzzwordCount = buzzwords.filter((b) => descLower.includes(b)).length;
  signals.push({
    name: "High buzzword density",
    triggered: buzzwordCount >= 3,
    weight: 15,
    detail:
      buzzwordCount >= 3
        ? `${buzzwordCount} generic buzzwords detected — may indicate AI-generated content`
        : `${buzzwordCount} buzzword(s) — normal`,
  });

  // 6. Skills count vs description length mismatch
  const skillCount = portfolio.skills?.length ?? 0;
  const skillsVsDescMismatch = skillCount > 10 && desc.length < 200;
  signals.push({
    name: "Skills/description mismatch",
    triggered: skillsVsDescMismatch,
    weight: 10,
    detail: skillsVsDescMismatch
      ? `${skillCount} skills listed but very short description — may have bulk-added skills without real backing`
      : "Skills and description are proportional",
  });

  // 7. No profile image
  signals.push({
    name: "No profile image",
    triggered: !portfolio.profile_image,
    weight: 5,
    detail: portfolio.profile_image
      ? "Profile image uploaded"
      : "No profile photo",
  });

  // 8. No LinkedIn
  signals.push({
    name: "No LinkedIn profile",
    triggered: !portfolio.linkedin_url,
    weight: 10,
    detail: portfolio.linkedin_url
      ? "LinkedIn profile linked"
      : "No LinkedIn — can't cross-reference identity",
  });

  // 9. Account age (new accounts are higher risk)
  const accountAgeDays = Math.floor(
    (Date.now() - new Date(portfolio.created_at).getTime()) / (1000 * 60 * 60 * 24)
  );
  signals.push({
    name: "Very new account",
    triggered: accountAgeDays < 3,
    weight: 10,
    detail:
      accountAgeDays < 3
        ? `Account created ${accountAgeDays} day(s) ago`
        : `Account is ${accountAgeDays} days old`,
  });

  // Calculate score
  const score = signals
    .filter((s) => s.triggered)
    .reduce((sum, s) => sum + s.weight, 0);

  let risk: FraudRisk;
  if (score >= 50) risk = "high";
  else if (score >= 30) risk = "medium";
  else if (score >= 15) risk = "low";
  else risk = "none";

  return { risk, score, signals };
}
