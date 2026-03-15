"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/utils/supabase";
import { User } from "@supabase/supabase-js";
import { Portfolio, Job, JobApplication } from "@/types";
import {
  BriefcaseIcon,
  UserGroupIcon,
  ChartBarIcon,
  SparklesIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

export default function RecruiterDashboard() {
  const router = useRouter();
  const [, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Portfolio[]>([]);
  const [savedSearches, setSavedSearches] = useState<Array<{ query: string; created_at: string }>>([]);
  const [applicants, setApplicants] = useState<JobApplication[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({ totalViews: 0, totalChats: 0, totalAssessments: 0, totalApplicants: 0 });

  useEffect(() => {
    const init = async () => {
      if (!supabase) { setLoading(false); return; }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth?redirect=/recruiter"); return; }
      setUser(user);

      // Fetch portfolio to check role
      const { data: portfolioData } = await supabase
        .from("portfolios")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!portfolioData || portfolioData.user_role !== "recruiter") {
        router.push("/");
        return;
      }
      setPortfolio(portfolioData as unknown as Portfolio);

      // Fetch recruiter's jobs
      const { data: jobsData } = await supabase
        .from("jobs")
        .select("*")
        .eq("posted_by", user.id)
        .order("created_at", { ascending: false });

      if (jobsData) setMyJobs(jobsData as Job[]);

      // Fetch recent candidates (top 10 by created_at)
      const { data: candidatesData } = await supabase
        .from("portfolios")
        .select("*")
        .eq("user_role", "candidate")
        .order("created_at", { ascending: false })
        .limit(10);

      if (candidatesData) setCandidates(candidatesData as Portfolio[]);

      // Aggregate stats from posted jobs
      const jobIds = ((jobsData || []) as Job[]).map((j) => j.id);
      if (jobIds.length > 0) {
        const { data: analyticsData } = await supabase
          .from("portfolio_analytics")
          .select("event_type")
          .in("portfolio_id", jobIds);

        if (analyticsData) {
          const events = analyticsData as Array<{ event_type: string }>;
          const views = events.filter((a) => a.event_type === "view").length;
          const chats = events.filter((a) => a.event_type === "chat").length;
          const assessments = events.filter((a) => a.event_type === "fit_assessment").length;
          setStats({ totalViews: views, totalChats: chats, totalAssessments: assessments, totalApplicants: candidatesData?.length || 0 });
        }
      }

      // Fetch applicants for recruiter's jobs
      if (jobIds.length > 0) {
        const { data: applicantData } = await supabase
          .from("job_applications")
          .select("*")
          .in("job_id", jobIds)
          .order("applied_at", { ascending: false })
          .limit(50);

        if (applicantData) setApplicants(applicantData as JobApplication[]);
      }

      setLoading(false);
    };
    init();
  }, [router]);

  const searchCandidates = async () => {
    if (!searchQuery.trim() || !supabase) return;
    const term = `%${searchQuery.trim()}%`;
    const { data } = await supabase
      .from("portfolios")
      .select("*")
      .eq("user_role", "candidate")
      .or(`title.ilike.${term},description.ilike.${term},job_title.ilike.${term},name.ilike.${term}`)
      .limit(20);

    if (data) setCandidates(data as Portfolio[]);

    // Save search
    setSavedSearches((prev) => [
      { query: searchQuery.trim(), created_at: new Date().toISOString() },
      ...prev.slice(0, 9),
    ]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center px-4 py-2 bg-white/5 border border-white/10 rounded-full text-gray-400 text-sm font-bold mb-6">
            <ChartBarIcon className="w-4 h-4 mr-2" />
            {portfolio?.company_name || "Recruiter"} Dashboard
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mb-3">
            Manage Talent Pipeline
          </h1>
          <p className="text-gray-400 mb-6">
            Post jobs, search candidates, and track engagement — all in one place.
          </p>
          <Link
            href="/jobs/post"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-xl font-bold text-sm transition-all hover:shadow-xl"
          >
            <BriefcaseIcon className="w-4 h-4" />
            Post a Job
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-500/20 rounded-lg flex items-center justify-center">
                <BriefcaseIcon className="w-5 h-5 text-brand-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{myJobs.length}</p>
                <p className="text-xs text-gray-500">Active Jobs</p>
              </div>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <EyeIcon className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.totalViews}</p>
                <p className="text-xs text-gray-500">Job Views</p>
              </div>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <ChatBubbleLeftRightIcon className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.totalChats}</p>
                <p className="text-xs text-gray-500">AI Chats</p>
              </div>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.totalAssessments}</p>
                <p className="text-xs text-gray-500">Fit Assessments</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: My Jobs */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h2 className="text-sm font-heading font-bold text-white mb-4 flex items-center gap-2">
                <BriefcaseIcon className="w-4 h-4 text-brand-400" />
                My Job Postings
              </h2>
              {myJobs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm mb-3">No jobs posted yet</p>
                  <Link href="/jobs/post" className="text-brand-400 text-sm font-medium hover:text-brand-300">
                    Post your first job
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {myJobs.map((job) => (
                    <div key={job.id} className="p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                      <h3 className="text-sm font-medium text-white truncate">{job.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">{job.company}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] px-2 py-0.5 bg-emerald-500/15 text-emerald-400 rounded-md font-medium">
                          {job.is_active ? "Active" : "Closed"}
                        </span>
                        <span className="text-[10px] text-gray-600">
                          {new Date(job.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Saved Searches */}
              {savedSearches.length > 0 && (
                <div className="mt-6 pt-4 border-t border-white/5">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Recent Searches</h3>
                  <div className="space-y-1">
                    {savedSearches.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => { setSearchQuery(s.query); searchCandidates(); }}
                        className="block w-full text-left px-2 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                      >
                        {s.query}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Candidate Search */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h2 className="text-sm font-heading font-bold text-white mb-4 flex items-center gap-2">
                <UserGroupIcon className="w-4 h-4 text-emerald-400" />
                Find Candidates
              </h2>

              {/* Search */}
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && searchCandidates()}
                    placeholder="Search by name, skill, title..."
                    className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <button
                  onClick={searchCandidates}
                  className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold transition-colors"
                >
                  Search
                </button>
              </div>

              {/* Candidate Grid */}
              <div className="space-y-3">
                {candidates.map((candidate) => (
                  <Link
                    key={candidate.id}
                    href={`/portfolio/${candidate.id}`}
                    className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5 hover:border-brand-500/30 hover:bg-white/10 transition-all group"
                  >
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {candidate.profile_image ? (
                        <Image
                          src={candidate.profile_image}
                          alt={candidate.name}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {candidate.name?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium text-white group-hover:text-brand-300 truncate transition-colors">
                          {candidate.name}
                        </h3>
                        {candidate.is_verified && (
                          <svg className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate">{candidate.job_title}</p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {candidate.skills?.slice(0, 4).map((skill) => (
                          <span key={skill} className="px-1.5 py-0.5 bg-white/10 text-gray-400 rounded text-[10px] font-medium">
                            {skill}
                          </span>
                        ))}
                        {(candidate.skills?.length ?? 0) > 4 && (
                          <span className="text-[10px] text-gray-600">+{candidate.skills!.length - 4}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {candidate.location && (
                        <span className="text-[10px] text-gray-600 hidden sm:block">{candidate.location}</span>
                      )}
                      <SparklesIcon className="w-4 h-4 text-gray-600 group-hover:text-brand-400 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Applicants Section */}
        {applicants.length > 0 && (
          <div className="mt-8">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h2 className="text-sm font-heading font-bold text-white mb-4 flex items-center gap-2">
                <UserGroupIcon className="w-4 h-4 text-purple-400" />
                Recent Applicants ({applicants.length})
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-2 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Job</th>
                      <th className="text-left py-2 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Applicant</th>
                      <th className="hidden sm:table-cell text-left py-2 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Fit Score</th>
                      <th className="text-left py-2 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="hidden sm:table-cell text-left py-2 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applicants.map((app) => (
                      <tr key={app.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-3">
                          <p className="text-white font-medium text-xs truncate max-w-[200px]">{app.job_title}</p>
                          <p className="text-gray-600 text-[10px]">{app.job_company}</p>
                        </td>
                        <td className="py-3 px-3">
                          {app.applicant_portfolio_id ? (
                            <Link href={`/portfolio/${app.applicant_portfolio_id}`} className="text-brand-400 hover:text-brand-300 text-xs font-medium">
                              {app.applicant_name || "View Profile"}
                            </Link>
                          ) : (
                            <span className="text-gray-400 text-xs">{app.applicant_name || "Anonymous"}</span>
                          )}
                        </td>
                        <td className="hidden sm:table-cell py-3 px-3">
                          {app.fit_score != null ? (
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                              app.fit_score >= 75 ? "bg-emerald-500/15 text-emerald-400" :
                              app.fit_score >= 50 ? "bg-amber-500/15 text-amber-400" :
                              "bg-rose-500/15 text-rose-400"
                            }`}>
                              {app.fit_score}%
                            </span>
                          ) : (
                            <span className="text-gray-600 text-xs">—</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-gray-400 text-xs capitalize">{app.status}</span>
                        </td>
                        <td className="hidden sm:table-cell py-3 px-3">
                          <span className="text-gray-600 text-xs">{new Date(app.applied_at).toLocaleDateString()}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
