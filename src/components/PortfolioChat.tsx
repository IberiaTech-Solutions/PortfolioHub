"use client";

import { useState, useRef, useEffect } from "react";
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { PortfolioData, FitAssessment, InterviewQuestion, ChatMessage } from "@/types";

type Tab = "chat" | "fit";

export default function PortfolioChat({ portfolio }: { portfolio: PortfolioData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [assessment, setAssessment] = useState<FitAssessment | null>(null);
  const [isAssessing, setIsAssessing] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const suggestedQuestions = [
    `What are ${portfolio.name}'s strongest skills?`,
    `Tell me about their projects`,
    `What kind of work is ${portfolio.name} looking for?`,
    `What makes ${portfolio.name} unique?`,
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && activeTab === "chat" && inputRef.current) {
      inputRef.current.focus();
    }
    if (isOpen && activeTab === "fit" && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen, activeTab]);

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    setHasInteracted(true);
    const userMessage: ChatMessage = { role: "user", content: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/portfolioChat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          portfolio,
          history: messages,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Sorry, I'm having trouble responding right now. Please try again." },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.response },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Connection error. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const runFitAssessment = async () => {
    if (!jobDescription.trim() || isAssessing) return;

    setIsAssessing(true);
    setAssessment(null);

    try {
      const res = await fetch("/api/fitAssessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription: jobDescription.trim(),
          portfolio,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setAssessment(null);
      } else {
        setAssessment(data.assessment);
      }
    } catch {
      setAssessment(null);
    } finally {
      setIsAssessing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return "from-emerald-500 to-emerald-600";
    if (score >= 50) return "from-amber-500 to-amber-600";
    return "from-rose-500 to-rose-600";
  };

  const getScoreRingColor = (score: number) => {
    if (score >= 75) return "#10b981";
    if (score >= 50) return "#f59e0b";
    return "#f43f5e";
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 group flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white rounded-2xl shadow-2xl hover:shadow-brand-500/25 transition-all duration-500 hover:scale-105 ${
          isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"
        } ${!hasInteracted ? "animate-pulse" : ""}`}
      >
        <SparklesIcon className="w-6 h-6" />
        <span className="font-heading font-bold text-sm hidden sm:block">
          Ask AI about {portfolio.name}
        </span>
        <span className="font-heading font-bold text-sm sm:hidden">
          Ask AI
        </span>
      </button>

      {/* Chat Panel */}
      <div
        className={`fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-50 w-full sm:w-[420px] transition-all duration-500 ease-out ${
          isOpen
            ? "translate-y-0 opacity-100 scale-100"
            : "translate-y-8 opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <div className="bg-slate-900/98 backdrop-blur-xl border border-white/20 sm:rounded-2xl shadow-2xl flex flex-col h-[100dvh] sm:h-[600px] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center shadow-lg">
                <SparklesIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-heading font-bold text-sm">
                  {portfolio.name}&apos;s AI Agent
                </h3>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-emerald-400 text-xs font-medium">
                    Online
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/10">
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-all duration-300 ${
                activeTab === "chat"
                  ? "text-brand-400 border-b-2 border-brand-400 bg-white/5"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <ChatBubbleLeftRightIcon className="w-4 h-4" />
              Chat
            </button>
            <button
              onClick={() => setActiveTab("fit")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-all duration-300 ${
                activeTab === "fit"
                  ? "text-brand-400 border-b-2 border-brand-400 bg-white/5"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <DocumentTextIcon className="w-4 h-4" />
              Fit Assessment
            </button>
          </div>

          {/* Chat Tab */}
          {activeTab === "chat" && (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Welcome message */}
                {messages.length === 0 && (
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-600 rounded-lg flex-shrink-0 flex items-center justify-center">
                        <SparklesIcon className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-white/10 rounded-2xl rounded-tl-md p-4 max-w-[85%]">
                        <p className="text-white text-sm leading-relaxed">
                          Hi! I&apos;m {portfolio.name}&apos;s AI portfolio agent. I can tell you
                          about their skills, projects, experience, and help you
                          assess if they&apos;re a good fit for your needs. What would
                          you like to know?
                        </p>
                      </div>
                    </div>

                    {/* Suggested questions */}
                    <div className="pl-11 space-y-2">
                      <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">
                        Suggested questions
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {suggestedQuestions.map((q, i) => (
                          <button
                            key={i}
                            onClick={() => sendMessage(q)}
                            className="text-left text-xs px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-brand-500/30 text-gray-300 hover:text-white rounded-xl transition-all duration-200"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Chat messages */}
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex gap-3 ${
                      msg.role === "user" ? "justify-end" : ""
                    }`}
                  >
                    {msg.role === "assistant" && (
                      <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-600 rounded-lg flex-shrink-0 flex items-center justify-center">
                        <SparklesIcon className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] rounded-2xl p-4 ${
                        msg.role === "user"
                          ? "bg-gradient-to-r from-brand-600 to-brand-700 rounded-tr-md text-white"
                          : "bg-white/10 rounded-tl-md text-white"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-600 rounded-lg flex-shrink-0 flex items-center justify-center">
                      <SparklesIcon className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white/10 rounded-2xl rounded-tl-md p-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce"></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-white/10">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Ask about ${portfolio.name}...`}
                    className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="w-11 h-11 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <PaperAirplaneIcon className="w-5 h-5 text-white" />
                  </button>
                </form>
                <p className="text-gray-600 text-[10px] text-center mt-2">
                  AI agent powered by TalentAgent
                </p>
              </div>
            </div>
          )}

          {/* Fit Assessment Tab */}
          {activeTab === "fit" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {!assessment ? (
                <>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DocumentTextIcon className="w-5 h-5 text-brand-400" />
                      <h4 className="text-white font-heading font-bold text-sm">
                        Job Fit Assessment
                      </h4>
                    </div>
                    <p className="text-gray-400 text-xs leading-relaxed">
                      Paste a job description below to see how well{" "}
                      {portfolio.name} matches the role. The AI will give an
                      honest assessment — including when the fit isn&apos;t strong.
                    </p>
                  </div>

                  <textarea
                    ref={textareaRef}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description here..."
                    className="w-full h-48 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all resize-none"
                    disabled={isAssessing}
                  />

                  <button
                    onClick={runFitAssessment}
                    disabled={!jobDescription.trim() || isAssessing}
                    className="w-full py-3 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    {isAssessing ? (
                      <>
                        <ArrowPathIcon className="w-4 h-4 animate-spin" />
                        Analyzing fit...
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="w-4 h-4" />
                        Assess Fit
                      </>
                    )}
                  </button>
                </>
              ) : (
                <div className="space-y-4">
                  {/* Score Ring */}
                  <div className="flex flex-col items-center py-4">
                    <div className="relative w-28 h-28">
                      <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
                        <circle
                          cx="60"
                          cy="60"
                          r="52"
                          fill="none"
                          stroke="rgba(255,255,255,0.1)"
                          strokeWidth="8"
                        />
                        <circle
                          cx="60"
                          cy="60"
                          r="52"
                          fill="none"
                          stroke={getScoreRingColor(assessment.score)}
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={`${(assessment.score / 100) * 327} 327`}
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-display font-bold text-white">
                          {assessment.score}
                        </span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wide">
                          Score
                        </span>
                      </div>
                    </div>
                    <div
                      className={`mt-3 px-4 py-1.5 rounded-full text-sm font-bold bg-gradient-to-r ${getScoreColor(
                        assessment.score
                      )} text-white shadow-lg`}
                    >
                      {assessment.verdict}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <p className="text-white text-sm leading-relaxed">
                      {assessment.summary}
                    </p>
                  </div>

                  {/* Should Apply */}
                  <div
                    className={`flex items-center gap-3 p-4 rounded-xl border ${
                      assessment.shouldApply
                        ? "bg-emerald-500/10 border-emerald-500/30"
                        : "bg-rose-500/10 border-rose-500/30"
                    }`}
                  >
                    {assessment.shouldApply ? (
                      <CheckCircleIcon className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <XCircleIcon className="w-6 h-6 text-rose-400 flex-shrink-0" />
                    )}
                    <p
                      className={`text-sm font-bold ${
                        assessment.shouldApply
                          ? "text-emerald-300"
                          : "text-rose-300"
                      }`}
                    >
                      {assessment.shouldApply
                        ? `${portfolio.name} should consider applying for this role`
                        : `This role may not be the best fit for ${portfolio.name} right now`}
                    </p>
                  </div>

                  {/* Strengths */}
                  {assessment.strengths?.length > 0 && (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <h4 className="text-emerald-400 font-bold text-sm mb-3 flex items-center gap-2">
                        <CheckCircleIcon className="w-4 h-4" />
                        Strengths
                      </h4>
                      <ul className="space-y-2">
                        {assessment.strengths.map((s, i) => (
                          <li
                            key={i}
                            className="text-gray-300 text-sm flex items-start gap-2"
                          >
                            <span className="text-emerald-500 mt-1">+</span>
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Gaps */}
                  {assessment.gaps?.length > 0 && (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <h4 className="text-amber-400 font-bold text-sm mb-3 flex items-center gap-2">
                        <ChevronDownIcon className="w-4 h-4" />
                        Gaps to Address
                      </h4>
                      <ul className="space-y-2">
                        {assessment.gaps.map((g, i) => (
                          <li
                            key={i}
                            className="text-gray-300 text-sm flex items-start gap-2"
                          >
                            <span className="text-amber-500 mt-1">-</span>
                            {g}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Advice */}
                  {assessment.advice && (
                    <div className="bg-brand-500/10 border border-brand-500/30 rounded-xl p-4">
                      <h4 className="text-brand-400 font-bold text-sm mb-2">
                        Advice
                      </h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {assessment.advice}
                      </p>
                    </div>
                  )}

                  {/* Share Fit Assessment */}
                  <button
                    onClick={() => {
                      const jobTitle = jobDescription.split('\n')[0]?.slice(0, 80) || 'a role';
                      const text = `${portfolio.name} scored ${assessment.score}% fit for ${jobTitle} on TalentAgent — ${assessment.verdict}`;
                      if (navigator.share) {
                        navigator.share({
                          title: `${portfolio.name} — ${assessment.score}% Fit Score`,
                          text,
                          url: window.location.href,
                        }).catch(() => {});
                      } else {
                        navigator.clipboard.writeText(`${text}\n${window.location.href}`);
                        const btn = document.getElementById('share-copied-toast');
                        if (btn) { btn.textContent = 'Copied to clipboard!'; setTimeout(() => { btn.textContent = 'Share Fit Score'; }, 2000); }
                      }
                    }}
                    id="share-copied-toast"
                    className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                    Share Fit Score
                  </button>

                  {/* Interview Prep */}
                  {!loadingQuestions && interviewQuestions.length === 0 && (
                    <button
                      onClick={async () => {
                        setLoadingQuestions(true);
                        try {
                          const res = await fetch('/api/interviewQuestions', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              jobTitle: jobDescription.split('\n')[0]?.slice(0, 100),
                              jobDescription: jobDescription,
                              jobSkills: assessment.strengths,
                              candidateSkills: assessment.strengths,
                              candidateGaps: assessment.gaps,
                            }),
                          });
                          const data = await res.json();
                          if (data.questions) setInterviewQuestions(data.questions);
                        } catch { /* silent */ }
                        finally { setLoadingQuestions(false); }
                      }}
                      className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <SparklesIcon className="w-4 h-4" />
                      Generate Interview Prep Questions
                    </button>
                  )}

                  {loadingQuestions && (
                    <div className="w-full py-3 bg-white/5 rounded-xl flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-brand-400 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-gray-400 text-sm">Generating questions...</span>
                    </div>
                  )}

                  {interviewQuestions.length > 0 && (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                      <h4 className="text-white text-sm font-medium">Interview Prep</h4>
                      {interviewQuestions.map((q, i) => (
                        <div key={i} className="py-2 border-t border-white/5 first:border-0 first:pt-0">
                          <div className="flex items-start gap-2">
                            <span className={`mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                              q.type === 'strength' ? 'bg-emerald-500/15 text-emerald-400' :
                              q.type === 'gap' ? 'bg-amber-500/15 text-amber-400' :
                              'bg-brand-500/15 text-brand-400'
                            }`}>
                              {q.type}
                            </span>
                            <p className="text-gray-200 text-sm">{q.question}</p>
                          </div>
                          <p className="text-gray-500 text-xs mt-1 ml-12">{q.tip}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reset button */}
                  <button
                    onClick={() => {
                      setAssessment(null);
                      setJobDescription("");
                      setInterviewQuestions([]);
                    }}
                    className="w-full py-3 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowPathIcon className="w-4 h-4" />
                    Try Another Job
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
