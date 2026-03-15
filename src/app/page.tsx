"use client";

import { Suspense } from "react";
import Link from "next/link";
import FadeIn from "@/components/FadeIn";

function HomeContent() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen flex items-center overflow-hidden">
        {/* Subtle Background Orb */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32 w-full">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-display font-bold text-white mb-4 sm:mb-6 tracking-tight">
              Paste any job.
              <br />
              <span className="animate-gradient-text">Know if you should apply.</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl font-body text-gray-400 max-w-2xl mx-auto leading-relaxed mb-8 sm:mb-10 px-4">
              AI scores your fit in 10 seconds. Ghost job detection. Honest &quot;Don&apos;t Apply&quot; signals. Free.
            </p>

            {/* Check My Fit — The Hero Tool */}
            <div className="max-w-2xl mx-auto">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 sm:p-6 shadow-2xl">
                <Link
                  href="/check-fit"
                  className="block w-full bg-white/10 border border-white/20 rounded-xl px-4 py-4 text-left text-gray-500 text-sm hover:bg-white/15 hover:border-white/30 transition-all cursor-text"
                >
                  Paste a job description from LinkedIn, Indeed, or anywhere...
                </Link>
                <div className="flex items-center justify-between mt-4">
                  <p className="text-[10px] text-gray-600">
                    Works with any job board — no account needed for your first check
                  </p>
                  <Link
                    href="/check-fit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white rounded-xl font-heading font-bold text-sm transition-all shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    Check My Fit
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center gap-6 mt-6 text-xs text-gray-600">
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                  Fit score 0-100
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                  Ghost job detection
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                  Interview prep
                </span>
              </div>
            </div>

          </div>

          {/* Secondary CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-sm font-medium transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Browse Jobs with AI Scores
            </Link>
            <Link
              href="/create-portfolio"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-gray-400 hover:text-white text-sm font-medium transition-colors"
            >
              Build Your AI Portfolio
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* How it Works — 3 simple steps */}
      <div className="bg-white py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 mb-3">
              How it works
            </h2>
            <p className="text-gray-500">Three steps. Ten seconds. Zero wasted applications.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FadeIn delay={0}>
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4 text-lg font-bold">1</div>
              <h3 className="font-heading font-bold text-gray-900 mb-2">Paste any job</h3>
              <p className="text-sm text-gray-500">Copy a job description from LinkedIn, Indeed, Glassdoor — anywhere.</p>
            </div>
            </FadeIn>
            <FadeIn delay={150}>
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4 text-lg font-bold">2</div>
              <h3 className="font-heading font-bold text-gray-900 mb-2">Get your fit score</h3>
              <p className="text-sm text-gray-500">AI scores you 0-100. Strengths, gaps, and an honest &quot;should you apply?&quot; signal.</p>
            </div>
            </FadeIn>
            <FadeIn delay={300}>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 text-lg font-bold">3</div>
              <h3 className="font-heading font-bold text-gray-900 mb-2">Apply smarter</h3>
              <p className="text-sm text-gray-500">Only apply where you fit. Get interview prep for the jobs that match.</p>
            </div>
            </FadeIn>
          </div>
        </div>
      </div>

      {/* The Problem — stats from transcript */}
      <div className="bg-slate-900 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
          <div className="text-center mb-12">
            <p className="text-rose-400 font-heading font-bold text-xs uppercase tracking-widest mb-3">The problem</p>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-3">
              The hiring system is broken
            </h2>
            <p className="text-gray-400 max-w-lg mx-auto text-sm">
              &quot;88% of employers admit their own systems misqualify people. The success rate on applications is 0.4%.&quot;
            </p>
          </div>
          </FadeIn>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <FadeIn delay={0}>
            <div className="text-center p-5 bg-white/5 border border-white/10 rounded-2xl">
              <p className="text-3xl font-display font-bold text-white">0.4%</p>
              <p className="text-xs text-gray-500 mt-1">application success rate</p>
            </div>
            </FadeIn>
            <FadeIn delay={100}>
            <div className="text-center p-5 bg-white/5 border border-white/10 rounded-2xl">
              <p className="text-3xl font-display font-bold text-white">27%</p>
              <p className="text-xs text-gray-500 mt-1">of jobs are ghost listings</p>
            </div>
            </FadeIn>
            <FadeIn delay={200}>
            <div className="text-center p-5 bg-white/5 border border-white/10 rounded-2xl">
              <p className="text-3xl font-display font-bold text-white">6 sec</p>
              <p className="text-xs text-gray-500 mt-1">avg resume scan time</p>
            </div>
            </FadeIn>
            <FadeIn delay={300}>
            <div className="text-center p-5 bg-white/5 border border-white/10 rounded-2xl">
              <p className="text-3xl font-display font-bold text-white">400+</p>
              <p className="text-xs text-gray-500 mt-1">applicants per role</p>
            </div>
            </FadeIn>
          </div>
          <FadeIn delay={400}>
          <p className="text-center text-xs text-gray-600 mt-6">
            &quot;You&apos;re trying to be the slightly better supplicant in a pool of 400 supplicants. What if you refused to be in the pile at all?&quot;
          </p>
          </FadeIn>
        </div>
      </div>

      {/* Chrome Extension */}
      <div className="bg-white py-16 sm:py-20">
        <FadeIn>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-full text-gray-500 text-xs font-bold mb-6">
            Chrome Extension
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 mb-3">
            Check fit on any job page
          </h2>
          <p className="text-gray-500 text-sm mb-8 max-w-lg mx-auto">
            Get your AI fit score directly on LinkedIn, Indeed, and Glassdoor. No copy-pasting needed.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="https://chrome.google.com/webstore"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-heading font-bold text-sm transition-all hover:bg-gray-800"
            >
              Add to Chrome — Free
            </a>
            <Link href="/check-fit" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              Or use the web version
            </Link>
          </div>
        </div>
        </FadeIn>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-br from-brand-600 via-brand-700 to-purple-800 py-16 sm:py-20">
        <FadeIn>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-4">
            Stop competing with 400 applicants
          </h2>
          <p className="text-white/70 text-sm mb-8 max-w-lg mx-auto">
            Paste any job. Know if you should apply. Free.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/check-fit"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 rounded-xl font-heading font-bold text-base transition-all hover:scale-105 shadow-2xl"
            >
              Check My Fit
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link href="/auth?mode=signup" className="text-sm text-white/60 hover:text-white transition-colors">
              Create free account
            </Link>
          </div>
        </div>
        </FadeIn>
      </div>

    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
