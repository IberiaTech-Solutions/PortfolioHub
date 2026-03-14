"use client";

import { LockClosedIcon, EyeIcon } from "@heroicons/react/24/outline";

type PrivacyToggleProps = {
  fieldName: string;
  isPrivate: boolean;
  onToggle: (fieldName: string, isPrivate: boolean) => void;
};

export default function PrivacyToggle({ fieldName, isPrivate, onToggle }: PrivacyToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(fieldName, !isPrivate)}
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
        isPrivate
          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30"
          : "bg-white/5 text-gray-500 border border-white/10 hover:bg-white/10 hover:text-gray-400"
      }`}
    >
      {isPrivate ? (
        <>
          <LockClosedIcon className="w-3 h-3" />
          Hidden
        </>
      ) : (
        <>
          <EyeIcon className="w-3 h-3" />
          Public
        </>
      )}
    </button>
  );
}
