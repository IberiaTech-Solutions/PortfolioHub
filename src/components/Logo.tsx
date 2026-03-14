"use client";

export function LogoIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke="#4F46E5" strokeWidth="5" strokeLinecap="round">
        <circle cx="15" cy="20" r="5" fill="#4F46E5"/>
        <circle cx="40" cy="20" r="5" fill="#4F46E5"/>
        <circle cx="65" cy="20" r="5" fill="#4F46E5"/>
        <circle cx="40" cy="50" r="5" fill="#4F46E5"/>
        <line x1="15" y1="20" x2="65" y2="20"/>
        <line x1="40" y1="20" x2="40" y2="50"/>
      </g>
    </svg>
  );
}

export function LogoFull({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="220" height="50" viewBox="0 0 260 60" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke="#4F46E5" strokeWidth="3" strokeLinecap="round">
        <circle cx="20" cy="18" r="4" fill="#4F46E5"/>
        <circle cx="40" cy="18" r="4" fill="#4F46E5"/>
        <circle cx="60" cy="18" r="4" fill="#4F46E5"/>
        <circle cx="40" cy="38" r="4" fill="#4F46E5"/>
        <line x1="20" y1="18" x2="60" y2="18"/>
        <line x1="40" y1="18" x2="40" y2="38"/>
      </g>
      <text x="80" y="36" fontSize="26" fontFamily="Inter, system-ui, sans-serif" fontWeight="600" fill="white">
        TalentAgent
      </text>
    </svg>
  );
}

export function LogoFullDark({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="220" height="50" viewBox="0 0 260 60" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke="#4F46E5" strokeWidth="3" strokeLinecap="round">
        <circle cx="20" cy="18" r="4" fill="#4F46E5"/>
        <circle cx="40" cy="18" r="4" fill="#4F46E5"/>
        <circle cx="60" cy="18" r="4" fill="#4F46E5"/>
        <circle cx="40" cy="38" r="4" fill="#4F46E5"/>
        <line x1="20" y1="18" x2="60" y2="18"/>
        <line x1="40" y1="18" x2="40" y2="38"/>
      </g>
      <text x="80" y="36" fontSize="26" fontFamily="Inter, system-ui, sans-serif" fontWeight="600" fill="#111827">
        TalentAgent
      </text>
    </svg>
  );
}
