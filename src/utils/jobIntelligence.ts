import { Job, Portfolio } from "@/types";

// --- Ghost Job Detection ---

export type GhostRisk = "none" | "low" | "medium" | "high";

export function detectGhostJob(job: Job): { risk: GhostRisk; reasons: string[] } {
  const reasons: string[] = [];
  const now = Date.now();
  const posted = new Date(job.created_at).getTime();
  const daysOld = Math.floor((now - posted) / (1000 * 60 * 60 * 24));

  if (daysOld > 60) {
    reasons.push("Posted over 60 days ago");
  } else if (daysOld > 30) {
    reasons.push("Posted over 30 days ago");
  }

  if (!job.salary_min && !job.salary_max) {
    reasons.push("No salary information");
  }

  const desc = (job.description || "").toLowerCase();
  if (desc.length < 100) {
    reasons.push("Very short description");
  }

  const vagueTerms = ["fast-paced", "rockstar", "ninja", "guru", "wear many hats", "self-starter"];
  const vagueCount = vagueTerms.filter((t) => desc.includes(t)).length;
  if (vagueCount >= 2) {
    reasons.push("Vague/generic description");
  }

  if (reasons.length === 0) return { risk: "none", reasons };
  if (reasons.length === 1) return { risk: "low", reasons };
  if (reasons.length === 2) return { risk: "medium", reasons };
  return { risk: "high", reasons };
}

// --- Apply Timing Signal ---

export type TimingSignal = "hot" | "warm" | "neutral" | "cold";

export function getTimingSignal(job: Job): {
  signal: TimingSignal;
  label: string;
  detail: string;
} {
  const now = Date.now();
  const posted = new Date(job.created_at).getTime();
  const hoursOld = (now - posted) / (1000 * 60 * 60);

  if (hoursOld < 6) {
    return {
      signal: "hot",
      label: "Apply now",
      detail: "Just posted — first-batch applicants get 4x more interviews",
    };
  }
  if (hoursOld < 24) {
    return {
      signal: "hot",
      label: "Fresh",
      detail: `Posted ${Math.floor(hoursOld)}h ago — still early`,
    };
  }
  if (hoursOld < 72) {
    const days = Math.floor(hoursOld / 24);
    return {
      signal: "warm",
      label: "Recent",
      detail: `Posted ${days}d ago — moderate competition`,
    };
  }
  if (hoursOld < 168) {
    return {
      signal: "neutral",
      label: "This week",
      detail: "Posted this week — expect 100+ applicants",
    };
  }
  const daysOld = Math.floor(hoursOld / 24);
  return {
    signal: "cold",
    label: `${daysOld}d ago`,
    detail: `Posted ${daysOld} days ago — high competition likely`,
  };
}

// --- Eligibility Check ---

export type EligibilityLevel = "eligible" | "restricted" | "unlikely";

export function checkEligibility(
  job: Job,
  portfolio: Portfolio | null
): {
  level: EligibilityLevel;
  reason: string;
} {
  if (!portfolio) {
    return { level: "eligible", reason: "Sign in to see eligibility" };
  }

  const userLocation = (portfolio.location || "").toLowerCase();
  const jobLocation = (job.location || "").toLowerCase();
  const isRemote = job.remote_policy === "remote";

  // If no location info, assume eligible
  if (!jobLocation || jobLocation === "not specified") {
    return { level: "eligible", reason: "No location restrictions listed" };
  }

  // Check if the job is remote
  if (isRemote) {
    // Check for country-restricted remote jobs
    const usIndicators = [
      "united states",
      ", us",
      "usa",
      "(us)",
      "us only",
      "us-based",
      "u.s.",
    ];
    const isUSRestricted = usIndicators.some((ind) => jobLocation.includes(ind));

    if (isUSRestricted && userLocation && !isUserInUS(userLocation)) {
      return {
        level: "restricted",
        reason: "Remote but US-based candidates only",
      };
    }

    // Check for EU/UK restrictions
    const euIndicators = ["europe", "eu only", "uk only", "emea"];
    const isEURestricted = euIndicators.some((ind) => jobLocation.includes(ind));

    if (isEURestricted && userLocation && !isUserInEU(userLocation)) {
      return {
        level: "restricted",
        reason: "Remote but EU/UK-based candidates only",
      };
    }

    return { level: "eligible", reason: "Remote role — you can apply from anywhere" };
  }

  // Onsite job — check location match
  if (userLocation) {
    const jobParts = jobLocation.split(",").map((s) => s.trim());
    const userParts = userLocation.split(",").map((s) => s.trim());

    // Check for country/state/city overlap
    const hasOverlap = jobParts.some((jp) =>
      userParts.some((up) => up.includes(jp) || jp.includes(up))
    );

    if (hasOverlap) {
      return { level: "eligible", reason: "Your location matches this job" };
    }

    return {
      level: "unlikely",
      reason: `Requires ${job.location} — you're in ${portfolio.location}`,
    };
  }

  return { level: "eligible", reason: "Add your location for better eligibility info" };
}

function isUserInUS(location: string): boolean {
  const usStates = [
    "alabama", "alaska", "arizona", "arkansas", "california", "colorado",
    "connecticut", "delaware", "florida", "georgia", "hawaii", "idaho",
    "illinois", "indiana", "iowa", "kansas", "kentucky", "louisiana",
    "maine", "maryland", "massachusetts", "michigan", "minnesota",
    "mississippi", "missouri", "montana", "nebraska", "nevada",
    "new hampshire", "new jersey", "new mexico", "new york",
    "north carolina", "north dakota", "ohio", "oklahoma", "oregon",
    "pennsylvania", "rhode island", "south carolina", "south dakota",
    "tennessee", "texas", "utah", "vermont", "virginia", "washington",
    "west virginia", "wisconsin", "wyoming",
    "united states", "usa", "us", "u.s.",
    // common abbreviations
    "ca", "ny", "tx", "fl", "wa", "co", "ma", "il", "pa", "oh",
    "sf", "la", "nyc", "seattle", "austin", "denver", "chicago", "boston",
    "san francisco", "los angeles", "new york",
  ];
  return usStates.some((s) => location.includes(s));
}

function isUserInEU(location: string): boolean {
  const euCountries = [
    "germany", "france", "spain", "italy", "netherlands", "belgium",
    "austria", "sweden", "denmark", "finland", "ireland", "portugal",
    "poland", "czech", "romania", "greece", "hungary", "uk",
    "united kingdom", "england", "scotland", "london", "berlin",
    "paris", "amsterdam", "dublin", "barcelona", "munich",
    "europe", "eu",
  ];
  return euCountries.some((c) => location.includes(c));
}
