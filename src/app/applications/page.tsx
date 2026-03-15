"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/utils/supabase";
import { JobApplication } from "@/types";
import {
  BriefcaseIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircleIcon }> = {
  applied: { label: "Applied", color: "bg-blue-500/15 text-blue-300 border-blue-500/30", icon: ClockIcon },
  viewed: { label: "Viewed", color: "bg-purple-500/15 text-purple-300 border-purple-500/30", icon: ChartBarIcon },
  interviewing: { label: "Interviewing", color: "bg-amber-500/15 text-amber-300 border-amber-500/30", icon: BriefcaseIcon },
  offered: { label: "Offered", color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30", icon: CheckCircleIcon },
  rejected: { label: "Rejected", color: "bg-rose-500/15 text-rose-300 border-rose-500/30", icon: XCircleIcon },
  withdrawn: { label: "Withdrawn", color: "bg-gray-500/15 text-gray-400 border-gray-500/30", icon: XCircleIcon },
};

export default function ApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    const init = async () => {
      if (!supabase) { setLoading(false); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth?redirect=/applications"); return; }

      const { data } = await supabase
        .from("job_applications")
        .select("*")
        .eq("user_id", user.id)
        .order("applied_at", { ascending: false });

      if (data) setApplications(data as JobApplication[]);
      setLoading(false);
    };
    init();
  }, [router]);

  const updateStatus = async (id: string, status: JobApplication["status"]) => {
    if (!supabase) return;
    await supabase
      .from("job_applications")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );
  };

  const filtered = filter === "all"
    ? applications
    : applications.filter((a) => a.status === filter);

  const stats = {
    total: applications.length,
    applied: applications.filter((a) => a.status === "applied").length,
    interviewing: applications.filter((a) => a.status === "interviewing").length,
    offered: applications.filter((a) => a.status === "offered").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center px-4 py-2 bg-white/5 border border-white/10 rounded-full text-gray-400 text-sm font-bold mb-6">
            <BriefcaseIcon className="w-4 h-4 mr-2" />
            Application Tracker
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mb-3">
            My Applications
          </h1>
          <p className="text-gray-400">
            Track every job you&apos;ve applied to. Update status as you progress.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`p-3 rounded-xl border text-center transition-all ${
              filter === "all" ? "bg-white/10 border-white/20" : "bg-white/5 border-white/10 hover:bg-white/10"
            }`}
          >
            <p className="text-xl font-bold text-white">{stats.total}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Total</p>
          </button>
          <button
            onClick={() => setFilter("applied")}
            className={`p-3 rounded-xl border text-center transition-all ${
              filter === "applied" ? "bg-blue-500/10 border-blue-500/30" : "bg-white/5 border-white/10 hover:bg-white/10"
            }`}
          >
            <p className="text-xl font-bold text-blue-400">{stats.applied}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Applied</p>
          </button>
          <button
            onClick={() => setFilter("interviewing")}
            className={`p-3 rounded-xl border text-center transition-all ${
              filter === "interviewing" ? "bg-amber-500/10 border-amber-500/30" : "bg-white/5 border-white/10 hover:bg-white/10"
            }`}
          >
            <p className="text-xl font-bold text-amber-400">{stats.interviewing}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Interviewing</p>
          </button>
          <button
            onClick={() => setFilter("offered")}
            className={`p-3 rounded-xl border text-center transition-all ${
              filter === "offered" ? "bg-emerald-500/10 border-emerald-500/30" : "bg-white/5 border-white/10 hover:bg-white/10"
            }`}
          >
            <p className="text-xl font-bold text-emerald-400">{stats.offered}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Offered</p>
          </button>
          <button
            onClick={() => setFilter("rejected")}
            className={`p-3 rounded-xl border text-center transition-all ${
              filter === "rejected" ? "bg-rose-500/10 border-rose-500/30" : "bg-white/5 border-white/10 hover:bg-white/10"
            }`}
          >
            <p className="text-xl font-bold text-rose-400">{stats.rejected}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Rejected</p>
          </button>
        </div>

        {/* Applications List */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white/5 border border-white/10 rounded-2xl">
            <BriefcaseIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h2 className="text-lg font-heading font-bold text-white mb-2">
              {applications.length === 0 ? "No applications yet" : "No applications match this filter"}
            </h2>
            <p className="text-gray-500 text-sm mb-4">
              {applications.length === 0
                ? "Start applying to jobs and track your progress here."
                : "Try a different filter."}
            </p>
            {applications.length === 0 && (
              <Link
                href="/jobs"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-xl font-bold text-sm transition-all hover:shadow-xl"
              >
                Browse Jobs
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((app) => {
              const config = statusConfig[app.status] || statusConfig.applied;
              const StatusIcon = config.icon;
              return (
                <div
                  key={app.id}
                  className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 hover:border-white/20 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-heading font-bold text-white truncate">
                        {app.job_title}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">{app.job_company}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold border ${config.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {config.label}
                        </span>
                        {app.fit_score != null && (
                          <span className={`px-2 py-0.5 rounded-md text-xs font-bold border ${
                            app.fit_score >= 75
                              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                              : app.fit_score >= 50
                              ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                              : "bg-rose-500/15 text-rose-300 border-rose-500/30"
                          }`}>
                            {app.fit_score}% fit
                          </span>
                        )}
                        <span className="text-[10px] text-gray-600">
                          {new Date(app.applied_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Status Update Dropdown */}
                    <select
                      value={app.status}
                      onChange={(e) => updateStatus(app.id, e.target.value as JobApplication["status"])}
                      className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 sm:py-1.5 text-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none cursor-pointer"
                    >
                      <option value="applied" className="bg-slate-800">Applied</option>
                      <option value="viewed" className="bg-slate-800">Viewed</option>
                      <option value="interviewing" className="bg-slate-800">Interviewing</option>
                      <option value="offered" className="bg-slate-800">Offered</option>
                      <option value="rejected" className="bg-slate-800">Rejected</option>
                      <option value="withdrawn" className="bg-slate-800">Withdrawn</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
