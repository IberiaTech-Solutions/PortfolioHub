"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/utils/supabase";
import { User } from "@supabase/supabase-js";
import {
  PlusIcon,
} from "@heroicons/react/20/solid";
import SearchBar from "@/components/SearchBar";
import FadeIn, { useCountUp } from "@/components/FadeIn";
import { Portfolio } from "@/types";

function HomeContent() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedJobTitles, setSelectedJobTitles] = useState<string[]>([]);
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [availableJobTitles, setAvailableJobTitles] = useState<string[]>([]);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [availableExperience, setAvailableExperience] = useState<string[]>([]);
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [currentSearchExample, setCurrentSearchExample] = useState(0);
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [portfolioCount, setPortfolioCount] = useState(0);
  const [jobCount, setJobCount] = useState(0);
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);

  // Rotating search examples
  const searchExamples = [
    "React developers",
    "UI/UX designers", 
    "Full-stack engineers",
    "Python developers",
    "DevOps engineers",
    "Mobile developers"
  ];

  // Rotating placeholder examples
  const placeholderExamples = [
    "Search by name, skill, or portfolio platform...",
    "React developers",
    "UI/UX designers",
    "Full-stack engineers",
    "Python developers",
    "DevOps engineers"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSearchExample((prev) => (prev + 1) % searchExamples.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [searchExamples.length]);

  useEffect(() => {
    const placeholderInterval = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholderExamples.length);
    }, 4000);

    return () => clearInterval(placeholderInterval);
  }, [placeholderExamples.length]);

  // Check authentication status
  useEffect(() => {
    const getUser = async () => {
      if (!supabase) {
        console.warn('Supabase not configured');
        setAuthLoading(false);
        return;
      }
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error('Error getting user:', error);
      } finally {
        setAuthLoading(false);
      }
    };

    getUser();

    // Listen for auth state changes
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        setUser(session?.user ?? null);
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  // Fetch social proof stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!supabase) return;
      const [portfolioRes, jobRes] = await Promise.all([
        supabase.from("portfolios").select("id", { count: "exact", head: true }),
        supabase.from("jobs").select("id", { count: "exact", head: true }),
      ]);
      setPortfolioCount(portfolioRes.count ?? 0);
      setJobCount(jobRes.count ?? 0);
    };
    fetchStats();
  }, []);

  // Observe stats section visibility for count-up
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStatsVisible(true); obs.disconnect(); } },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const portfolioCountUp = useCountUp(portfolioCount, statsVisible);
  const jobCountUp = useCountUp(jobCount, statsVisible);
  const aiChatCountUp = useCountUp(1200, statsVisible);

  useEffect(() => {
    // Fetch available skills and job titles
    const fetchFilterOptions = async () => {
      if (!supabase) {
        console.warn('Supabase not configured');
        return;
      }
      
      const { data: portfoliosData } = await supabase
        .from("portfolios")
        .select("skills, job_title");

      if (portfoliosData) {
        // Extract unique skills
        const skills = new Set<string>();
        (portfoliosData as Portfolio[]).forEach((portfolio) => {
          if (portfolio.skills) {
            portfolio.skills.forEach((skill: string) => skills.add(skill));
          }
        });
        setAvailableSkills(Array.from(skills).sort());

        // Extract unique job titles
        const jobTitles = new Set<string>();
        (portfoliosData as Portfolio[]).forEach((portfolio) => {
          if (portfolio.job_title) {
            jobTitles.add(portfolio.job_title);
          }
        });
        setAvailableJobTitles(Array.from(jobTitles).sort());
      }
    };

    fetchFilterOptions();
  }, []);

  useEffect(() => {
    // If there's an initial query param, perform search
    if (searchParams.get("q")) {
      performSearch(searchParams.get("q") || "");
    } else {
      // If no query param, show default portfolios
      performSearch("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);


  const performSearch = async (query: string) => {
    setLoading(true);
    setHasSearched(true);

    if (!supabase) {
      console.warn('Supabase not configured');
      setLoading(false);
      return;
    }

    let supabaseQuery = supabase
      .from("portfolios")
      .select("*");

    // Server-side text search using Supabase ilike for now
    // Full-text search requires a tsvector column which may not exist
    if (query && query.trim()) {
      const searchTerm = `%${query.trim()}%`;
      supabaseQuery = supabaseQuery.or(
        `title.ilike.${searchTerm},description.ilike.${searchTerm},job_title.ilike.${searchTerm},name.ilike.${searchTerm}`
      );
    }

    const { data: portfoliosData, error } = await supabaseQuery.limit(50);

    if (error) {
      console.error("Error fetching portfolios:", error);
      setLoading(false);
      return;
    }

    let filteredPortfolios = (portfoliosData || []) as Portfolio[];

    // Apply skill filters (client-side since skills is a jsonb array)
    if (selectedSkills.length > 0) {
      filteredPortfolios = filteredPortfolios.filter((portfolio) =>
        selectedSkills.every((skill) => portfolio.skills?.includes(skill))
      );
    }

    // Apply job title filters
    if (selectedJobTitles.length > 0) {
      filteredPortfolios = filteredPortfolios.filter((portfolio) =>
        selectedJobTitles.includes(portfolio.job_title)
      );
    }

    // Sort featured profiles to the top
    filteredPortfolios.sort((a, b) => {
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      return 0;
    });

    setPortfolios(filteredPortfolios);

    // Extract unique filter options from all portfolios data
    const allPortfolios = (portfoliosData || []) as Portfolio[];

    const uniqueRoles = Array.from(new Set(
      allPortfolios
        .map(p => p.job_title)
        .filter(title => title && title.trim() !== '')
    )).sort();

    const uniqueExperience = Array.from(new Set(
      allPortfolios
        .map(p => p.experience_level)
        .filter((exp): exp is string => exp != null && exp.trim() !== '')
    )).sort();

    const uniqueLocations = Array.from(new Set(
      allPortfolios
        .map(p => p.location)
        .filter((loc): loc is string => loc != null && loc.trim() !== '')
    )).sort();

    const allSkills = allPortfolios
      .flatMap(p => p.skills || [])
      .filter(skill => skill && skill.trim() !== '');
    const uniqueSkills = Array.from(new Set(allSkills)).sort();

    setAvailableRoles(uniqueRoles);
    setAvailableExperience(uniqueExperience);
    setAvailableLocations(uniqueLocations);
    setAvailableSkills(uniqueSkills);
    setAvailableJobTitles(uniqueRoles);

    setLoading(false);
  };

  // const clearFilters = () => {
  //   setSelectedSkills([]);
  //   setSelectedJobTitles([]);
  //   performSearch(searchQuery);
  // };


  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen flex items-center overflow-hidden">
        {/* Subtle Background Orb */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-3xl animate-pulse"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32 w-full">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-display font-bold text-white mb-6 sm:mb-8 tracking-tight">
              {!authLoading && user ? (
                <>
                  Welcome Back,
                  <br />
                  <span className="font-light animate-gradient-text">Your AI Agent is Live</span>
                </>
              ) : (
                <>
                  Your AI Agent.
                  <br />
                  <span className="font-light animate-gradient-text">Your Career. Your Terms.</span>
                </>
              )}
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl font-body text-brand-300 max-w-3xl mx-auto leading-relaxed font-light mb-8 sm:mb-12 px-4">
              {!authLoading && user
                ? "Your AI agent is representing you to recruiters right now. Check your matches and analytics."
                : "Stop competing with 400 applicants. Let your AI agent showcase your depth, match you to jobs honestly, and control your narrative."
              }
            </p>
            
            {/* Interactive Search Prompt */}
            <div className="mb-8 sm:mb-12">
              <div className="inline-flex items-center space-x-2 px-4 sm:px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-slate-300 text-xs sm:text-sm lg:text-base shadow-lg max-w-full">
                <span>{!authLoading && user ? "Find talent:" : "Try searching for:"}</span>
                <div className="relative">
                  <span className="inline-block min-w-[150px] sm:min-w-[200px] text-left">
                    <span className="text-brand-300 font-medium transition-all duration-500 ease-in-out">
                      {searchExamples[currentSearchExample]}
                    </span>
                  </span>
                </div>
              </div>
            </div>
            
          </div>

          {/* Search Section */}
          <div className="w-full max-w-5xl mx-auto mb-12 sm:mb-16 px-4">

            {/* Search Bar Block */}
            <div className="text-center mb-6">
              <p className="text-white text-sm sm:text-base font-medium">
                <span className="inline-flex items-center gap-2">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Smart Search Powered by Real Data
                </span>
              </p>
              <p className="text-white/80 text-xs sm:text-sm mt-1">
                Our filters are dynamically generated from actual portfolio data for more accurate and relevant results
              </p>
            </div>
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSearch={performSearch}
              selectedSkills={selectedSkills}
              setSelectedSkills={setSelectedSkills}
              selectedJobTitles={selectedJobTitles}
              setSelectedJobTitles={setSelectedJobTitles}
              availableSkills={availableSkills}
              availableJobTitles={availableJobTitles}
              placeholderExamples={placeholderExamples}
              currentPlaceholder={currentPlaceholder}
              showFilters={showFilters}
              setShowFilters={setShowFilters}
              enableStickyBehavior={true}
              availableRoles={availableRoles}
              availableExperience={availableExperience}
              availableLocations={availableLocations}
            />
          </div>
        </div>
      </div>

      {/* Partners / Integrations Section */}
      <div className="bg-slate-900 border-t border-white/10 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-xs sm:text-sm font-medium uppercase tracking-widest mb-8">
            Powered by industry-leading technology
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 lg:gap-16 opacity-60 hover:opacity-80 transition-opacity duration-500">
            {/* OpenAI */}
            <div className="flex items-center gap-2 text-gray-400">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.282 9.821a5.985 5.985 0 00-.516-4.91 6.046 6.046 0 00-6.51-2.9A6.065 6.065 0 0011.17.178 6.022 6.022 0 004.746 3.46a5.971 5.971 0 00-3.978 2.9 6.015 6.015 0 00.738 7.061 5.985 5.985 0 00.518 4.911 6.046 6.046 0 006.51 2.9A6.065 6.065 0 0012.83 23.82a6.022 6.022 0 006.424-3.282 5.971 5.971 0 003.978-2.9 6.015 6.015 0 00-.738-7.061zM12.83 22.32a4.548 4.548 0 01-2.916-1.058l.145-.084 4.843-2.797a.785.785 0 00.397-.683v-6.823l2.048 1.183a.073.073 0 01.04.056v5.655a4.56 4.56 0 01-4.557 4.551zM3.486 18.14a4.528 4.528 0 01-.542-3.043l.146.088 4.842 2.797a.793.793 0 00.793 0l5.91-3.413v2.366a.074.074 0 01-.03.063L9.72 19.81a4.56 4.56 0 01-6.234-1.67zM2.223 7.942A4.525 4.525 0 014.6 5.95l-.002.165v5.594a.782.782 0 00.393.68l5.91 3.413-2.047 1.182a.073.073 0 01-.07.006L3.9 14.178a4.56 4.56 0 01-1.677-6.236zM18.753 11.6l-5.91-3.413L14.89 6.99a.073.073 0 01.07-.006l4.883 2.82a4.558 4.558 0 01-.7 8.211v-5.76a.785.785 0 00-.39-.656zm2.04-3.05l-.146-.087-4.842-2.798a.793.793 0 00-.793 0l-5.91 3.414V6.713a.074.074 0 01.03-.063l4.883-2.813a4.556 4.556 0 016.778 4.713zM8.31 12.74l-2.047-1.183a.073.073 0 01-.04-.056V5.847a4.555 4.555 0 017.47-3.495l-.145.084-4.843 2.797a.785.785 0 00-.397.683l-.003 6.823zM9.508 11.2L12 9.762l2.492 1.438v2.876L12 15.514l-2.492-1.438z"/>
              </svg>
              <span className="font-heading font-semibold text-sm">OpenAI</span>
            </div>
            {/* Supabase */}
            <div className="flex items-center gap-2 text-gray-400">
              <svg className="w-5 h-5" viewBox="0 0 109 113" fill="currentColor">
                <path d="M63.708 110.284c-2.86 3.601-8.658 1.628-8.727-2.97l-1.007-67.251h45.22c8.19 0 12.758 9.46 7.665 15.874z"/>
                <path d="M63.708 110.284c-2.86 3.601-8.658 1.628-8.727-2.97l-1.007-67.251h45.22c8.19 0 12.758 9.46 7.665 15.874z" fillOpacity=".2"/>
                <path d="M45.317 2.071c2.86-3.601 8.657-1.628 8.726 2.97l.442 67.251H9.83c-8.19 0-12.759-9.46-7.665-15.875z"/>
              </svg>
              <span className="font-heading font-semibold text-sm">Supabase</span>
            </div>
            {/* Vercel */}
            <div className="flex items-center gap-2 text-gray-400">
              <svg className="w-5 h-5" viewBox="0 0 76 65" fill="currentColor">
                <path d="M37.532 0L75.064 65H0z"/>
              </svg>
              <span className="font-heading font-semibold text-sm">Vercel</span>
            </div>
            {/* Next.js */}
            <div className="flex items-center gap-2 text-gray-400">
              <svg className="w-5 h-5" viewBox="0 0 180 180" fill="currentColor">
                <mask id="a" maskUnits="userSpaceOnUse" x="0" y="0" width="180" height="180">
                  <circle cx="90" cy="90" r="90" fill="white"/>
                </mask>
                <g mask="url(#a)">
                  <circle cx="90" cy="90" r="90" fill="currentColor"/>
                  <path d="M149.508 157.52L69.142 54H54v71.97h12.114V69.384l73.885 95.461a90.304 90.304 0 009.509-7.325z" fill="black"/>
                  <rect x="115" y="54" width="12" height="72" fill="black"/>
                </g>
              </svg>
              <span className="font-heading font-semibold text-sm">Next.js</span>
            </div>
            {/* LinkedIn (jobs data) */}
            <div className="flex items-center gap-2 text-gray-400">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <span className="font-heading font-semibold text-sm">LinkedIn Jobs</span>
            </div>
            {/* Indeed */}
            <div className="flex items-center gap-2 text-gray-400">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.566 21.563v-8.762c0-.317.05-.634.05-.95 0-2.06-.683-3.328-2.78-3.328-1.89 0-3.328 1.524-3.328 3.645v9.395H2.004V6.86h3.504v2.06h.05c.733-1.425 2.255-2.377 3.96-2.377 3.012 0 5.553 2.06 5.553 6.338v8.682z"/>
                <circle cx="3.756" cy="3.125" r="2.06"/>
              </svg>
              <span className="font-heading font-semibold text-sm">Indeed</span>
            </div>
            {/* Glassdoor */}
            <div className="flex items-center gap-2 text-gray-400">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.144 20.572H6.856A2.856 2.856 0 014 17.716V8.57h2.856v9.145h13.145V20.57h-2.857zM6.856 3.43h10.288A2.856 2.856 0 0120 6.284v9.145h-2.856V6.285H4V3.43h2.856z"/>
              </svg>
              <span className="font-heading font-semibold text-sm">Glassdoor</span>
            </div>
          </div>
        </div>
      </div>

      {/* How it Works Section */}
      <div className="bg-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 sm:mb-20">
            <p className="text-brand-600 font-heading font-bold text-sm uppercase tracking-widest mb-3">How it works</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-4">
              From Resume to AI Agent in 3 Steps
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              No more tweaking bullet points for ATS bots. Build once, let your AI agent do the rest.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Step 1 */}
            <FadeIn delay={0}>
            <div className="relative text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div className="absolute top-8 left-[60%] hidden md:block w-[80%] border-t-2 border-dashed border-gray-200"></div>
              <span className="inline-block px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-xs font-bold mb-3">Step 1</span>
              <h3 className="text-xl font-heading font-bold text-gray-900 mb-2">Import Your Resume</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Paste your resume or upload a file. AI extracts your skills, experience, and projects in 30 seconds.
              </p>
            </div>
            </FadeIn>

            {/* Step 2 */}
            <FadeIn delay={150}>
            <div className="relative text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="absolute top-8 left-[60%] hidden md:block w-[80%] border-t-2 border-dashed border-gray-200"></div>
              <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold mb-3">Step 2</span>
              <h3 className="text-xl font-heading font-bold text-gray-900 mb-2">Your AI Agent Goes Live</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                An AI agent trained on your work answers questions from recruiters 24/7. It demonstrates depth that resumes can&apos;t.
              </p>
            </div>
            </FadeIn>

            {/* Step 3 */}
            <FadeIn delay={300}>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold mb-3">Step 3</span>
              <h3 className="text-xl font-heading font-bold text-gray-900 mb-2">Get Matched Honestly</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                AI scores your fit for every job. It tells you when to apply — and when not to. No more wasting time on dead ends.
              </p>
            </div>
            </FadeIn>
          </div>
        </div>
      </div>

      {/* Feature Showcase Section */}
      <div className="bg-slate-900 py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 sm:mb-20">
            <p className="text-brand-400 font-heading font-bold text-sm uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white mb-4">
              Everything You Need to Stand Out
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Built for the professionals who are done playing the ATS lottery.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <FadeIn delay={0}>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-brand-500/30 transition-all duration-500 group">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-heading font-bold text-white mb-2">AI Portfolio Agent</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Recruiters chat with your AI agent to understand your experience in depth. No more 6-second resume scans.
              </p>
            </div>
            </FadeIn>

            {/* Feature 2 */}
            <FadeIn delay={100}>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-emerald-500/30 transition-all duration-500 group">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-heading font-bold text-white mb-2">Honest Fit Scores</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                AI scores your fit 0-100 for every job. It tells you &quot;don&apos;t apply&quot; when the match is weak. Trust beats false hope.
              </p>
            </div>
            </FadeIn>

            {/* Feature 3 */}
            <FadeIn delay={200}>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-purple-500/30 transition-all duration-500 group">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-heading font-bold text-white mb-2">Real Job Matching</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Jobs from LinkedIn, Indeed, and Glassdoor — matched to your skills in real-time. No more scrolling through 500 irrelevant posts.
              </p>
            </div>
            </FadeIn>

            {/* Feature 4 */}
            <FadeIn delay={300}>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-amber-500/30 transition-all duration-500 group">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-lg font-heading font-bold text-white mb-2">Resume Import</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Paste your resume, AI fills your entire profile in 30 seconds. Skills, projects, experience — all extracted automatically.
              </p>
            </div>
            </FadeIn>

            {/* Feature 5 */}
            <FadeIn delay={400}>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-rose-500/30 transition-all duration-500 group">
              <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-heading font-bold text-white mb-2">Profile Analytics</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                See who viewed your profile, chatted with your AI, and ran fit assessments. Know your market value in real-time.
              </p>
            </div>
            </FadeIn>

            {/* Feature 6 */}
            <FadeIn delay={500}>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-blue-500/30 transition-all duration-500 group">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h3 className="text-lg font-heading font-bold text-white mb-2">Shareable Profile</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Get a vanity URL like talentagent.com/yourname. Share it in emails, LinkedIn, and applications instead of a PDF resume.
              </p>
            </div>
            </FadeIn>
          </div>
        </div>
      </div>

      {/* Why TalentAgent Section */}
      <div className="bg-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
          <div className="text-center mb-14 sm:mb-20">
            <p className="text-rose-500 font-heading font-bold text-sm uppercase tracking-widest mb-3">The problem</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-4">
              The Job Market is Broken
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Job seekers waste hours on dead-end applications. Recruiters drown in unqualified resumes. Everyone loses.
            </p>
          </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            <FadeIn delay={0}>
            <div className="text-center p-6 rounded-2xl border border-gray-100 bg-gray-50/50">
              <p className="text-4xl sm:text-5xl font-display font-bold text-gray-900 mb-2">250</p>
              <p className="text-sm font-heading font-bold text-gray-500 mb-3">applicants per job posting</p>
              <p className="text-xs text-gray-400 leading-relaxed">Average applications per role. Entry-level sees 400+. Only 2.4% reach the interview.</p>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-bold text-brand-600">TalentAgent: AI scores your fit so you only apply where you match.</p>
              </div>
            </div>
            </FadeIn>

            <FadeIn delay={100}>
            <div className="text-center p-6 rounded-2xl border border-gray-100 bg-gray-50/50">
              <p className="text-4xl sm:text-5xl font-display font-bold text-gray-900 mb-2">27%</p>
              <p className="text-sm font-heading font-bold text-gray-500 mb-3">of job postings are ghost jobs</p>
              <p className="text-xs text-gray-400 leading-relaxed">Companies post fake listings to look like they&apos;re growing. 93% of HR admit to it.</p>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-bold text-brand-600">TalentAgent: Ghost job detection flags stale and suspicious listings.</p>
              </div>
            </div>
            </FadeIn>

            <FadeIn delay={200}>
            <div className="text-center p-6 rounded-2xl border border-gray-100 bg-gray-50/50">
              <p className="text-4xl sm:text-5xl font-display font-bold text-gray-900 mb-2">71%</p>
              <p className="text-sm font-heading font-bold text-gray-500 mb-3">of recruiters see fake candidates</p>
              <p className="text-xs text-gray-400 leading-relaxed">AI-generated resumes and synthetic identities are flooding pipelines.</p>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-bold text-brand-600">TalentAgent: Verified profiles with GitHub scoring and real collaboration proof.</p>
              </div>
            </div>
            </FadeIn>

            <FadeIn delay={300}>
            <div className="text-center p-6 rounded-2xl border border-gray-100 bg-gray-50/50">
              <p className="text-4xl sm:text-5xl font-display font-bold text-gray-900 mb-2">0.1%</p>
              <p className="text-sm font-heading font-bold text-gray-500 mb-3">of applications lead to offers</p>
              <p className="text-xs text-gray-400 leading-relaxed">You need ~42 applications to land one interview. Most are wasted on bad matches.</p>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-bold text-brand-600">TalentAgent: Honest &quot;Don&apos;t Apply&quot; signals save you from dead ends.</p>
              </div>
            </div>
            </FadeIn>
          </div>
        </div>
      </div>

      {/* Chrome Extension Section */}
      <div className="bg-slate-900 py-16 sm:py-20 border-t border-white/5">
        <FadeIn>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-brand-500/10 to-purple-500/10 border border-brand-500/20 rounded-3xl p-8 sm:p-12 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            {/* Left: Icon + Text */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center px-3 py-1.5 bg-brand-500/20 border border-brand-500/30 rounded-full text-brand-300 text-xs font-bold mb-4">
                <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Chrome Extension
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-3">
                Check Your Fit on Any Job Page
              </h2>
              <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-6">
                Get your AI fit score directly on LinkedIn, Indeed, and Glassdoor.
                No more copy-pasting — one click tells you if you should apply.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
                <a
                  href="https://chrome.google.com/webstore"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-xl font-heading font-bold text-sm transition-all hover:shadow-xl hover:scale-105"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
                    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M21.17 8H12" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M3.95 6.06L8.54 14" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M10.88 21.94L15.46 14" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                  Add to Chrome — Free
                </a>
                <Link
                  href="/check-fit"
                  className="inline-flex items-center gap-2 px-6 py-3 text-gray-400 hover:text-white text-sm font-medium transition-colors"
                >
                  Or try the web version
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Right: Browser Mockup */}
            <div className="flex-shrink-0 w-full lg:w-72">
              <div className="bg-slate-800 rounded-xl border border-white/10 overflow-hidden shadow-2xl">
                {/* Browser chrome */}
                <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-700/50 border-b border-white/5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/60"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60"></div>
                  <div className="flex-1 mx-2 h-5 bg-white/10 rounded-md px-2 flex items-center">
                    <span className="text-[9px] text-gray-500 truncate">linkedin.com/jobs/view/senior-react...</span>
                  </div>
                </div>
                {/* Extension popup preview */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-brand-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-[10px] font-black">T</span>
                    </div>
                    <span className="text-white text-xs font-bold">TalentAgent</span>
                  </div>
                  {/* Score ring */}
                  <div className="flex items-center gap-3">
                    <svg width="48" height="48" viewBox="0 0 48 48" className="-rotate-90">
                      <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3"/>
                      <circle cx="24" cy="24" r="20" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeDasharray="100 126"/>
                    </svg>
                    <div>
                      <p className="text-emerald-400 text-lg font-bold leading-none">87%</p>
                      <p className="text-gray-500 text-[10px]">Strong Match</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <span className="px-1.5 py-0.5 bg-emerald-500/15 text-emerald-400 text-[9px] font-bold rounded border border-emerald-500/30">+ React</span>
                    <span className="px-1.5 py-0.5 bg-emerald-500/15 text-emerald-400 text-[9px] font-bold rounded border border-emerald-500/30">+ TypeScript</span>
                    <span className="px-1.5 py-0.5 bg-amber-500/15 text-amber-400 text-[9px] font-bold rounded border border-amber-500/30">- GraphQL</span>
                  </div>
                  <p className="text-emerald-400 text-[10px] font-bold">You should apply</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        </FadeIn>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-brand-600 via-brand-700 to-purple-800 py-16 sm:py-20">
        <FadeIn>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white mb-6">
            Ready to Stop Playing the Resume Game?
          </h2>
          <p className="text-lg sm:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Join professionals who let their AI agent do the talking. Import your resume and go live in under a minute.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth?mode=signup"
              className="inline-flex items-center px-8 py-4 bg-white text-brand-700 rounded-xl font-heading font-bold text-lg transition-all duration-300 shadow-2xl hover:shadow-white/25 hover:scale-105"
            >
              Get Started Free
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/jobs"
              className="inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white border border-white/30 rounded-xl font-heading font-bold text-lg transition-all duration-300 hover:bg-white/20 hover:scale-105"
            >
              Browse Jobs First
            </Link>
          </div>
          <p className="text-white/50 text-sm mt-6">No credit card required. Free forever for candidates.</p>
        </div>
        </FadeIn>
      </div>

      {/* Social Proof Section */}
      <div className="bg-white py-16 sm:py-20 border-b border-gray-100">
        <div ref={statsRef} className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <FadeIn delay={0}>
              <div>
                <p className="text-4xl sm:text-5xl font-display font-bold text-gray-900">
                  {portfolioCountUp}+
                </p>
                <p className="text-gray-500 font-heading font-medium mt-2">Portfolios Created</p>
              </div>
            </FadeIn>
            <FadeIn delay={150}>
              <div>
                <p className="text-4xl sm:text-5xl font-display font-bold text-gray-900">
                  {jobCountUp}+
                </p>
                <p className="text-gray-500 font-heading font-medium mt-2">Jobs Matched</p>
              </div>
            </FadeIn>
            <FadeIn delay={300}>
              <div>
                <p className="text-4xl sm:text-5xl font-display font-bold text-gray-900">
                  {aiChatCountUp}+
                </p>
                <p className="text-gray-500 font-heading font-medium mt-2">AI Chats This Week</p>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>

      {/* Discover Talent Section */}
      <div id="discover-talent" className="bg-gray-50 py-12 sm:py-16 lg:py-20" style={{ paddingTop: 'calc(3rem + env(safe-area-inset-top))' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 mb-4">
              Discover Talent
            </h2>
            <p className="text-lg sm:text-xl font-body text-gray-600 max-w-2xl mx-auto px-4">
              Browse professionals with AI-powered profiles. Chat with their agents to evaluate fit instantly.
            </p>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white/90 backdrop-blur-md border border-white/20 rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg animate-pulse">
                  {/* Hero Image Skeleton */}
                  <div className="h-40 sm:h-48 bg-gray-200"></div>
                  
                  {/* Profile Section Skeleton */}
                  <div className="p-4 sm:p-6 pb-3 sm:pb-4">
                    <div className="flex items-start space-x-3 sm:space-x-4 mb-4 sm:mb-5">
                      {/* Avatar Skeleton */}
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-2xl sm:rounded-3xl"></div>
                      
                      {/* Info Skeleton */}
                      <div className="flex-1 min-w-0">
                        <div className="h-5 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                    
                    {/* Skills Skeleton */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                      <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                      <div className="h-6 bg-gray-200 rounded-full w-14"></div>
                    </div>
                    
                    {/* Button Skeleton */}
                    <div className="h-10 bg-gray-200 rounded-2xl"></div>
                  </div>
                </div>
              ))}
            </div>
        ) : hasSearched ? (
          <div className="w-full">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-light text-gray-900 mb-2">
                {searchQuery
                  ? `Results for "${searchQuery}"`
                  : "Featured Portfolios"}
              </h2>
              <p className="text-gray-600">
                {portfolios.length} {portfolios.length === 1 ? 'portfolio' : 'portfolios'} found
              </p>
            </div>

            {portfolios.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  No portfolios found
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Try a different search term or browse all portfolios to discover talent
                </p>
                <Link
                  href="/create-portfolio"
                  className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors duration-200 text-sm sm:text-base"
                >
                  <PlusIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Create Portfolio
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {portfolios.map((portfolio) => (
                  <div
                    key={portfolio.id}
                    className="group relative bg-white/90 backdrop-blur-md border border-white/20 rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg hover:shadow-xl sm:hover:shadow-2xl transition-all duration-500 sm:duration-700 transform hover:-translate-y-2 sm:hover:-translate-y-4 hover:scale-[1.02] sm:hover:scale-[1.03] hover:border-brand-300/30"
                  >
                    {/* Portfolio Hero Image */}
                    {portfolio.hero_image ? (
                      <div className="relative h-40 sm:h-48 overflow-hidden">
                        <a
                          href={portfolio.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full h-full"
                        >
                          <Image
                            src={portfolio.hero_image || '/Portfolio.jpg'}
                            alt={`${portfolio.title} portfolio hero`}
                            width={400}
                            height={192}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            style={{ width: 'auto', height: 'auto' }}
                            priority={false}
                            loading="lazy"
                            quality={75}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        </a>
                        {/* Fallback gradient */}
                        <div className="hidden absolute inset-0 bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700"></div>
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                        {/* Visit Website Button */}
                        {portfolio.website_url && (
                          <div className="absolute bottom-4 left-4">
                            <a
                              href={portfolio.website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-1.5 bg-white/95 hover:bg-white text-gray-900 rounded-lg text-xs font-semibold backdrop-blur-md shadow-lg border border-white/30 transition-all duration-300 hover:shadow-xl hover:scale-105"
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              Visit Personal Site
                            </a>
                          </div>
                        )}
                      </div>
                    ) : portfolio.website_screenshot ? (
                      <div className="relative h-40 sm:h-48 overflow-hidden">
                        <a
                          href={portfolio.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full h-full"
                        >
                          <Image
                            src={portfolio.website_screenshot || '/Portfolio.jpg'}
                            alt={`${portfolio.title} portfolio screenshot`}
                            width={400}
                            height={192}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        </a>
                        {/* Fallback gradient */}
                        <div className="hidden absolute inset-0 bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700"></div>
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                        {/* Visit Website Button */}
                        {portfolio.website_url && (
                          <div className="absolute bottom-4 left-4">
                            <a
                              href={portfolio.website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-1.5 bg-white/95 hover:bg-white text-gray-900 rounded-lg text-xs font-semibold backdrop-blur-md shadow-lg border border-white/30 transition-all duration-300 hover:shadow-xl hover:scale-105"
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              Visit Personal Site
                            </a>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="relative h-40 sm:h-48 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 overflow-hidden">
                        {/* Pattern overlay */}
                        <div className="absolute inset-0 opacity-20">
                          <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
                            <defs>
                              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="gray" strokeWidth="0.5"/>
                              </pattern>
                            </defs>
                            <rect width="100" height="100" fill="url(#grid)" />
                          </svg>
                        </div>
                        {/* Center content with initials */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                              <span className="text-white font-bold text-2xl">
                                {portfolio.name?.split(' ').map(n => n.charAt(0)).join('').toUpperCase() || 'P'}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm font-medium">Portfolio Preview</p>
                          </div>
                        </div>
                        {/* Visit Website Button */}
                        {portfolio.website_url && (
                          <div className="absolute bottom-4 left-4">
                            <a
                              href={portfolio.website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-1.5 bg-white/95 hover:bg-white text-gray-900 rounded-lg text-xs font-semibold backdrop-blur-md shadow-lg border border-white/30 transition-all duration-300 hover:shadow-xl hover:scale-105"
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              Visit Personal Site
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Modern Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-50/40 via-transparent to-emerald-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                    
                    {/* Subtle Inner Glow */}
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                    
                    {/* Profile Header */}
                    <div className="relative p-4 sm:p-6 pb-3 sm:pb-4">
                      <div className="flex items-start space-x-3 sm:space-x-4 mb-4 sm:mb-5">
                        {/* Modern Avatar */}
                        <div className="flex-shrink-0 relative">
                          {portfolio.profile_image ? (
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg sm:shadow-xl group-hover:shadow-xl sm:group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110 ring-2 ring-white/20 group-hover:ring-brand-300/30">
                              <Image
                                src={portfolio.profile_image || '/Portfolio.jpg'}
                                alt={`${portfolio.name} profile`}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                                style={{ width: 'auto', height: 'auto' }}
                                priority={false}
                                loading="lazy"
                                quality={75}
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                              {/* Fallback gradient */}
                              <div className="hidden w-full h-full bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 flex items-center justify-center">
                                <span className="text-white font-bold text-xl">
                                  {portfolio.name?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg sm:shadow-xl group-hover:shadow-xl sm:group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110 ring-2 ring-white/20 group-hover:ring-brand-300/30">
                              <span className="text-white font-bold text-sm sm:text-base">
                                {portfolio.name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          {/* Modern Status Indicator */}
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-emerald-400 to-emerald-500 border-2 sm:border-3 border-white rounded-full shadow-md sm:shadow-lg"></div>
                        </div>
                        
                        {/* Modern Profile Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm sm:text-base font-heading font-bold text-gray-900 mb-1 group-hover:text-brand-600 transition-colors duration-500 line-clamp-2">
                            {portfolio.title}
                          </h3>
                          <p className="text-gray-600 text-xs font-medium mb-2">
                            {portfolio.name}
                          </p>
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-brand-500 text-black border border-brand-600 shadow-sm">
                              {portfolio.job_title}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Modern Description */}
                      <div className="mb-3">
                        <p className="text-gray-700 line-clamp-2 leading-relaxed text-xs font-normal">
                          {portfolio.description}
                        </p>
                      </div>
                      
                      {/* Modern Skills Tags */}
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                          {portfolio.skills &&
                            portfolio.skills.slice(0, 3).map((skill, index) => (
                              <span
                                key={index}
                                className="bg-gray-100 text-gray-700 rounded-full px-2 py-0.5 text-xs font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                          {portfolio.skills && portfolio.skills.length > 3 && (
                            <span className="bg-gray-100 text-gray-600 border border-gray-200 rounded-full px-1.5 py-0.5 text-xs font-medium">
                              +{portfolio.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Enhanced Social Links & Actions */}
                    <div className="relative px-4 sm:px-6 pb-4 sm:pb-6">
                      <div className="flex items-center justify-between">
                        {/* Modern Social Links */}
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          {portfolio.github_url && (
                            <a
                              href={portfolio.github_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-300 hover:scale-110"
                              title="GitHub"
                            >
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                              </svg>
                            </a>
                          )}
                          {portfolio.linkedin_url && (
                            <a
                              href={portfolio.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-gray-500 hover:text-white hover:bg-blue-600 rounded-lg transition-all duration-300 hover:scale-110"
                              title="LinkedIn"
                            >
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                              </svg>
                            </a>
                          )}
                          {portfolio.website_url && (
                            <a
                              href={portfolio.website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-gray-500 hover:text-white hover:bg-emerald-600 rounded-lg transition-all duration-300 hover:scale-110"
                              title="Website"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                              </svg>
                            </a>
                          )}
                        </div>
                        
                        {/* Modern View Profile Button */}
                        <Link
                          href={`/portfolio/${portfolio.id}`}
                          className="inline-flex items-center px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-black rounded-lg font-semibold transition-all duration-300 hover:scale-105 text-xs border border-brand-500/30 shadow-lg hover:shadow-xl"
                        >
                          View Profile
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3 ml-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
          </div>
        ) : null}
        </div>
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
