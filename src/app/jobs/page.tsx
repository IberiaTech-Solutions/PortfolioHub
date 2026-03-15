"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/utils/supabase";
import { User } from "@supabase/supabase-js";
import { Portfolio, Job, JobMatch } from "@/types";
import {
  detectGhostJob,
  getTimingSignal,
  checkEligibility,
  estimateCompetition,
  detectVisaSponsorship,
} from "@/utils/jobIntelligence";
import {
  BriefcaseIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  SparklesIcon,
  BuildingOfficeIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  XCircleIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [externalJobs, setExternalJobs] = useState<Job[]>([]);
  const [loadingExternal, setLoadingExternal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeSource, setActiveSource] = useState<"all" | "posted" | "external">("all");
  const [user, setUser] = useState<User | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [matches, setMatches] = useState<Record<string, JobMatch>>({});
  const [matchingJobId, setMatchingJobId] = useState<string | null>(null);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [filterWorkType, setFilterWorkType] = useState<string>("");
  const [filterRemote, setFilterRemote] = useState<string>("");
  const [filterLevel, setFilterLevel] = useState<string>("");
  const [filterLocation, setFilterLocation] = useState<string>("");
  const [filterCurrency, setFilterCurrency] = useState<string>("");
  const [filterGlobalRemote, setFilterGlobalRemote] = useState(false);
  const [filterEligibleOnly, setFilterEligibleOnly] = useState(false);
  const [filterHideGhostJobs, setFilterHideGhostJobs] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [reportedJobs, setReportedJobs] = useState<Set<string>>(new Set());
  const [qualityMode, setQualityMode] = useState(false);
  const [dailyApplyCount, setDailyApplyCount] = useState(0);
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const DAILY_APPLY_LIMIT = 5;

  useEffect(() => {
    const init = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }

      // Get user & portfolio in parallel
      const [{ data: { user } }, { data: jobsData }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from("jobs").select("*").eq("is_active", true).order("created_at", { ascending: false }),
      ]);

      setUser(user);
      setJobs((jobsData as Job[]) || []);

      if (user) {
        const { data: portfolioData } = await supabase
          .from("portfolios")
          .select("*, collaborations(*)")
          .eq("user_id", user.id)
          .maybeSingle();

        if (portfolioData) {
          setPortfolio(portfolioData as unknown as Portfolio);
        }
      }

      setLoading(false);

      // Load user's applied jobs
      if (user) {
        supabase
          .from("job_applications")
          .select("job_id")
          .eq("user_id", user.id)
          .then(({ data }) => {
            if (data) setAppliedJobs(new Set((data as Array<{ job_id: string }>).map((a) => a.job_id)));
          });
      }

      // Fetch external jobs in background
      setLoadingExternal(true);
      fetch('/api/fetchJobs?query=software+developer')
        .then((r) => r.json())
        .then((data) => {
          if (data.jobs) setExternalJobs(data.jobs);
        })
        .catch(() => {})
        .finally(() => setLoadingExternal(false));
    };

    init();
  }, []);

  const trackApplication = async (job: Job) => {
    if (!supabase || !user) return;
    const match = matches[job.id];
    try {
      await supabase.from("job_applications").insert({
        user_id: user.id,
        job_id: job.id,
        job_title: job.title,
        job_company: job.company,
        status: "applied",
        fit_score: match?.score || null,
        applied_at: new Date().toISOString(),
      });
      setAppliedJobs((prev) => new Set(prev).add(job.id));
    } catch {
      // Silent — don't block the apply action
    }
  };

  const getAIMatch = async (job: Job) => {
    if (!portfolio || matchingJobId) return;
    if (matches[job.id]) {
      setExpandedJob(expandedJob === job.id ? null : job.id);
      return;
    }

    setMatchingJobId(job.id);
    setExpandedJob(job.id);

    try {
      const res = await fetch("/api/jobMatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job, portfolio }),
      });

      const data = await res.json();
      if (data.match) {
        setMatches((prev) => ({ ...prev, [job.id]: data.match }));
      }
    } catch {
      // Silently fail
    } finally {
      setMatchingJobId(null);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return "from-emerald-500 to-emerald-600";
    if (score >= 50) return "from-amber-500 to-amber-600";
    return "from-rose-500 to-rose-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 75) return "bg-emerald-500/10 border-emerald-500/30";
    if (score >= 50) return "bg-amber-500/10 border-amber-500/30";
    return "bg-rose-500/10 border-rose-500/30";
  };

  const formatSalary = (min?: number, max?: number, currency = "USD") => {
    if (!min && !max) return null;
    const fmt = (n: number) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(n);
    if (min && max) return `${fmt(min)} - ${fmt(max)}`;
    if (min) return `From ${fmt(min)}`;
    return `Up to ${fmt(max!)}`;
  };

  const workTypeLabel: Record<string, string> = {
    "full-time": "Full-time",
    "part-time": "Part-time",
    contract: "Contract",
    freelance: "Freelance",
  };

  const remoteLabel: Record<string, string> = {
    remote: "Remote",
    hybrid: "Hybrid",
    onsite: "On-site",
  };

  const levelLabel: Record<string, string> = {
    junior: "Junior",
    mid: "Mid-level",
    senior: "Senior",
    lead: "Lead",
  };

  // Combine jobs based on active source
  const allJobs = activeSource === "posted" ? jobs
    : activeSource === "external" ? externalJobs
    : [...jobs, ...externalJobs];

  // Extract unique locations and currencies from combined jobs
  const availableLocations = Array.from(
    new Set(allJobs.map((j) => {
      const loc = j.location || "";
      // Extract country or region from location string
      const parts = loc.split(",").map((s) => s.trim());
      return parts[parts.length - 1] || loc;
    }).filter(Boolean))
  ).sort();

  const availableCurrencies = Array.from(
    new Set(allJobs.map((j) => j.salary_currency).filter(Boolean))
  ).sort();

  const filteredJobs = allJobs.filter((job) => {
    if (filterWorkType && job.work_type !== filterWorkType) return false;
    if (filterRemote && job.remote_policy !== filterRemote) return false;
    if (filterLevel && job.experience_level !== filterLevel) return false;
    if (filterLocation && !(job.location || "").toLowerCase().includes(filterLocation.toLowerCase())) return false;
    if (filterCurrency && job.salary_currency !== filterCurrency) return false;
    if (filterGlobalRemote) {
      // Only show truly remote jobs without country restrictions
      if (job.remote_policy !== "remote") return false;
      const loc = (job.location || "").toLowerCase();
      const restricted = ["us only", "us-based", "united states only", "eu only", "uk only"];
      if (restricted.some((r) => loc.includes(r))) return false;
    }
    if (filterEligibleOnly && portfolio) {
      const elig = checkEligibility(job, portfolio);
      if (elig.level !== "eligible") return false;
    }
    if (filterHideGhostJobs) {
      const ghost = detectGhostJob(job);
      if (ghost.risk === "high" || ghost.risk === "medium") return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const searchable = `${job.title} ${job.company} ${job.description} ${job.skills?.join(" ")} ${job.location}`.toLowerCase();
      if (!searchable.includes(q)) return false;
    }
    return true;
  });

  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-slate-900 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-white/5 border border-white/10 rounded-full text-white text-sm font-bold mb-6 shadow-lg">
            <BriefcaseIcon className="w-4 h-4 mr-2" />
            AI-Powered Job Matching
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-white mb-4">
            Find Your Perfect Role
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            {portfolio
              ? "Browse jobs and let AI tell you honestly which ones are worth your time."
              : "Create a portfolio first to unlock AI-powered job matching."}
          </p>
          {!user && (
            <Link
              href="/auth?mode=signin"
              className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              Sign in to get AI matches
            </Link>
          )}
          {user && !portfolio && (
            <Link
              href="/create-portfolio"
              className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              Create Portfolio to Unlock Matching
            </Link>
          )}
        </div>

        {/* Source Tabs */}
        <div className="flex justify-center gap-2 mb-6">
          {(["all", "posted", "external"] as const).map((source) => (
            <button
              key={source}
              onClick={() => setActiveSource(source)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 border ${
                activeSource === source
                  ? "bg-gradient-to-r from-brand-500 to-brand-600 text-white border-brand-500 shadow-lg"
                  : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white"
              }`}
            >
              {source === "all" ? `All Jobs (${jobs.length + externalJobs.length})` :
               source === "posted" ? `Posted (${jobs.length})` :
               `External (${externalJobs.length})${loadingExternal ? '...' : ''}`}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-6">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search jobs by title, company, skill, or location..."
              className="w-full bg-white/10 border border-white/20 rounded-2xl pl-12 pr-4 py-3.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <FunnelIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Filter:</span>
          </div>
          <select
            value={filterWorkType}
            onChange={(e) => setFilterWorkType(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none cursor-pointer"
          >
            <option value="" className="bg-slate-800">All Types</option>
            {Object.entries(workTypeLabel).map(([val, label]) => (
              <option key={val} value={val} className="bg-slate-800">{label}</option>
            ))}
          </select>
          <select
            value={filterRemote}
            onChange={(e) => setFilterRemote(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none cursor-pointer"
          >
            <option value="" className="bg-slate-800">All Work Policy</option>
            {Object.entries(remoteLabel).map(([val, label]) => (
              <option key={val} value={val} className="bg-slate-800">{label}</option>
            ))}
          </select>
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none cursor-pointer"
          >
            <option value="" className="bg-slate-800">All Levels</option>
            {Object.entries(levelLabel).map(([val, label]) => (
              <option key={val} value={val} className="bg-slate-800">{label}</option>
            ))}
          </select>
          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none cursor-pointer"
          >
            <option value="" className="bg-slate-800">All Countries</option>
            {availableLocations.map((loc) => (
              <option key={loc} value={loc} className="bg-slate-800">{loc}</option>
            ))}
          </select>
          <select
            value={filterCurrency}
            onChange={(e) => setFilterCurrency(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none cursor-pointer"
          >
            <option value="" className="bg-slate-800">All Currencies</option>
            {availableCurrencies.map((cur) => (
              <option key={cur} value={cur} className="bg-slate-800">{cur}</option>
            ))}
          </select>
          <span className="text-gray-500 text-sm">
            {filteredJobs.length} {filteredJobs.length === 1 ? "job" : "jobs"}
          </span>
        </div>

        {/* Smart Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {/* Quality Mode Toggle */}
          {portfolio && (
            <button
              onClick={() => setQualityMode(!qualityMode)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 border ${
                qualityMode
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              Quality Mode {qualityMode ? `(${DAILY_APPLY_LIMIT - dailyApplyCount} left today)` : ""}
            </button>
          )}
          <span className="text-gray-500 text-xs font-medium mr-1">Smart:</span>
          <button
            onClick={() => setFilterGlobalRemote(!filterGlobalRemote)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 border ${
              filterGlobalRemote
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Hires Globally
          </button>
          {portfolio && (
            <button
              onClick={() => setFilterEligibleOnly(!filterEligibleOnly)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 border ${
                filterEligibleOnly
                  ? "bg-brand-500/20 text-brand-300 border-brand-500/40"
                  : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"
              }`}
            >
              <CheckCircleIcon className="w-3.5 h-3.5" />
              Eligible for Me
            </button>
          )}
          <button
            onClick={() => setFilterHideGhostJobs(!filterHideGhostJobs)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 border ${
              filterHideGhostJobs
                ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
            Hide Ghost Jobs
          </button>
        </div>

        {/* Jobs List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-xl"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-white/10 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-white/5 rounded w-1/4 mb-3"></div>
                    <div className="h-3 bg-white/5 rounded w-full mb-2"></div>
                    <div className="h-3 bg-white/5 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <BriefcaseIcon className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-display font-bold text-white mb-3">
              {jobs.length === 0 ? "No jobs posted yet" : "No jobs match your filters"}
            </h2>
            <p className="text-gray-400 mb-6">
              {jobs.length === 0
                ? "Be the first to post a job and attract top talent."
                : "Try adjusting your filters to see more results."}
            </p>
            {user && jobs.length === 0 && (
              <Link
                href="/jobs/post"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Post a Job
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => {
              const match = matches[job.id];
              const isExpanded = expandedJob === job.id;
              const isMatching = matchingJobId === job.id;
              const ghost = detectGhostJob(job);
              const timing = getTimingSignal(job);
              const eligibility = checkEligibility(job, portfolio);
              const competition = estimateCompetition(job, portfolio);
              const visa = detectVisaSponsorship(job);

              return (
                <div
                  key={job.id}
                  className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:border-white/30"
                >
                  {/* Job Card */}
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Company Icon */}
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                          {job.company_logo ? (
                            <img src={job.company_logo} alt={job.company} className="w-8 h-8 rounded-lg object-cover" />
                          ) : (
                            <BuildingOfficeIcon className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        {match && match.score < 30 && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center">
                            <XCircleIcon className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Job Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-heading font-bold text-white mb-1">
                              {job.title}
                            </h3>
                            <p className="text-brand-300 font-medium text-sm">
                              {job.company}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {match && match.score < 30 && (
                              <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 rounded-md text-xs font-medium">
                                Skip
                              </span>
                            )}
                            {eligibility.level === "eligible" && portfolio && (
                              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-md text-xs font-medium" title={eligibility.reason}>
                                <CheckCircleIcon className="w-3 h-3 inline mr-0.5" />
                                Eligible
                              </span>
                            )}
                            <span className="text-gray-500 text-xs whitespace-nowrap">
                              {timeAgo(job.created_at)}
                            </span>
                          </div>
                        </div>

                        {/* Intelligence Badges */}
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {/* Timing Signal */}
                          {timing.signal === "hot" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-500/15 text-orange-300 rounded-md text-xs font-bold border border-orange-500/30" title={timing.detail}>
                              <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse"></span>
                              {timing.label}
                            </span>
                          )}
                          {timing.signal === "warm" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-500/15 text-yellow-300 rounded-md text-xs font-medium border border-yellow-500/30" title={timing.detail}>
                              {timing.label}
                            </span>
                          )}
                          {timing.signal === "cold" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-500/15 text-gray-400 rounded-md text-xs font-medium border border-gray-500/30" title={timing.detail}>
                              {timing.label}
                            </span>
                          )}

                          {/* Eligibility */}
                          {eligibility.level === "restricted" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/15 text-amber-300 rounded-md text-xs font-medium border border-amber-500/30" title={eligibility.reason}>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                              Location restricted
                            </span>
                          )}
                          {eligibility.level === "unlikely" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-500/15 text-rose-300 rounded-md text-xs font-medium border border-rose-500/30" title={eligibility.reason}>
                              <XCircleIcon className="w-3 h-3" />
                              Location mismatch
                            </span>
                          )}

                          {/* Ghost Job Warning */}
                          {ghost.risk === "high" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-500/15 text-gray-400 rounded-md text-xs font-medium border border-gray-500/30" title={ghost.reasons.join(". ")}>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                              May be inactive
                            </span>
                          )}
                          {ghost.risk === "medium" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-500/10 text-gray-500 rounded-md text-xs font-medium border border-gray-500/20" title={ghost.reasons.join(". ")}>
                              Possibly stale
                            </span>
                          )}

                          {/* Competition Score */}
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${
                            competition.label === "Low competition"
                              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                              : competition.label === "Moderate"
                              ? "bg-yellow-500/15 text-yellow-300 border-yellow-500/30"
                              : competition.label === "Competitive"
                              ? "bg-orange-500/15 text-orange-300 border-orange-500/30"
                              : "bg-rose-500/15 text-rose-300 border-rose-500/30"
                          }`} title={`Est. ${competition.estimatedApplicants} applicants`}>
                            {competition.estimatedApplicants} applicants
                          </span>

                          {/* User Percentile */}
                          {competition.userPercentile !== null && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-500/15 text-brand-300 rounded-md text-xs font-bold border border-brand-500/30" title="Based on your skill match vs job requirements">
                              Top {100 - competition.userPercentile}%
                            </span>
                          )}

                          {/* Visa/Global Signals */}
                          {visa.sponsorsVisa === true && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/15 text-blue-300 rounded-md text-xs font-medium border border-blue-500/30">
                              Sponsors visa
                            </span>
                          )}
                          {visa.sponsorsVisa === false && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-500/10 text-gray-500 rounded-md text-xs font-medium border border-gray-500/20">
                              No sponsorship
                            </span>
                          )}
                          {visa.hiresGlobally && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/15 text-emerald-300 rounded-md text-xs font-medium border border-emerald-500/30">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              Hires globally{visa.eorCompany ? ` via ${visa.eorCompany}` : ''}
                            </span>
                          )}
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          {job.work_type && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-500/20 text-brand-300 rounded-lg text-xs font-medium border border-brand-500/30">
                              <ClockIcon className="w-3 h-3" />
                              {workTypeLabel[job.work_type] || job.work_type}
                            </span>
                          )}
                          {job.remote_policy && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg text-xs font-medium border border-emerald-500/30">
                              <MapPinIcon className="w-3 h-3" />
                              {remoteLabel[job.remote_policy] || job.remote_policy}
                            </span>
                          )}
                          {job.location && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/10 text-gray-300 rounded-lg text-xs font-medium border border-white/20">
                              <MapPinIcon className="w-3 h-3" />
                              {job.location}
                            </span>
                          )}
                          {job.experience_level && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-xs font-medium border border-purple-500/30">
                              {levelLabel[job.experience_level] || job.experience_level}
                            </span>
                          )}
                          {formatSalary(job.salary_min, job.salary_max, job.salary_currency) && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/20 text-amber-300 rounded-lg text-xs font-medium border border-amber-500/30">
                              <CurrencyDollarIcon className="w-3 h-3" />
                              {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
                            </span>
                          )}
                        </div>

                        {/* Description preview */}
                        <p className="text-gray-400 text-sm mt-3 line-clamp-2 leading-relaxed">
                          {job.description}
                        </p>

                        {/* Skills */}
                        {job.skills && job.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {job.skills.slice(0, 6).map((skill, i) => {
                              const isMatch = portfolio?.skills?.some(
                                (s) => s.toLowerCase() === skill.toLowerCase()
                              );
                              return (
                                <span
                                  key={i}
                                  className={`px-2 py-0.5 rounded-md text-xs font-medium border ${
                                    isMatch
                                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                      : "bg-white/5 text-gray-400 border-white/10"
                                  }`}
                                >
                                  {isMatch && <span className="mr-1">+</span>}
                                  {skill}
                                </span>
                              );
                            })}
                            {job.skills.length > 6 && (
                              <span className="px-2 py-0.5 text-gray-500 text-xs">
                                +{job.skills.length - 6} more
                              </span>
                            )}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-3 mt-4">
                          {portfolio && (
                            <button
                              onClick={() => getAIMatch(job)}
                              disabled={isMatching}
                              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 shadow-lg hover:shadow-xl ${
                                match
                                  ? `${getScoreBg(match.score)} text-white border`
                                  : "bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white"
                              }`}
                            >
                              {isMatching ? (
                                <>
                                  <div className="flex items-center space-x-1">
                                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></div>
                                  </div>
                                  Analyzing...
                                </>
                              ) : match ? (
                                <>
                                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-r ${getScoreColor(match.score)} text-white text-xs font-bold`}>
                                    {match.score}
                                  </span>
                                  {match.verdict}
                                </>
                              ) : (
                                <>
                                  <SparklesIcon className="w-4 h-4" />
                                  AI Match Score
                                </>
                              )}
                            </button>
                          )}
                          {(job.application_url || job.application_email) && (
                            appliedJobs.has(job.id) ? (
                              <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-xl text-sm font-bold border border-emerald-500/30">
                                <CheckCircleIcon className="w-4 h-4" />
                                Applied
                              </span>
                            ) : qualityMode && dailyApplyCount >= DAILY_APPLY_LIMIT ? (
                              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 text-gray-500 rounded-xl text-sm font-bold border border-white/10 cursor-not-allowed" title="Daily apply limit reached — Quality Mode keeps you focused on your best matches">
                                Limit reached
                              </span>
                            ) : (
                              <a
                                href={job.application_url || `mailto:${job.application_email}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => {
                                  trackApplication(job);
                                  if (qualityMode) setDailyApplyCount((c) => c + 1);
                                }}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-bold transition-all duration-300 border border-white/20"
                              >
                                Apply
                                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                              </a>
                            )
                          )}
                          {/* Report Button */}
                          <button
                            onClick={() => {
                              setReportedJobs((prev) => new Set(prev).add(job.id));
                              // In the future: POST to /api/reportJob
                            }}
                            disabled={reportedJobs.has(job.id)}
                            className={`ml-auto p-2 rounded-lg transition-all text-xs ${
                              reportedJobs.has(job.id)
                                ? "text-gray-600 cursor-not-allowed"
                                : "text-gray-500 hover:text-rose-400 hover:bg-rose-500/10"
                            }`}
                            title={reportedJobs.has(job.id) ? "Reported — thanks for flagging" : "Report suspicious listing"}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Match Results */}
                  {isExpanded && match && (
                    <div className={`border-t border-white/10 p-6 ${getScoreBg(match.score)}`}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Summary */}
                        <div className="sm:col-span-2">
                          <div className="flex items-center gap-3 mb-2">
                            {match.shouldApply ? (
                              <CheckCircleIcon className="w-5 h-5 text-emerald-400" />
                            ) : (
                              <XCircleIcon className="w-5 h-5 text-rose-400" />
                            )}
                            <p className="text-white text-sm font-bold">
                              {match.shouldApply
                                ? "You should consider applying"
                                : "This might not be the best fit right now"}
                            </p>
                          </div>
                          <p className="text-gray-300 text-sm">{match.summary}</p>
                        </div>

                        {/* Matching Skills */}
                        {match.matchingSkills?.length > 0 && (
                          <div>
                            <h4 className="text-emerald-400 text-xs font-bold uppercase tracking-wide mb-2">
                              Matching Skills
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                              {match.matchingSkills.map((s, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-md text-xs border border-emerald-500/30"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Missing Skills */}
                        {match.missingSkills?.length > 0 && (
                          <div>
                            <h4 className="text-amber-400 text-xs font-bold uppercase tracking-wide mb-2">
                              Skills to Build
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                              {match.missingSkills.map((s, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-md text-xs border border-amber-500/30"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Tip */}
                        {match.tip && (
                          <div className="sm:col-span-2 bg-white/5 rounded-xl p-3 border border-white/10">
                            <p className="text-brand-300 text-sm">
                              <span className="font-bold">Tip:</span> {match.tip}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
