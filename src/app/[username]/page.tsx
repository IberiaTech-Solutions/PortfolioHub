"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/utils/supabase";

const RESERVED_PATHS = [
  "auth", "jobs", "profile", "create-portfolio", "check-fit",
  "search", "privacy", "terms", "cookies", "api", "_next",
  "portfolio", "images", "favicon.ico",
];

export default function VanityURLPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const username = params.username as string;

    // Skip reserved paths
    if (RESERVED_PATHS.includes(username)) {
      router.replace("/404");
      return;
    }

    const lookup = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("portfolios")
        .select("id")
        .eq("username", username)
        .maybeSingle();

      if (data) {
        router.replace(`/portfolio/${data.id}`);
      } else {
        setLoading(false);
      }
    };

    lookup();
  }, [params.username, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-3xl font-display font-bold text-white mb-4">Profile not found</h2>
        <p className="text-gray-400 mb-6">No portfolio exists for &quot;{params.username}&quot;</p>
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          Browse Portfolios
        </Link>
      </div>
    </div>
  );
}
