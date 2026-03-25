"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/utils/supabase";
import {
  CheckIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

const tiers = [
  {
    name: "Free",
    price: 0,
    description: "Everything you need to get started",
    cta: "Get Started Free",
    ctaHref: "/auth?mode=signup",
    highlighted: false,
    features: [
      "AI-powered portfolio",
      "5 AI chat messages/day",
      "Basic fit assessment",
      "3 job matches/week",
      "Ghost job detection",
      "Eligibility badges",
      "Apply timing signals",
      "GitHub import",
      "Resume import",
    ],
  },
  {
    name: "Pro",
    price: 9,
    description: "For serious job seekers who want an edge",
    cta: "Upgrade to Pro",
    ctaHref: "/auth?mode=signup&plan=pro",
    highlighted: true,
    badge: "Most Popular",
    features: [
      "Everything in Free, plus:",
      "50 AI chats/day (10x Free)",
      "Vanity URL (talentagent.com/you)",
      "Profile analytics dashboard",
      "Weekly AI career digest",
      "Priority in search results",
      "Skill verification badges",
      "Competition score per job",
      "Visa sponsorship alerts",
      "Remove TalentAgent branding",
    ],
  },
];

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <PricingContent />
    </Suspense>
  );
}

function PricingContent() {
  const [annual, setAnnual] = useState(false);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");

  useEffect(() => {
    const getUser = async () => {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        setUserEmail(user.email || null);
      }
    };
    getUser();
  }, []);

  const handleCheckout = async (planKey: string) => {
    if (!userId || !userEmail) {
      window.location.href = `/auth?mode=signup&plan=${planKey}`;
      return;
    }
    setCheckingOut(planKey);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey, userId, email: userEmail }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      // silent
    } finally {
      setCheckingOut(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Success/Cancel Banner */}
        {success && (
          <div className="mb-8 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center">
            <p className="text-emerald-300 font-bold">Payment successful! Your plan has been upgraded.</p>
          </div>
        )}
        {canceled && (
          <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-center">
            <p className="text-amber-300 font-medium">Checkout canceled. No charges were made.</p>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-white/5 border border-white/10 rounded-full text-gray-400 text-sm font-bold mb-6">
            <SparklesIcon className="w-4 h-4 mr-2" />
            Simple, Transparent Pricing
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mb-3">
            Stop Competing Blind.
            <br />
            <span className="animate-gradient-text">Start Matching Smart.</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Free forever for candidates. Pay only when you need an unfair advantage.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-1">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                !annual ? "bg-brand-600 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                annual ? "bg-brand-600 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              Annual
              <span className="ml-1.5 text-emerald-400 text-xs">Save 20%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-3xl mx-auto">
          {tiers.map((tier) => {
            const displayPrice = annual ? Math.round(tier.price * 0.8) : tier.price;
            return (
              <div
                key={tier.name}
                className={`relative rounded-2xl p-6 sm:p-8 transition-all ${
                  tier.highlighted
                    ? "bg-gradient-to-b from-brand-500/10 to-purple-500/10 border-2 border-brand-500/50 shadow-2xl shadow-brand-500/10 scale-[1.02]"
                    : "bg-white/5 border border-white/10"
                }`}
              >
                {tier.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-brand-500 to-purple-500 text-white text-xs font-bold rounded-full shadow-lg">
                    {tier.badge}
                  </span>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-heading font-bold text-white mb-1">{tier.name}</h3>
                  <p className="text-sm text-gray-400">{tier.description}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    {tier.price === 0 ? (
                      <span className="text-4xl font-display font-bold text-white">Free</span>
                    ) : (
                      <>
                        <span className="text-4xl font-display font-bold text-white">${displayPrice}</span>
                        <span className="text-gray-500 text-sm">/mo</span>
                      </>
                    )}
                  </div>
                  {annual && tier.price > 0 && (
                    <p className="text-xs text-emerald-400 mt-1">
                      ${displayPrice * 12}/year (save ${Math.round(tier.price * 12 * 0.2)})
                    </p>
                  )}
                </div>

                {tier.price === 0 ? (
                  <Link
                    href={tier.ctaHref}
                    className="block w-full py-3 rounded-xl font-bold text-sm text-center transition-all duration-300 mb-6 bg-white/10 hover:bg-white/20 text-white border border-white/20"
                  >
                    {tier.cta}
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      const planKey = annual ? "pro_annual" : "pro_monthly";
                      handleCheckout(planKey);
                    }}
                    disabled={checkingOut !== null}
                    className={`block w-full py-3 rounded-xl font-bold text-sm text-center transition-all duration-300 mb-6 disabled:opacity-50 ${
                      tier.highlighted
                        ? "bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white shadow-lg hover:shadow-xl"
                        : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                    }`}
                  >
                    {checkingOut ? "Redirecting..." : tier.cta}
                  </button>
                )}

                <ul className="space-y-3">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckIcon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                        tier.highlighted ? "text-brand-400" : "text-gray-500"
                      }`} />
                      <span className="text-sm text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Featured Profiles Add-on */}
        <div className="mt-16 max-w-3xl mx-auto">
          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl p-5 sm:p-8 text-center">
            <h3 className="text-xl font-display font-bold text-white mb-2">
              Featured Profile
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Appear at the top of search results for your skills. Get 10x more profile views.
            </p>
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-3xl font-display font-bold text-white">$19</span>
              <span className="text-gray-500 text-sm">/week</span>
            </div>
            <p className="text-xs text-gray-500">
              Available for Pro tier members. Select which skills to boost.
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-2xl font-display font-bold text-white text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "Is TalentAgent really free for candidates?",
                a: "Yes. Core features — portfolio, AI chat (5/day), fit assessment (3/day), ghost job detection, eligibility badges — are free forever. Pro gives you 10x the limits, analytics, and priority placement.",
              },
              {
                q: "Can I cancel anytime?",
                a: "Yes. No contracts, no cancellation fees. Downgrade to Free anytime and keep your portfolio and data.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards through Stripe. Annual plans can also be paid by invoice.",
              },
              {
                q: "How does Featured Profile work?",
                a: "Your profile appears at the top of search results for your selected skills. Average featured profiles get 10x more views.",
              },
            ].map((faq, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h4 className="text-sm font-heading font-bold text-white mb-2">{faq.q}</h4>
                <p className="text-sm text-gray-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
