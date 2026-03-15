"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import {
  FlagIcon,
  CheckCircleIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

interface Report {
  id: string;
  reporter_id: string;
  content_type: "job" | "profile" | "message";
  content_id: string;
  reason: string;
  status: "pending" | "reviewed" | "dismissed";
  created_at: string;
  // Joined
  content_title?: string;
}

export default function AdminReportsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    const init = async () => {
      if (!supabase) { setLoading(false); return; }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth?redirect=/admin/reports"); return; }

      // Check admin role from auth metadata (admins don't need a portfolio)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((user as any).app_metadata?.role !== "admin") {
        router.push("/");
        return;
      }

      setAuthorized(true);

      // Fetch reports (will work once the reports table exists)
      try {
        const { data } = await supabase
          .from("reports")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);

        if (data) setReports(data as unknown as Report[]);
      } catch {
        // Table may not exist yet — that's OK
      }

      setLoading(false);
    };
    init();
  }, [router]);

  const updateStatus = async (id: string, status: "reviewed" | "dismissed") => {
    if (!supabase) return;
    await supabase.from("reports").update({ status }).eq("id", id);
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="text-center mb-10">
          <div className="inline-flex items-center px-4 py-2 bg-rose-500/10 border border-rose-500/30 rounded-full text-rose-400 text-sm font-bold mb-6">
            <FlagIcon className="w-4 h-4 mr-2" />
            Content Reports
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mb-3">
            Reported Content
          </h1>
          <p className="text-gray-400">
            Review flagged jobs, profiles, and messages.
          </p>
        </div>

        {reports.length === 0 ? (
          <div className="text-center py-16 bg-white/5 border border-white/10 rounded-2xl">
            <FlagIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h2 className="text-lg font-heading font-bold text-white mb-2">No Reports</h2>
            <p className="text-gray-500 text-sm">
              No content has been flagged yet. Reports will appear here when users flag suspicious listings or profiles.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <div key={report.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      report.status === "pending" ? "bg-amber-500/15 text-amber-300" :
                      report.status === "reviewed" ? "bg-emerald-500/15 text-emerald-300" :
                      "bg-gray-500/15 text-gray-400"
                    }`}>
                      {report.status}
                    </span>
                    <span className="px-2 py-0.5 bg-white/10 text-gray-400 rounded text-[10px] font-medium">
                      {report.content_type}
                    </span>
                  </div>
                  <p className="text-sm text-white font-medium">{report.reason || "No reason provided"}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Reported {new Date(report.created_at).toLocaleDateString()} — Content ID: {report.content_id}
                  </p>
                </div>
                {report.status === "pending" && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => updateStatus(report.id, "reviewed")}
                      className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors"
                      title="Mark as reviewed"
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => updateStatus(report.id, "dismissed")}
                      className="p-2 bg-gray-500/10 hover:bg-gray-500/20 text-gray-400 rounded-lg transition-colors"
                      title="Dismiss"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
