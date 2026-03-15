"use client";

export default function VerifiedEmployerBadge({ size = "sm" }: { size?: "sm" | "md" }) {
  const sizeClasses = size === "md" ? "px-2.5 py-1 text-xs" : "px-2 py-0.5 text-[10px]";

  return (
    <span
      className={`inline-flex items-center gap-1 ${sizeClasses} bg-blue-500/15 text-blue-300 rounded-md font-bold border border-blue-500/30`}
      title="This employer has been verified by TalentAgent"
    >
      <svg className={size === "md" ? "w-3.5 h-3.5" : "w-3 h-3"} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      </svg>
      Verified Employer
    </span>
  );
}
