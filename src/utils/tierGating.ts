export type PlanTier = "free" | "pro" | "recruiter";

export interface TierLimits {
  aiChatsPerDay: number;
  fitAssessmentsPerDay: number;
  jobMatchesPerWeek: number;
  canUseVanityUrl: boolean;
  canViewAnalytics: boolean;
  canUseWeeklyDigest: boolean;
  priorityInSearch: boolean;
  canVerifySkills: boolean;
  canPostJobs: boolean | number; // false, true, or limit
  canUseAtsApi: boolean;
  canFeatureProfile: boolean;
  canBulkChat: boolean;
}

export const TIER_LIMITS: Record<PlanTier, TierLimits> = {
  free: {
    aiChatsPerDay: 5,
    fitAssessmentsPerDay: 3,
    jobMatchesPerWeek: 3,
    canUseVanityUrl: false,
    canViewAnalytics: false,
    canUseWeeklyDigest: false,
    priorityInSearch: false,
    canVerifySkills: false,
    canPostJobs: false,
    canUseAtsApi: false,
    canFeatureProfile: false,
    canBulkChat: false,
  },
  pro: {
    aiChatsPerDay: Infinity,
    fitAssessmentsPerDay: Infinity,
    jobMatchesPerWeek: Infinity,
    canUseVanityUrl: true,
    canViewAnalytics: true,
    canUseWeeklyDigest: true,
    priorityInSearch: true,
    canVerifySkills: true,
    canPostJobs: false,
    canUseAtsApi: false,
    canFeatureProfile: true,
    canBulkChat: false,
  },
  recruiter: {
    aiChatsPerDay: Infinity,
    fitAssessmentsPerDay: Infinity,
    jobMatchesPerWeek: Infinity,
    canUseVanityUrl: true,
    canViewAnalytics: true,
    canUseWeeklyDigest: true,
    priorityInSearch: true,
    canVerifySkills: true,
    canPostJobs: true,
    canUseAtsApi: true,
    canFeatureProfile: true,
    canBulkChat: true,
  },
};

export function getTierLimits(plan: PlanTier): TierLimits {
  return TIER_LIMITS[plan] || TIER_LIMITS.free;
}

export function canPerformAction(
  plan: PlanTier,
  action: keyof TierLimits,
  currentUsage?: number
): { allowed: boolean; reason?: string; upgradeRequired?: PlanTier } {
  const limits = getTierLimits(plan);
  const limit = limits[action];

  if (typeof limit === "boolean") {
    if (!limit) {
      const requiredPlan = action === "canUseAtsApi" || action === "canBulkChat" || action === "canPostJobs"
        ? "recruiter"
        : "pro";
      return {
        allowed: false,
        reason: `This feature requires the ${requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)} plan`,
        upgradeRequired: requiredPlan,
      };
    }
    return { allowed: true };
  }

  if (typeof limit === "number" && currentUsage !== undefined) {
    if (currentUsage >= limit) {
      return {
        allowed: false,
        reason: `You've reached your daily limit of ${limit}. Upgrade to Pro for unlimited access.`,
        upgradeRequired: "pro",
      };
    }
  }

  return { allowed: true };
}
