"use client";

import { useState } from "react";
import { SparklesIcon } from "@heroicons/react/24/outline";

interface Challenge {
  question: string;
  hint: string;
  evaluationCriteria: string[];
  timeLimit: number;
  difficulty: string;
}

interface ChallengeResult {
  passed: boolean;
  score: number;
  level: string;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

export default function SkillChallenge({
  skill,
  onVerified,
}: {
  skill: string;
  onVerified?: (level: string) => void;
}) {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState<ChallengeResult | null>(null);
  const [showHint, setShowHint] = useState(false);

  const generateChallenge = async () => {
    setLoading(true);
    setResult(null);
    setAnswer("");
    try {
      const res = await fetch("/api/skillChallenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skill, difficulty: "intermediate" }),
      });
      const data = await res.json();
      if (data.challenge) setChallenge(data.challenge);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!challenge || !answer.trim()) return;
    setEvaluating(true);
    try {
      const res = await fetch("/api/skillChallenge", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skill,
          question: challenge.question,
          answer: answer.trim(),
          evaluationCriteria: challenge.evaluationCriteria,
        }),
      });
      const data = await res.json();
      if (data.result) {
        setResult(data.result);
        if (data.result.passed && onVerified) {
          onVerified(data.result.level);
        }
      }
    } catch {
      // silent
    } finally {
      setEvaluating(false);
    }
  };

  if (!challenge && !result) {
    return (
      <button
        onClick={generateChallenge}
        disabled={loading}
        aria-label={`Verify skill: ${skill}`}
        className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 rounded-lg text-xs font-bold border border-purple-500/30 transition-all"
      >
        {loading ? (
          <>
            <div className="w-3 h-3 border-2 border-purple-300 border-t-transparent rounded-full animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <SparklesIcon className="w-3.5 h-3.5" />
            Verify: {skill}
          </>
        )}
      </button>
    );
  }

  if (result) {
    return (
      <div className={`p-4 rounded-xl border ${result.passed ? "bg-emerald-500/10 border-emerald-500/30" : "bg-rose-500/10 border-rose-500/30"}`}>
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-2xl font-bold ${result.passed ? "text-emerald-400" : "text-rose-400"}`}>
            {result.score}/100
          </span>
          {result.passed && (
            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-md text-xs font-bold border border-emerald-500/30">
              Verified: {skill} ({result.level})
            </span>
          )}
        </div>
        <p className="text-sm text-gray-300 mb-2">{result.feedback}</p>
        {result.strengths.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1">
            {result.strengths.map((s, i) => (
              <span key={i} className="text-xs text-emerald-400">+ {s}</span>
            ))}
          </div>
        )}
        {result.improvements.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {result.improvements.map((s, i) => (
              <span key={i} className="text-xs text-amber-400">- {s}</span>
            ))}
          </div>
        )}
        <button
          onClick={() => { setChallenge(null); setResult(null); }}
          className="mt-3 text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          Try another challenge
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs text-purple-400 font-bold uppercase tracking-wider">
            Skill Challenge: {skill}
          </span>
          <p className="text-sm text-white mt-1 font-medium">{challenge?.question}</p>
        </div>
      </div>

      {showHint && challenge?.hint && (
        <p className="text-xs text-gray-400 bg-white/5 rounded-lg px-3 py-2">{challenge.hint}</p>
      )}

      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Type your answer..."
        rows={4}
        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
        disabled={evaluating}
      />

      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowHint(true)}
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          {showHint ? "" : "Show hint"}
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => { setChallenge(null); setAnswer(""); }}
            className="px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={submitAnswer}
            disabled={evaluating || !answer.trim()}
            className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5"
          >
            {evaluating ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Evaluating...
              </>
            ) : (
              "Submit"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
