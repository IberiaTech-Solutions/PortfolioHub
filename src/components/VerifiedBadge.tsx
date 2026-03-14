"use client";

import { ShieldCheckIcon } from "@heroicons/react/24/solid";
import { useState } from "react";

export default function VerifiedBadge({ size = "sm" }: { size?: "sm" | "md" }) {
  const [showTooltip, setShowTooltip] = useState(false);

  const sizeClasses = size === "md"
    ? "px-3 py-1.5 text-sm gap-1.5"
    : "px-2 py-0.5 text-xs gap-1";

  const iconSize = size === "md" ? "w-4 h-4" : "w-3.5 h-3.5";

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span
        className={`inline-flex items-center ${sizeClasses} bg-emerald-500/20 text-emerald-400 rounded-full font-bold border border-emerald-500/30`}
      >
        <ShieldCheckIcon className={iconSize} />
        Verified
      </span>

      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg shadow-xl border border-slate-700 whitespace-nowrap z-50">
          This profile&apos;s data is verified by TalentAgent
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-slate-800 rotate-45 border-r border-b border-slate-700"></div>
        </div>
      )}
    </div>
  );
}
