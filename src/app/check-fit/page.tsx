"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/utils/supabase";
import { Portfolio, FitAssessment, InterviewQuestion } from "@/types";
import {
  SparklesIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";

export default function CheckFitPage() {
  const [jobDescription, setJobDescription] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [scraping, setScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState("");
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(false);
  const [assessment, setAssessment] = useState<FitAssessment | null>(null);
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [inputMode, setInputMode] = useState<"text" | "url">("text");

  useEffect(() => {
    const init = async () => {
      if (!supabase) {
        setAuthLoading(false);
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("portfolios")
          .select("*, collaborations(*)")
          .eq("user_id", user.id)
          .maybeSingle();
        if (data) setPortfolio(data as unknown as Portfolio);
      }
      setAuthLoading(false);
    };
    init();
  }, []);

  const scrapeUrl = async () => {
    if (!jobUrl.trim()) return;
    setScraping(true);
    setScrapeError("");
    try {
      const res = await fetch("/api/scrapeJob", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: jobUrl.trim() }),
      });
      const data = await res.json();
      if (data.jobDescription) {
        setJobDescription(data.jobDescription);
        setInputMode("text"); // Switch to text view to show extracted content
      } else {
        setScrapeError(data.error || "Could not extract job description from this URL.");
      }
    } catch {
      setScrapeError("Failed to fetch. Try pasting the job description text directly.");
    } finally {
      setScraping(false);
    }
  };

  const runAssessment = async () => {
    if (!jobDescription.trim() || !portfolio) return;
    setLoading(true);
    setAssessment(null);
    setInterviewQuestions([]);

    try {
      const res = await fetch("/api/fitAssessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription: jobDescription.trim(),
          portfolio: {
            name: portfolio.name,
            job_title: portfolio.job_title,
            title: portfolio.title,
            description: portfolio.description,
            skills: portfolio.skills,
            projects: portfolio.projects || [],
            location: portfolio.location,
            experience_level: portfolio.experience_level,
            preferred_work_type: portfolio.preferred_work_type,
            languages: portfolio.languages,
          },
          portfolioId: portfolio.id,
        }),
      });
      const data = await res.json();
      if (data.assessment) setAssessment(data.assessment);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const generateQuestions = async () => {
    if (!assessment) return;
    setLoadingQuestions(true);
    try {
      const res = await fetch("/api/interviewQuestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: jobDescription.split("\n")[0]?.slice(0, 100),
          jobDescription,
          jobSkills: assessment.strengths,
          candidateSkills: assessment.strengths,
          candidateGaps: assessment.gaps,
        }),
      });
      const data = await res.json();
      if (data.questions) setInterviewQuestions(data.questions);
    } catch {
      // silent
    } finally {
      setLoadingQuestions(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-emerald-400";
    if (score >= 50) return "text-amber-400";
    return "text-rose-400";
  };

  const getScoreRing = (score: number) => {
    if (score >= 75) return "stroke-emerald-400";
    if (score >= 50) return "stroke-amber-400";
    return "stroke-rose-400";
  };

  const shareFit = () => {
    if (!assessment || !portfolio) return;
    const jobTitle = jobDescription.split("\n")[0]?.slice(0, 80) || "a role";
    const text = `${portfolio.name} scored ${assessment.score}% fit for ${jobTitle} on TalentAgent — ${assessment.verdict}`;
    if (navigator.share) {
      navigator.share({ title: `${assessment.score}% Fit Score`, text, url: window.location.origin }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center px-4 py-2 bg-white/5 border border-white/10 rounded-full text-gray-400 text-sm font-bold mb-6">
            <SparklesIcon className="w-4 h-4 mr-2" />
            AI-Powered Fit Assessment
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mb-3">
            Check Your Fit
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Paste any job description from LinkedIn, Indeed, or anywhere. AI will honestly tell you if you should apply.
          </p>
        </div>

        {/* Auth Gate */}
        {authLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !portfolio ? (
          <div className="text-center py-16 bg-white/5 border border-white/10 rounded-2xl">
            <SparklesIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h2 className="text-xl font-heading font-bold text-white mb-2">Create a Portfolio First</h2>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              We need your skills and experience to score your fit. It takes 30 seconds with AI resume import.
            </p>
            <Link
              href="/create-portfolio"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-xl font-bold transition-all hover:shadow-xl"
            >
              Create Portfolio
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Input */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              {/* Mode Toggle */}
              <div className="flex items-center justify-between mb-4">
                <div className="inline-flex bg-white/5 border border-white/10 rounded-lg p-0.5">
                  <button
                    onClick={() => setInputMode("text")}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all focus:ring-2 focus:ring-brand-500 focus:outline-none ${
                      inputMode === "text" ? "bg-brand-600 text-white" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Paste Text
                  </button>
                  <button
                    onClick={() => setInputMode("url")}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all focus:ring-2 focus:ring-brand-500 focus:outline-none ${
                      inputMode === "url" ? "bg-brand-600 text-white" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Paste URL
                  </button>
                </div>
                {inputMode === "text" && (
                  <button
                    onClick={async () => {
                      const text = await navigator.clipboard.readText();
                      if (text) {
                        // Auto-detect if it's a URL
                        if (text.startsWith("http")) {
                          setJobUrl(text);
                          setInputMode("url");
                        } else {
                          setJobDescription(text);
                        }
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg text-xs font-medium transition-colors border border-white/10"
                  >
                    <ClipboardDocumentIcon className="w-3.5 h-3.5" />
                    Paste from clipboard
                  </button>
                )}
              </div>

              {inputMode === "url" ? (
                <>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="url"
                      value={jobUrl}
                      onChange={(e) => { setJobUrl(e.target.value); setScrapeError(""); }}
                      placeholder="https://www.linkedin.com/jobs/view/..."
                      className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      disabled={scraping}
                    />
                    <button
                      onClick={scrapeUrl}
                      disabled={scraping || !jobUrl.trim()}
                      className="px-5 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {scraping ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Fetching...
                        </>
                      ) : (
                        "Extract Job"
                      )}
                    </button>
                  </div>
                  {scrapeError && (
                    <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                      <p className="text-xs text-amber-300">{scrapeError}</p>
                      <button
                        onClick={() => setInputMode("text")}
                        className="text-xs text-brand-400 hover:text-brand-300 mt-1 font-medium"
                      >
                        Switch to paste text instead
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-gray-600 mt-3">
                    Works with most job boards. LinkedIn may block some requests — if so, copy the job description text and paste it directly.
                  </p>
                </>
              ) : (
                <>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder={"Copy & paste the full job description here...\n\nExample:\nSenior Frontend Engineer at Stripe\nWe're looking for an experienced React developer who..."}
                    rows={8}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                    disabled={loading}
                  />
                </>
              )}
              <div className="flex items-center justify-between mt-4">
                <p className="text-xs text-gray-500">
                  {jobDescription.length > 0
                    ? `${jobDescription.length} characters`
                    : "Works with LinkedIn, Indeed, Glassdoor, company sites — any job posting"}
                </p>
                <button
                  onClick={runAssessment}
                  disabled={loading || jobDescription.trim().length < 50}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="w-4 h-4" />
                      Check My Fit
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Results */}
            {assessment && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
                {/* Score Header */}
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
                    <svg className="w-20 h-20 sm:w-24 sm:h-24 -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                      <circle
                        cx="60" cy="60" r="52" fill="none"
                        className={getScoreRing(assessment.score)}
                        strokeWidth="8" strokeLinecap="round"
                        strokeDasharray={`${(assessment.score / 100) * 327} 327`}
                      />
                    </svg>
                    <span className={`absolute inset-0 flex items-center justify-center text-3xl font-bold ${getScoreColor(assessment.score)}`}>
                      {assessment.score}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-display font-bold text-white mb-1">{assessment.verdict}</h2>
                    <p className="text-gray-400 text-sm leading-relaxed">{assessment.summary}</p>
                  </div>
                </div>

                {/* Should Apply Signal */}
                <div className={`flex items-center gap-3 p-4 rounded-xl border ${
                  assessment.shouldApply
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : "bg-rose-500/10 border-rose-500/30"
                }`}>
                  {assessment.shouldApply ? (
                    <CheckCircleIcon className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <XCircleIcon className="w-6 h-6 text-rose-400 flex-shrink-0" />
                  )}
                  <p className={`text-sm font-bold ${assessment.shouldApply ? "text-emerald-300" : "text-rose-300"}`}>
                    {assessment.shouldApply
                      ? "You should apply — this is a strong match for your profile"
                      : "Consider skipping — this role may not be the best fit right now"}
                  </p>
                </div>

                {/* Strengths & Gaps */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {assessment.strengths?.length > 0 && (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <h3 className="text-emerald-400 font-bold text-sm mb-3 flex items-center gap-2">
                        <CheckCircleIcon className="w-4 h-4" />
                        Your Strengths
                      </h3>
                      <ul className="space-y-2">
                        {assessment.strengths.map((s, i) => (
                          <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                            <span className="text-emerald-500 mt-0.5">+</span> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {assessment.gaps?.length > 0 && (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <h3 className="text-amber-400 font-bold text-sm mb-3 flex items-center gap-2">
                        <XCircleIcon className="w-4 h-4" />
                        Gaps to Address
                      </h3>
                      <ul className="space-y-2">
                        {assessment.gaps.map((g, i) => (
                          <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                            <span className="text-amber-500 mt-0.5">-</span> {g}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Advice */}
                {assessment.advice && (
                  <div className="bg-brand-500/10 border border-brand-500/30 rounded-xl p-4">
                    <h3 className="text-brand-400 font-bold text-sm mb-2">Advice</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{assessment.advice}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  {/* Interview Prep */}
                  {interviewQuestions.length === 0 && !loadingQuestions && (
                    <button
                      onClick={generateQuestions}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold transition-colors"
                    >
                      <SparklesIcon className="w-4 h-4" />
                      Generate Interview Prep
                    </button>
                  )}
                  {loadingQuestions && (
                    <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/5 text-gray-400 rounded-xl text-sm">
                      <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                      Generating questions...
                    </div>
                  )}
                  <button
                    onClick={shareFit}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-sm font-medium border border-white/10 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Share Result
                  </button>
                  <button
                    onClick={() => {
                      setAssessment(null);
                      setInterviewQuestions([]);
                      setJobDescription("");
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-gray-500 hover:text-white text-sm transition-colors"
                  >
                    Try another job
                  </button>
                </div>

                {/* Interview Questions */}
                {interviewQuestions.length > 0 && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
                    <h3 className="text-white font-heading font-bold text-sm">Interview Prep Questions</h3>
                    {interviewQuestions.map((q, i) => (
                      <div key={i} className="py-3 border-t border-white/5 first:border-0 first:pt-0">
                        <div className="flex items-start gap-2 mb-1">
                          <span className={`mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                            q.type === "strength" ? "bg-emerald-500/15 text-emerald-400" :
                            q.type === "gap" ? "bg-amber-500/15 text-amber-400" :
                            "bg-blue-500/15 text-blue-400"
                          }`}>
                            {q.type}
                          </span>
                        </div>
                        <p className="text-sm text-white font-medium mb-1">{q.question}</p>
                        <p className="text-xs text-gray-500">{q.tip}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
