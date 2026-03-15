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

// --- Competition Score ---

export function estimateCompetition(
  job: Job,
  portfolio: Portfolio | null
): {
  estimatedApplicants: string;
  userPercentile: number | null;
  label: string;
} {
  // Estimate based on job age, remote policy, and experience level
  const now = Date.now();
  const posted = new Date(job.created_at).getTime();
  const hoursOld = (now - posted) / (1000 * 60 * 60);

  // Base estimate: ~10 applicants per hour for first 24h, then slows
  let estimate = 0;
  if (hoursOld < 24) {
    estimate = Math.floor(hoursOld * 8);
  } else if (hoursOld < 72) {
    estimate = 192 + Math.floor((hoursOld - 24) * 4);
  } else if (hoursOld < 168) {
    estimate = 384 + Math.floor((hoursOld - 72) * 2);
  } else {
    estimate = 576 + Math.floor((hoursOld - 168) * 0.5);
  }

  // Remote jobs get 3x more applicants
  if (job.remote_policy === "remote") {
    estimate = Math.floor(estimate * 2.5);
  }

  // Junior roles get more applicants
  if (job.experience_level === "junior") {
    estimate = Math.floor(estimate * 1.8);
  }

  // Format the estimate
  let estimatedApplicants: string;
  if (estimate < 10) estimatedApplicants = "< 10";
  else if (estimate < 50) estimatedApplicants = `~${Math.round(estimate / 10) * 10}`;
  else if (estimate < 200) estimatedApplicants = `~${Math.round(estimate / 25) * 25}`;
  else estimatedApplicants = `${Math.round(estimate / 50) * 50}+`;

  // Calculate user's percentile based on skill match
  let userPercentile: number | null = null;
  if (portfolio && job.skills && job.skills.length > 0) {
    const matchingSkills = job.skills.filter((s) =>
      portfolio.skills?.some((ps) => ps.toLowerCase() === s.toLowerCase())
    );
    const matchRatio = matchingSkills.length / job.skills.length;
    // Higher skill match = higher percentile (top %)
    userPercentile = Math.min(95, Math.max(5, Math.round((matchRatio * 80) + 10)));
  }

  // Label
  let label: string;
  if (estimate < 25) label = "Low competition";
  else if (estimate < 100) label = "Moderate";
  else if (estimate < 300) label = "Competitive";
  else label = "Very competitive";

  return { estimatedApplicants, userPercentile, label };
}

// --- Visa/Sponsorship Detection ---

export function detectVisaSponsorship(job: Job): {
  sponsorsVisa: boolean | null;
  hiresGlobally: boolean;
  eorCompany: string | null;
} {
  const desc = (job.description || "").toLowerCase();
  const title = (job.title || "").toLowerCase();
  const loc = (job.location || "").toLowerCase();
  const combined = `${desc} ${title} ${loc}`;

  // Check for visa sponsorship signals
  const sponsorSignals = [
    "visa sponsorship", "sponsor visa", "work authorization provided",
    "will sponsor", "h1b", "h-1b", "sponsorship available",
    "immigration support", "relocation assistance",
  ];
  const noSponsorSignals = [
    "no visa sponsorship", "no sponsorship", "must be authorized",
    "must be eligible to work", "no h1b", "us citizens only",
    "permanent resident", "without sponsorship",
  ];

  const hasNoSponsor = noSponsorSignals.some((s) => combined.includes(s));
  const hasSponsor = sponsorSignals.some((s) => combined.includes(s));

  let sponsorsVisa: boolean | null = null;
  if (hasNoSponsor) sponsorsVisa = false;
  else if (hasSponsor) sponsorsVisa = true;

  // Check for EOR/global remote companies
  const eorSignals: Record<string, string> = {
    "deel": "Deel",
    "remote.com": "Remote.com",
    "oyster hr": "Oyster",
    "omnipresent": "Omnipresent",
    "papaya global": "Papaya Global",
    "velocity global": "Velocity Global",
  };

  let eorCompany: string | null = null;
  for (const [signal, name] of Object.entries(eorSignals)) {
    if (combined.includes(signal)) {
      eorCompany = name;
      break;
    }
  }

  // Check for global remote signals
  const globalSignals = [
    "work from anywhere", "globally distributed", "remote worldwide",
    "remote - global", "global remote", "any location", "location independent",
  ];
  const hiresGlobally = globalSignals.some((s) => combined.includes(s)) || !!eorCompany;

  return { sponsorsVisa, hiresGlobally, eorCompany };
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
