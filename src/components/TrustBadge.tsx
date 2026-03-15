"use client";

import { useState } from "react";
import { TrustScore } from "@/utils/trustScore";

const levelColors: Record<string, { bg: string; text: string; ring: string }> = {
  verified: { bg: "bg-emerald-500/15", text: "text-emerald-300", ring: "stroke-emerald-400" },
  trusted: { bg: "bg-brand-500/15", text: "text-brand-300", ring: "stroke-brand-400" },
  established: { bg: "bg-blue-500/15", text: "text-blue-300", ring: "stroke-blue-400" },
  basic: { bg: "bg-gray-500/15", text: "text-gray-300", ring: "stroke-gray-400" },
  new: { bg: "bg-gray-500/10", text: "text-gray-500", ring: "stroke-gray-500" },
};

export default function TrustBadge({ trust }: { trust: TrustScore }) {
  const [showDetails, setShowDetails] = useState(false);
  const colors = levelColors[trust.level] || levelColors.new;
  const circumference = 2 * Math.PI * 18;
  const dashArray = `${(trust.score / 100) * circumference} ${circumference}`;

  return (
    <div className="relative">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`inline-flex items-center gap-2 px-3 py-1.5 ${colors.bg} rounded-lg border border-white/10 transition-all hover:border-white/20`}
      >
        {/* Mini ring */}
        <svg width="24" height="24" viewBox="0 0 44 44" className="-rotate-90">
          <circle cx="22" cy="22" r="18" fill="none" stroke="currentColor" strokeWidth="3" className="text-white/10" />
          <circle
            cx="22" cy="22" r="18" fill="none"
            strokeWidth="3" strokeLinecap="round"
            className={colors.ring}
            strokeDasharray={dashArray}
          />
        </svg>
        <span className={`text-xs font-bold ${colors.text}`}>
          {trust.label}
        </span>
      </button>

      {showDetails && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-slate-800 border border-white/10 rounded-xl shadow-2xl z-50 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-white">Trust Score</h4>
            <span className={`text-lg font-bold ${colors.text}`}>{trust.score}/100</span>
          </div>

          <div className="space-y-2">
            {trust.signals.map((signal) => (
              <div key={signal.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${signal.met ? "text-emerald-400" : "text-gray-600"}`}>
                    {signal.met ? "\u2713" : "\u25CB"}
                  </span>
                  <span className={`text-xs ${signal.met ? "text-gray-300" : "text-gray-500"}`}>
                    {signal.name}
                  </span>
                </div>
                <span className={`text-xs font-medium ${signal.met ? "text-emerald-400" : "text-gray-600"}`}>
                  +{signal.points}
                </span>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-gray-600 mt-3 pt-2 border-t border-white/5">
            Trust score is based on profile completeness, verified connections, and platform activity.
          </p>
        </div>
      )}
    </div>
  );
}
