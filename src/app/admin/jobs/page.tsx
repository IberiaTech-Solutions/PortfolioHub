"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import { Job } from "@/types";
import { logAdminAction } from "@/utils/auditLog";
import { detectGhostJob } from "@/utils/jobIntelligence";
import {
  BriefcaseIcon,
  XCircleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

export default function AdminJobsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    const init = async () => {
      if (!supabase) { setLoading(false); return; }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth?redirect=/admin/jobs"); return; }

      // Check admin role from auth metadata (admins don't need a portfolio)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((user as any).app_metadata?.role !== "admin") {
        router.push("/");
        return;
      }

      setAuthorized(true);

      const { data } = await supabase
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (data) setJobs(data as Job[]);
      setLoading(false);
    };
    init();
  }, [router]);

  const [adminId, setAdminId] = useState("");

  useEffect(() => {
    if (authorized) {
      supabase?.auth.getUser().then(({ data }) => { if (data.user) setAdminId(data.user.id); });
    }
  }, [authorized]);

  const toggleActive = async (jobId: string, current: boolean) => {
    if (!supabase) return;
    const job = jobs.find((j) => j.id === jobId);
    await supabase
      .from("jobs")
      .update({ is_active: !current })
      .eq("id", jobId);
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, is_active: !current } : j))
    );
    logAdminAction(adminId, "job_deactivate", "job", jobId, `${!current ? "Activated" : "Deactivated"} "${job?.title}"`);
  };

  const deleteJob = async (jobId: string) => {
    if (!supabase || !confirm("Delete this job permanently?")) return;
    const job = jobs.find((j) => j.id === jobId);
    await supabase.from("jobs").delete().eq("id", jobId);
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
    logAdminAction(adminId, "job_delete", "job", jobId, `Deleted "${job?.title}" by ${job?.company}`);
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
        <div className="text-center mb-10">
          <div className="inline-flex items-center px-4 py-2 bg-rose-500/10 border border-rose-500/30 rounded-full text-rose-400 text-sm font-bold mb-6">
            <BriefcaseIcon className="w-4 h-4 mr-2" />
            Job Moderation
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mb-3">
            All Jobs
          </h1>
          <p className="text-gray-400">{jobs.length} total job postings</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Job</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Company</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Ghost Risk</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Posted</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => {
                  const ghost = detectGhostJob(job);
                  return (
                    <tr key={job.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4">
                        <p className="text-white font-medium text-xs truncate max-w-[250px]">{job.title}</p>
                        <p className="text-gray-600 text-[10px]">{job.location || "No location"}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-400 text-xs">{job.company}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ghost.risk === "high" ? "bg-rose-500/15 text-rose-400" :
                          ghost.risk === "medium" ? "bg-amber-500/15 text-amber-400" :
                          ghost.risk === "low" ? "bg-yellow-500/15 text-yellow-400" :
                          "bg-emerald-500/15 text-emerald-400"
                        }`}>
                          {ghost.risk}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => toggleActive(job.id, job.is_active)}
                          className="p-1 rounded-lg transition-colors hover:bg-white/10"
                        >
                          {job.is_active ? (
                            <CheckCircleIcon className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <XCircleIcon className="w-5 h-5 text-gray-600" />
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-500 text-xs">{new Date(job.created_at).toLocaleDateString()}</span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => deleteJob(job.id)}
                          className="text-rose-400 hover:text-rose-300 text-xs font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
