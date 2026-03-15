"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/utils/supabase";
import {
  UserGroupIcon,
  BriefcaseIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

interface PlatformStats {
  totalUsers: number;
  totalPortfolios: number;
  totalJobs: number;
  totalCandidates: number;
  totalRecruiters: number;
  totalAdmins: number;
  recentSignups: number;
  aiChats7d: number;
  aiAssessments7d: number;
  freeTier: number;
  proTier: number;
  recruiterTier: number;
}


export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [stats, setStats] = useState<PlatformStats | null>(null);

  useEffect(() => {
    const init = async () => {
      if (!supabase) { setLoading(false); return; }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth?redirect=/admin"); return; }

      // Check admin role from auth metadata (admins don't need a portfolio)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((user as any).app_metadata?.role !== "admin") {
        router.push("/");
        return;
      }

      setAuthorized(true);

      // Fetch platform stats
      const [portfolioRes, jobsRes, candidatesRes, recruitersRes, adminsRes] = await Promise.all([
        supabase.from("portfolios").select("*", { count: "exact", head: true }),
        supabase.from("jobs").select("*", { count: "exact", head: true }),
        supabase.from("portfolios").select("*", { count: "exact", head: true }).eq("user_role", "candidate"),
        supabase.from("portfolios").select("*", { count: "exact", head: true }).eq("user_role", "recruiter"),
        supabase.from("portfolios").select("*", { count: "exact", head: true }).eq("user_role", "admin"),
      ]);

      // Recent signups (last 7 days)
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { count: recentSignups } = await supabase
        .from("portfolios")
        .select("*", { count: "exact", head: true })
        .gte("created_at", weekAgo);

      // AI usage (last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const [chats7d, assessments7d, freeCount, proCount, recruiterCount] = await Promise.all([
        supabase.from("portfolio_analytics").select("*", { count: "exact", head: true }).eq("event_type", "chat").gte("created_at", sevenDaysAgo),
        supabase.from("portfolio_analytics").select("*", { count: "exact", head: true }).eq("event_type", "fit_assessment").gte("created_at", sevenDaysAgo),
        supabase.from("portfolios").select("*", { count: "exact", head: true }).or("plan_tier.is.null,plan_tier.eq.free"),
        supabase.from("portfolios").select("*", { count: "exact", head: true }).eq("plan_tier", "pro"),
        supabase.from("portfolios").select("*", { count: "exact", head: true }).eq("plan_tier", "recruiter"),
      ]);

      // Audit log removed in tool-first pivot

      setStats({
        totalUsers: portfolioRes.count ?? 0,
        totalPortfolios: portfolioRes.count ?? 0,
        totalJobs: jobsRes.count ?? 0,
        totalCandidates: candidatesRes.count ?? 0,
        totalRecruiters: recruitersRes.count ?? 0,
        totalAdmins: adminsRes.count ?? 0,
        recentSignups: recentSignups ?? 0,
        aiChats7d: chats7d.count ?? 0,
        aiAssessments7d: assessments7d.count ?? 0,
        freeTier: freeCount.count ?? 0,
        proTier: proCount.count ?? 0,
        recruiterTier: recruiterCount.count ?? 0,
      });

      setLoading(false);
    };
    init();
  }, [router]);

  if (loading || !authorized) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const cards = [
    { label: "Total Users", value: stats?.totalUsers ?? 0, icon: UserGroupIcon, color: "brand", href: "/admin/users" },
    { label: "Candidates", value: stats?.totalCandidates ?? 0, icon: UserGroupIcon, color: "emerald", href: "/admin/users?role=candidate" },
    { label: "Recruiters", value: stats?.totalRecruiters ?? 0, icon: BriefcaseIcon, color: "purple", href: "/admin/users?role=recruiter" },
    { label: "Active Jobs", value: stats?.totalJobs ?? 0, icon: BriefcaseIcon, color: "amber", href: "/admin/jobs" },
    { label: "Signups (7d)", value: stats?.recentSignups ?? 0, icon: ChartBarIcon, color: "blue", href: "/admin/users" },
    { label: "Admins", value: stats?.totalAdmins ?? 0, icon: ShieldCheckIcon, color: "rose", href: "/admin/users?role=admin" },
  ];

  const colorMap: Record<string, string> = {
    brand: "bg-brand-500/20 text-brand-400",
    emerald: "bg-emerald-500/20 text-emerald-400",
    purple: "bg-purple-500/20 text-purple-400",
    amber: "bg-amber-500/20 text-amber-400",
    blue: "bg-blue-500/20 text-blue-400",
    rose: "bg-rose-500/20 text-rose-400",
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center px-4 py-2 bg-rose-500/10 border border-rose-500/30 rounded-full text-rose-400 text-sm font-bold mb-6">
            <ShieldCheckIcon className="w-4 h-4 mr-2" />
            Admin Panel
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mb-3">
            Platform Dashboard
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Monitor users, jobs, and platform health.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          {cards.map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-white/20 transition-all group"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colorMap[card.color]}`}>
                <card.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-white">{card.value}</p>
              <p className="text-xs text-gray-500 mt-1">{card.label}</p>
            </Link>
          ))}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/admin/users"
            className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-brand-500/30 transition-all group"
          >
            <UserGroupIcon className="w-8 h-8 text-brand-400 mb-3" />
            <h3 className="text-lg font-heading font-bold text-white mb-1">User Management</h3>
            <p className="text-sm text-gray-400">View all users, change roles, verify profiles, ban accounts.</p>
          </Link>
          <Link
            href="/admin/jobs"
            className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-emerald-500/30 transition-all group"
          >
            <BriefcaseIcon className="w-8 h-8 text-emerald-400 mb-3" />
            <h3 className="text-lg font-heading font-bold text-white mb-1">Job Moderation</h3>
            <p className="text-sm text-gray-400">Review posted jobs, deactivate scams, manage reported listings.</p>
          </Link>
        </div>

        {/* AI Usage + Subscriptions Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
          {/* AI Usage */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-sm font-heading font-bold text-white mb-4 flex items-center gap-2">
              <SparklesIcon className="w-4 h-4 text-purple-400" />
              AI Usage (Last 7 Days)
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-2xl font-bold text-white">{stats?.aiChats7d ?? 0}</p>
                <p className="text-[10px] text-gray-500 uppercase">AI Chats</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats?.aiAssessments7d ?? 0}</p>
                <p className="text-[10px] text-gray-500 uppercase">Fit Assessments</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  ${(((stats?.aiChats7d ?? 0) + (stats?.aiAssessments7d ?? 0)) * 0.001).toFixed(2)}
                </p>
                <p className="text-[10px] text-gray-500 uppercase">Est. Cost</p>
              </div>
            </div>
            <p className="text-[10px] text-gray-600 mt-3">Model: gpt-4o-mini (~$0.001/call)</p>
          </div>

          {/* Subscriptions */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-sm font-heading font-bold text-white mb-4 flex items-center gap-2">
              <ChartBarIcon className="w-4 h-4 text-emerald-400" />
              Plan Distribution
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-2xl font-bold text-white">{stats?.freeTier ?? 0}</p>
                <p className="text-[10px] text-gray-500 uppercase">Free</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-brand-400">{stats?.proTier ?? 0}</p>
                <p className="text-[10px] text-gray-500 uppercase">Pro</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-400">{stats?.recruiterTier ?? 0}</p>
                <p className="text-[10px] text-gray-500 uppercase">Recruiter</p>
              </div>
            </div>
            <p className="text-[10px] text-gray-600 mt-3">
              MRR: ${((stats?.proTier ?? 0) * 9 + (stats?.recruiterTier ?? 0) * 49).toLocaleString()}/mo
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
