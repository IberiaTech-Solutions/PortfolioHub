"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/utils/supabase";
import { Portfolio } from "@/types";
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { Suspense } from "react";

function UsersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [users, setUsers] = useState<Portfolio[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState(searchParams.get("role") || "");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      if (!supabase) { setLoading(false); return; }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth?redirect=/admin/users"); return; }

      const { data: portfolio } = await supabase
        .from("portfolios")
        .select("user_role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!portfolio || (portfolio as { user_role?: string }).user_role !== "admin") {
        router.push("/");
        return;
      }

      setAuthorized(true);
      await fetchUsers();
      setLoading(false);
    };
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const fetchUsers = async () => {
    if (!supabase) return;

    let query = supabase
      .from("portfolios")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (roleFilter) {
      query = query.eq("user_role", roleFilter);
    }

    if (searchQuery.trim()) {
      const term = `%${searchQuery.trim()}%`;
      query = query.or(`name.ilike.${term},job_title.ilike.${term},title.ilike.${term}`);
    }

    const { data } = await query;
    if (data) setUsers(data as Portfolio[]);
  };

  const updateRole = async (userId: string, newRole: string) => {
    if (!supabase) return;
    setUpdating(userId);
    await supabase
      .from("portfolios")
      .update({ user_role: newRole })
      .eq("user_id", userId);
    setUsers((prev) =>
      prev.map((u) => (u.user_id === userId ? { ...u, user_role: newRole as Portfolio["user_role"] } : u))
    );
    setUpdating(null);
  };

  const toggleVerified = async (userId: string, current: boolean) => {
    if (!supabase) return;
    setUpdating(userId);
    await supabase
      .from("portfolios")
      .update({ is_verified: !current })
      .eq("user_id", userId);
    setUsers((prev) =>
      prev.map((u) => (u.user_id === userId ? { ...u, is_verified: !current } : u))
    );
    setUpdating(null);
  };

  if (loading || !authorized) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center px-4 py-2 bg-rose-500/10 border border-rose-500/30 rounded-full text-rose-400 text-sm font-bold mb-6">
            <UserGroupIcon className="w-4 h-4 mr-2" />
            User Management
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mb-3">
            All Users
          </h1>
          <p className="text-gray-400">
            {users.length} user{users.length !== 1 ? "s" : ""} on the platform
          </p>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchUsers()}
              placeholder="Search by name, title..."
              className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setTimeout(fetchUsers, 0); }}
            className="bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="" className="bg-slate-800">All Roles</option>
            <option value="candidate" className="bg-slate-800">Candidates</option>
            <option value="recruiter" className="bg-slate-800">Recruiters</option>
            <option value="admin" className="bg-slate-800">Admins</option>
          </select>
          <button
            onClick={fetchUsers}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold transition-colors"
          >
            Search
          </button>
        </div>

        {/* Users Table */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">User</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Role</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Verified</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Joined</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {u.profile_image ? (
                          <Image src={u.profile_image} alt={u.name} width={32} height={32} className="w-8 h-8 rounded-lg object-cover" />
                        ) : (
                          <div className="w-8 h-8 bg-brand-500/20 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs font-bold">{u.name?.charAt(0)?.toUpperCase()}</span>
                          </div>
                        )}
                        <div>
                          <p className="text-white font-medium text-xs">{u.name}</p>
                          <p className="text-gray-600 text-[10px]">{u.job_title}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={u.user_role || "candidate"}
                        onChange={(e) => updateRole(u.user_id, e.target.value)}
                        disabled={updating === u.user_id}
                        className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-xs focus:outline-none"
                      >
                        <option value="candidate" className="bg-slate-800">Candidate</option>
                        <option value="recruiter" className="bg-slate-800">Recruiter</option>
                        <option value="admin" className="bg-slate-800">Admin</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggleVerified(u.user_id, !!u.is_verified)}
                        disabled={updating === u.user_id}
                        className="p-1 rounded-lg transition-colors hover:bg-white/10"
                      >
                        {u.is_verified ? (
                          <CheckCircleIcon className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <XCircleIcon className="w-5 h-5 text-gray-600" />
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gray-500 text-xs">{new Date(u.created_at).toLocaleDateString()}</span>
                    </td>
                    <td className="py-3 px-4">
                      <a
                        href={`/portfolio/${u.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-400 hover:text-brand-300 text-xs font-medium"
                      >
                        View
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <UsersContent />
    </Suspense>
  );
}
