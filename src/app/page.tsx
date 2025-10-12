"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/utils/supabase";
import { User } from "@supabase/supabase-js";
import {
  PlusIcon,
} from "@heroicons/react/20/solid";
import SearchBar from "@/components/SearchBar";

type Portfolio = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  website_url: string;
  website_screenshot?: string;
  profile_image?: string;
  hero_image?: string;
  github_url: string;
  linkedin_url: string;
  location?: string;
  experience_level?: string;
  preferred_work_type?: string[];
  languages?: string;
  skills: string[];
  job_title: string;
  created_at: string;
  name: string;
};

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (portfoliosData as unknown as any[]).forEach((portfolio) => {
          if (portfolio.skills) {
            portfolio.skills.forEach((skill: string) => skills.add(skill));
          }
        });
        setAvailableSkills(Array.from(skills).sort());

        // Extract unique job titles
        const jobTitles = new Set<string>();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (portfoliosData as unknown as any[]).forEach((portfolio) => {
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

    const { data: portfoliosData, error } = await supabase
      .from("portfolios")
      .select("*")
      .limit(50);

    if (error) {
      console.error("Error fetching portfolios:", error);
      setLoading(false);
      return;
    }

    // Filter portfolios based on the search query and selected filters
    let filteredPortfolios = portfoliosData as Portfolio[];

    // Apply text search
    if (query) {
      const searchTerms = query
        .toLowerCase()
        .split(" ")
        .filter((term) => term.length > 0);

      filteredPortfolios = filteredPortfolios.filter((portfolio) =>
        searchTerms.every(
          (term) =>
            portfolio.title?.toLowerCase().includes(term) ||
            portfolio.description?.toLowerCase().includes(term) ||
            portfolio.job_title?.toLowerCase().includes(term) ||
            portfolio.name?.toLowerCase().includes(term) ||
            portfolio.skills?.some((skill) =>
              skill.toLowerCase().includes(term)
            )
        )
      );
    }

    // Apply skill filters
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

    setPortfolios(filteredPortfolios || []);

    // Extract unique filter options from all portfolios data
    const allPortfolios = portfoliosData as Portfolio[];
    
    // Extract unique job titles/roles
    const uniqueRoles = Array.from(new Set(
      allPortfolios
        .map(p => p.job_title)
        .filter(title => title && title.trim() !== '')
    )).sort();
    
    // Extract unique experience levels (if we have experience data)
    const uniqueExperience = Array.from(new Set(
      allPortfolios
        .map(p => p.experience_level)
        .filter((exp): exp is string => exp != null && exp.trim() !== '')
    )).sort();
    
    // Extract unique locations
    const uniqueLocations = Array.from(new Set(
      allPortfolios
        .map(p => p.location)
        .filter((loc): loc is string => loc != null && loc.trim() !== '')
    )).sort();
    
    
    // Extract unique skills
    const allSkills = allPortfolios
      .flatMap(p => p.skills || [])
      .filter(skill => skill && skill.trim() !== '');
    const uniqueSkills = Array.from(new Set(allSkills)).sort();

    setAvailableRoles(uniqueRoles);
    setAvailableExperience(uniqueExperience);
    setAvailableLocations(uniqueLocations);
    setAvailableSkills(uniqueSkills);
    setAvailableJobTitles(uniqueRoles); // Job titles are the same as roles

    setLoading(false);
  };

  // const clearFilters = () => {
  //   setSelectedSkills([]);
  //   setSelectedJobTitles([]);
  //   performSearch(searchQuery);
  // };

  const getActiveFilterCount = () => {
    return selectedSkills.length + selectedJobTitles.length;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen flex items-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-10">
          {/* Floating Gradient Waves */}
          <div className="absolute top-20 left-10 w-32 h-32 bg-brand-400 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-purple-400 rounded-full blur-2xl animate-bounce" style={{animationDuration: '3s'}}></div>
          <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-blue-400 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-emerald-400 rounded-full blur-2xl animate-bounce" style={{animationDuration: '4s', animationDelay: '2s'}}></div>
          
          {/* Floating Avatar Dots */}
          <div className="absolute top-1/4 left-1/5 w-3 h-3 bg-white rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
          <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-brand-300 rounded-full animate-ping" style={{animationDelay: '1.5s'}}></div>
          <div className="absolute bottom-1/3 left-1/3 w-2.5 h-2.5 bg-purple-300 rounded-full animate-ping" style={{animationDelay: '2.5s'}}></div>
          <div className="absolute top-2/3 right-1/5 w-2 h-2 bg-blue-300 rounded-full animate-ping" style={{animationDelay: '3.5s'}}></div>
          
          {/* Animated Network Lines */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 1000" fill="none">
            <path d="M100 200 L300 150 L500 250 L700 180 L900 220" stroke="rgba(99, 102, 241, 0.3)" strokeWidth="2" fill="none" className="animate-pulse"/>
            <path d="M150 400 L350 350 L550 450 L750 380 L850 420" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="2" fill="none" className="animate-pulse" style={{animationDelay: '1s'}}/>
            <path d="M200 600 L400 550 L600 650 L800 580 L950 620" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="2" fill="none" className="animate-pulse" style={{animationDelay: '2s'}}/>
            
            {/* Animated Network Nodes */}
            <circle cx="100" cy="200" r="4" fill="rgba(99, 102, 241, 0.6)" className="animate-ping"/>
            <circle cx="300" cy="150" r="4" fill="rgba(99, 102, 241, 0.6)" className="animate-ping" style={{animationDelay: '0.5s'}}/>
            <circle cx="500" cy="250" r="4" fill="rgba(99, 102, 241, 0.6)" className="animate-ping" style={{animationDelay: '1s'}}/>
            <circle cx="700" cy="180" r="4" fill="rgba(99, 102, 241, 0.6)" className="animate-ping" style={{animationDelay: '1.5s'}}/>
            <circle cx="900" cy="220" r="4" fill="rgba(99, 102, 241, 0.6)" className="animate-ping" style={{animationDelay: '2s'}}/>
            
            <circle cx="150" cy="400" r="4" fill="rgba(139, 92, 246, 0.6)" className="animate-ping" style={{animationDelay: '0.3s'}}/>
            <circle cx="350" cy="350" r="4" fill="rgba(139, 92, 246, 0.6)" className="animate-ping" style={{animationDelay: '0.8s'}}/>
            <circle cx="550" cy="450" r="4" fill="rgba(139, 92, 246, 0.6)" className="animate-ping" style={{animationDelay: '1.3s'}}/>
            <circle cx="750" cy="380" r="4" fill="rgba(139, 92, 246, 0.6)" className="animate-ping" style={{animationDelay: '1.8s'}}/>
            <circle cx="850" cy="420" r="4" fill="rgba(139, 92, 246, 0.6)" className="animate-ping" style={{animationDelay: '2.3s'}}/>
          </svg>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32 w-full">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-display font-bold text-white mb-6 sm:mb-8 tracking-tight">
              {!authLoading && user ? (
                <>
                  Welcome Back,
                  <br />
                  <span className="font-light text-slate-200">Ready to Collaborate?</span>
                </>
              ) : (
                <>
                  Find Your Next
                  <br />
                  <span className="font-light text-slate-200">Collaboration</span>
                </>
              )}
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl font-body text-brand-300 max-w-3xl mx-auto leading-relaxed font-light mb-8 sm:mb-12 px-4">
              {!authLoading && user 
                ? "Discover talented professionals and showcase your work in our global community."
                : "The global community for developers and designers to showcase, connect, and collaborate."
              }
            </p>
            
            {/* Interactive Search Prompt */}
            <div className="mb-8 sm:mb-12">
              <div className="inline-flex items-center space-x-2 text-slate-300 text-sm sm:text-base">
                <span>{!authLoading && user ? "Find collaborators:" : "Try searching for:"}</span>
                <div className="relative">
                  <span className="inline-block min-w-[200px] text-left">
                    <span className="text-brand-300 font-medium transition-all duration-500 ease-in-out">
                      {searchExamples[currentSearchExample]}
                    </span>
                  </span>
                </div>
              </div>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 sm:mb-16 px-4">
              {!authLoading && user ? (
                <>
                  <Link
                    href="/create-portfolio"
                    className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-4 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white rounded-xl font-display font-semibold text-base sm:text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Portfolio
                  </Link>
                  <Link
                    href="/collaborations"
                    className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-4 bg-transparent border-2 border-white/30 hover:border-white/50 text-white rounded-xl font-display font-semibold text-base sm:text-lg backdrop-blur-sm transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Collaborations
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/create-portfolio"
                    className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-4 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white rounded-xl font-display font-semibold text-base sm:text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Showcase Your Work
                  </Link>
                  <Link
                    href="/auth"
                    className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-4 bg-transparent border-2 border-white/30 hover:border-white/50 text-white rounded-xl font-display font-semibold text-base sm:text-lg backdrop-blur-sm transition-all duration-300 transform hover:-translate-y-1"
                  >
                    Join Our Community
                  </Link>
                </>
              )}
            </div>
            
          </div>

          {/* Search Section */}
          <div className="w-full max-w-5xl mx-auto mb-12 sm:mb-16 px-4">
            {/* Smart Search Suggestions */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center space-x-2 text-slate-300 text-sm">
                <span>Try searching for:</span>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      setSearchQuery('React developers');
                      performSearch('React developers');
                    }}
                    className="px-3 py-1 bg-white/90 rounded-full text-xs font-medium hover:bg-white text-gray-900 transition-colors cursor-pointer shadow-sm"
                  >
                    React developers
                  </button>
                  <button
                    onClick={() => {
                      setSearchQuery('UI/UX designers');
                      performSearch('UI/UX designers');
                    }}
                    className="px-3 py-1 bg-white/90 rounded-full text-xs font-medium hover:bg-white text-gray-900 transition-colors cursor-pointer shadow-sm"
                  >
                    UI/UX designers
                  </button>
                  <button
                    onClick={() => {
                      setSearchQuery('Full-stack engineers');
                      performSearch('Full-stack engineers');
                    }}
                    className="px-3 py-1 bg-white/90 rounded-full text-xs font-medium hover:bg-white text-gray-900 transition-colors cursor-pointer shadow-sm"
                  >
                    Full-stack engineers
                  </button>
                </div>
              </div>
            </div>

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
              getActiveFilterCount={getActiveFilterCount}
              enableStickyBehavior={true}
              availableRoles={availableRoles}
              availableExperience={availableExperience}
              availableLocations={availableLocations}
            />
          </div>
        </div>
      </div>

      {/* Results Section */}
      {/* Main Content Section */}
      <div id="discover-talent" className="bg-gray-50 py-12 sm:py-16 lg:py-20" style={{ paddingTop: 'calc(3rem + env(safe-area-inset-top))' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-light text-gray-900 mb-4">
              Discover Talent
            </h2>
            <p className="text-lg sm:text-xl font-body text-gray-600 max-w-2xl mx-auto px-4">
              Browse through portfolios of skilled professionals ready to collaborate
            </p>
          </div>
          
          {loading ? (
          <div className="text-center py-20">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            </div>
            <p className="text-gray-600">Loading portfolios...</p>
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
                  className="inline-flex items-center px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Portfolio
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {portfolios.map((portfolio) => (
                  <div
                    key={portfolio.id}
                    className="group relative bg-white/90 backdrop-blur-md border border-white/20 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-4 hover:scale-[1.03] hover:border-brand-300/30"
                  >
                    {/* Portfolio Hero Image */}
                    {portfolio.hero_image ? (
                      <div className="relative h-48 overflow-hidden">
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
                        {/* Portfolio Badge */}
                        <div className="absolute top-4 right-4">
                          <span className="inline-flex items-center px-4 py-2 rounded-full text-xs font-bold bg-white/95 text-gray-900 backdrop-blur-md shadow-lg border border-white/30">
                            Portfolio
                          </span>
                        </div>
                        {/* Visit Website Button */}
                        {portfolio.website_url && (
                          <div className="absolute bottom-4 left-4">
                            <a
                              href={portfolio.website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-4 py-2 bg-white/95 hover:bg-white text-gray-900 rounded-xl text-xs font-bold backdrop-blur-md shadow-lg border border-white/30 transition-all duration-300 hover:shadow-xl hover:scale-105"
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
                      <div className="relative h-48 overflow-hidden">
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
                        {/* Portfolio Badge */}
                        <div className="absolute top-4 right-4">
                          <span className="inline-flex items-center px-4 py-2 rounded-full text-xs font-bold bg-white/95 text-gray-900 backdrop-blur-md shadow-lg border border-white/30">
                            Portfolio
                          </span>
                        </div>
                        {/* Visit Website Button */}
                        {portfolio.website_url && (
                          <div className="absolute bottom-4 left-4">
                            <a
                              href={portfolio.website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-4 py-2 bg-white/95 hover:bg-white text-gray-900 rounded-xl text-xs font-bold backdrop-blur-md shadow-lg border border-white/30 transition-all duration-300 hover:shadow-xl hover:scale-105"
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
                      <div className="relative h-48 bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 overflow-hidden">
                        {/* Pattern overlay */}
                        <div className="absolute inset-0 opacity-10">
                          <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
                            <defs>
                              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
                              </pattern>
                            </defs>
                            <rect width="100" height="100" fill="url(#grid)" />
                          </svg>
                        </div>
                        {/* Portfolio Badge */}
                        <div className="absolute top-4 right-4">
                          <span className="inline-flex items-center px-4 py-2 rounded-full text-xs font-bold bg-white/95 text-gray-900 backdrop-blur-md shadow-lg border border-white/30">
                            Portfolio
                          </span>
                        </div>
                        {/* Center content */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center text-white">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                              </svg>
                            </div>
                            <p className="text-sm font-medium opacity-90">Portfolio Preview</p>
                          </div>
                        </div>
                        {/* Visit Website Button */}
                        {portfolio.website_url && (
                          <div className="absolute bottom-4 left-4">
                            <a
                              href={portfolio.website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-4 py-2 bg-white/95 hover:bg-white text-gray-900 rounded-xl text-xs font-bold backdrop-blur-md shadow-lg border border-white/30 transition-all duration-300 hover:shadow-xl hover:scale-105"
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
                    <div className="relative p-6 pb-4">
                      <div className="flex items-start space-x-4 mb-5">
                        {/* Modern Avatar */}
                        <div className="flex-shrink-0 relative">
                          {portfolio.profile_image ? (
                            <div className="w-16 h-16 rounded-3xl overflow-hidden shadow-2xl group-hover:shadow-3xl transition-all duration-500 group-hover:scale-110 ring-2 ring-white/20 group-hover:ring-brand-300/30">
                              <Image
                                src={portfolio.profile_image || '/Portfolio.jpg'}
                                alt={`${portfolio.name} profile`}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
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
                            <div className="w-16 h-16 bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 rounded-3xl flex items-center justify-center shadow-2xl group-hover:shadow-3xl transition-all duration-500 group-hover:scale-110 ring-2 ring-white/20 group-hover:ring-brand-300/30">
                              <span className="text-white font-bold text-xl">
                                {portfolio.name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          {/* Modern Status Indicator */}
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-emerald-400 to-emerald-500 border-3 border-white rounded-full shadow-lg"></div>
                        </div>
                        
                        {/* Modern Profile Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-heading font-bold text-gray-900 mb-2 group-hover:text-brand-600 transition-colors duration-500 line-clamp-1">
                            {portfolio.title}
                          </h3>
                          <p className="text-gray-600 text-sm font-medium mb-3">
                            {portfolio.name}
                          </p>
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-brand-500 text-black border border-brand-600 shadow-sm">
                              {portfolio.job_title}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Modern Description */}
                      <div className="mb-6">
                        <p className="text-gray-700 line-clamp-3 leading-relaxed text-sm font-normal">
                          {portfolio.description}
                        </p>
                      </div>
                      
                      {/* Modern Skills Tags */}
                      <div className="mb-6">
                        <div className="flex flex-wrap gap-2">
                          {portfolio.skills &&
                            portfolio.skills.slice(0, 3).map((skill, index) => {
                              const colors = [
                                'bg-brand-500 text-black border-brand-600 shadow-lg',
                                'bg-emerald-500 text-white border-emerald-600 shadow-lg',
                                'bg-amber-500 text-white border-amber-600 shadow-lg',
                                'bg-rose-500 text-white border-rose-600 shadow-lg',
                                'bg-blue-500 text-white border-blue-600 shadow-lg',
                                'bg-purple-500 text-white border-purple-600 shadow-lg'
                              ];
                              const colorClass = colors[index % colors.length];
                              return (
                                <span
                                  key={index}
                                  className={`${colorClass} rounded-2xl px-4 py-2 text-xs font-semibold border group-hover:shadow-xl transition-all duration-300 group-hover:scale-105`}
                                >
                                  {skill}
                                </span>
                              );
                            })}
                          {portfolio.skills && portfolio.skills.length > 3 && (
                            <span className="bg-gradient-to-r from-gray-700 to-gray-800 text-white border border-gray-600 rounded-2xl px-4 py-2 text-xs font-bold shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                              +{portfolio.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Enhanced Social Links & Actions */}
                    <div className="relative px-6 pb-6">
                      <div className="flex items-center justify-between">
                        {/* Modern Social Links */}
                        <div className="flex items-center space-x-3">
                          {portfolio.github_url && (
                            <a
                              href={portfolio.github_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-3 text-gray-500 hover:text-white hover:bg-gray-800 rounded-2xl transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl border border-gray-200/50 hover:border-gray-700"
                              title="GitHub"
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                              </svg>
                            </a>
                          )}
                          {portfolio.linkedin_url && (
                            <a
                              href={portfolio.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-3 text-gray-500 hover:text-white hover:bg-blue-600 rounded-2xl transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl border border-gray-200/50 hover:border-blue-500"
                              title="LinkedIn"
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                              </svg>
                            </a>
                          )}
                          {portfolio.website_url && (
                            <a
                              href={portfolio.website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-3 text-gray-500 hover:text-white hover:bg-emerald-600 rounded-2xl transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl border border-gray-200/50 hover:border-emerald-500"
                              title="Website"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                              </svg>
                            </a>
                          )}
                        </div>
                        
                        {/* Modern View Profile Button */}
                        <Link
                          href={`/portfolio/${portfolio.id}`}
                          className="inline-flex items-center px-6 py-3 bg-brand-600 hover:bg-brand-700 text-black rounded-3xl font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 text-sm border-2 border-brand-500/30"
                        >
                          View Profile
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 ml-2"
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
            
            {/* View All Button */}
            {portfolios.length > 0 && (
              <div className="text-center mt-12">
                <Link
                  href="/search"
                  className="inline-flex items-center px-8 py-4 bg-brand-600 hover:bg-brand-700 text-black rounded-xl font-display font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  View All Portfolios
                  <svg className="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
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
