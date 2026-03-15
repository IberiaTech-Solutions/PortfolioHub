"use client";

import { useMemo } from "react";

interface CollabNode {
  name: string;
  role: string;
  status: string;
  project: string;
}

export default function CollaborationGraph({
  ownerName,
  collaborations,
}: {
  ownerName: string;
  collaborations: CollabNode[];
}) {
  const verified = useMemo(
    () => collaborations.filter((c) => c.status === "accepted" || c.status === "verified"),
    [collaborations]
  );

  if (verified.length === 0) return null;

  // Radial layout: owner in center, collaborators around
  const cx = 200;
  const cy = 150;
  const radius = 100;
  const nodeRadius = 20;

  const nodes = verified.map((c, i) => {
    const angle = (2 * Math.PI * i) / verified.length - Math.PI / 2;
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
      ...c,
    };
  });

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <h4 className="text-sm font-heading font-bold text-white mb-3 flex items-center gap-2">
        <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Collaboration Network
      </h4>
      <svg viewBox="0 0 400 300" className="w-full h-auto max-h-64">
        {/* Connection lines */}
        {nodes.map((node, i) => (
          <line
            key={`line-${i}`}
            x1={cx}
            y1={cy}
            x2={node.x}
            y2={node.y}
            stroke="rgba(139, 92, 246, 0.3)"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
        ))}

        {/* Center node (owner) */}
        <circle cx={cx} cy={cy} r={nodeRadius + 4} fill="rgba(99, 102, 241, 0.2)" stroke="rgba(99, 102, 241, 0.5)" strokeWidth="2" />
        <circle cx={cx} cy={cy} r={nodeRadius} fill="rgba(99, 102, 241, 0.4)" />
        <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" className="fill-white text-[9px] font-bold">
          {ownerName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
        </text>
        <text x={cx} y={cy + nodeRadius + 14} textAnchor="middle" className="fill-gray-400 text-[8px]">
          {ownerName.split(" ")[0]}
        </text>

        {/* Collaborator nodes */}
        {nodes.map((node, i) => (
          <g key={i}>
            <circle cx={node.x} cy={node.y} r={nodeRadius - 4} fill="rgba(139, 92, 246, 0.2)" stroke="rgba(139, 92, 246, 0.4)" strokeWidth="1.5" />
            <text x={node.x} y={node.y + 1} textAnchor="middle" dominantBaseline="middle" className="fill-white text-[8px] font-medium">
              {node.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </text>
            <text x={node.x} y={node.y + nodeRadius + 6} textAnchor="middle" className="fill-gray-400 text-[7px]">
              {node.name.split(" ")[0]}
            </text>
            <text x={node.x} y={node.y + nodeRadius + 16} textAnchor="middle" className="fill-gray-600 text-[6px]">
              {node.role}
            </text>
          </g>
        ))}

        {/* Verified checkmarks */}
        {nodes.map((node, i) => (
          <g key={`check-${i}`}>
            <circle cx={node.x + 10} cy={node.y - 10} r="6" fill="#10b981" />
            <path
              d={`M${node.x + 7} ${node.y - 10} l2 2 4-4`}
              stroke="white"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        ))}
      </svg>
      <p className="text-[10px] text-gray-600 text-center mt-1">
        {verified.length} verified collaboration{verified.length !== 1 ? "s" : ""} — proof of real working relationships
      </p>
    </div>
  );
}
