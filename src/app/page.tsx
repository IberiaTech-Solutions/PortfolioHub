"use client";

import { useEffect, useState, Fragment, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/utils/supabase";
import { Listbox, Transition } from "@headlessui/react";
import {
  ChevronDownIcon,
  XMarkIcon,
  PlusIcon,
} from "@heroicons/react/20/solid";

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
  const [showFilters, setShowFilters] = useState(false);
  const [currentSearchExample, setCurrentSearchExample] = useState(0);
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);

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

  useEffect(() => {
    // Fetch available skills and job titles
    const fetchFilterOptions = async () => {
      const { data: portfoliosData } = await supabase
        .from("portfolios")
        .select("skills, job_title");

      if (portfoliosData) {
        // Extract unique skills
        const skills = new Set<string>();
        portfoliosData.forEach((portfolio) => {
          if (portfolio.skills) {
            portfolio.skills.forEach((skill: string) => skills.add(skill));
          }
        });
        setAvailableSkills(Array.from(skills).sort());

        // Extract unique job titles
        const jobTitles = new Set<string>();
        portfoliosData.forEach((portfolio) => {
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const newUrl = searchQuery ? `/?q=${encodeURIComponent(searchQuery)}` : "/";
    window.history.pushState({}, "", newUrl);
    performSearch(searchQuery);
  };

  const performSearch = async (query: string) => {
    setLoading(true);
    setHasSearched(true);

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
              Find Your Next
              <br />
              <span className="font-light text-slate-200">Collaboration</span>
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl font-body text-brand-300 max-w-3xl mx-auto leading-relaxed font-light mb-8 sm:mb-12 px-4">
              The global community for developers and designers to showcase, connect, and collaborate.
            </p>
            
            {/* Interactive Search Prompt */}
            <div className="mb-8 sm:mb-12">
              <div className="inline-flex items-center space-x-2 text-slate-300 text-sm sm:text-base">
                <span>Try searching for:</span>
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
            <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-2xl">
              <form onSubmit={handleSearch} className="space-y-4">
                {/* Main Search Bar */}
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder={placeholderExamples[currentPlaceholder]}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-32 py-4 sm:py-5 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all duration-200 text-base sm:text-xl shadow-lg"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-2 px-6 py-2 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white rounded-lg font-medium transition-all duration-200 text-sm sm:text-base shadow-lg hover:shadow-xl"
                  >
                    Search
                  </button>
                </div>

                {/* Filter Row */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center">
                  {/* Role Filter */}
                  <div className="flex-1">
                    <select
                      value={selectedJobTitles.length > 0 ? selectedJobTitles[0] : ''}
                      onChange={(e) => setSelectedJobTitles(e.target.value ? [e.target.value] : [])}
                      className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base shadow-sm"
                    >
                      <option value="">All Roles</option>
                      <option value="Frontend Developer">Frontend Developer</option>
                      <option value="Backend Developer">Backend Developer</option>
                      <option value="Full-Stack Developer">Full-Stack Developer</option>
                      <option value="UI/UX Designer">UI/UX Designer</option>
                      <option value="DevOps Engineer">DevOps Engineer</option>
                      <option value="Data Scientist">Data Scientist</option>
                      <option value="Mobile Developer">Mobile Developer</option>
                      <option value="Product Manager">Product Manager</option>
                    </select>
                  </div>

                  {/* Experience Filter */}
                  <div className="flex-1">
                    <select
                      className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base shadow-sm"
                    >
                      <option value="">All Experience</option>
                      <option value="entry">Entry Level (0-2 years)</option>
                      <option value="mid">Mid Level (3-5 years)</option>
                      <option value="senior">Senior Level (6+ years)</option>
                      <option value="lead">Lead/Principal (8+ years)</option>
                    </select>
                  </div>

                  {/* Location Filter */}
                  <div className="flex-1">
                    <select
                      className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base shadow-sm"
                    >
                      <option value="">All Locations</option>
                      <option value="remote">Remote</option>
                      <option value="us">United States</option>
                      <option value="europe">Europe</option>
                      <option value="asia">Asia</option>
                      <option value="australia">Australia</option>
                    </select>
                  </div>

                  {/* Advanced Filters Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center px-4 py-3 bg-white/70 hover:bg-white/90 border border-gray-200 rounded-lg text-gray-700 transition-all duration-200 text-sm sm:text-base shadow-sm backdrop-blur-sm"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    Filters
                    {getActiveFilterCount() > 0 && (
                      <span className="ml-2 px-2 py-1 bg-brand-600 text-white text-xs rounded-full">
                        {getActiveFilterCount()}
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>


            {/* Filters Panel */}
            {showFilters && (
              <div className="mt-6 p-6 bg-gray-50 border border-gray-200 rounded-lg space-y-6">
                {/* Skills Filter */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Skills
                  </label>
                  <Listbox
                    value={selectedSkills}
                    onChange={(value) => {
                      setSelectedSkills(value);
                      performSearch(searchQuery);
                    }}
                    multiple
                  >
                    <div className="relative">
                      <Listbox.Button className="relative w-full py-3 pl-4 pr-10 text-left bg-white border border-gray-200 rounded-md cursor-default focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent">
                        <span className="block truncate text-gray-900">
                          {selectedSkills.length === 0
                            ? "Select skills"
                            : `${selectedSkills.length} selected`}
                        </span>
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <ChevronDownIcon
                            className="h-5 w-5 text-gray-400"
                            aria-hidden="true"
                          />
                        </span>
                      </Listbox.Button>
                      <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                      >
                        <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white border border-gray-200 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                          {availableSkills.length === 0 ? (
                            <div className="px-4 py-3 text-gray-500 text-sm">
                              No skills found yet.
                            </div>
                          ) : (
                            availableSkills.map((skill) => (
                              <Listbox.Option
                                key={skill}
                                value={skill}
                                className={({ active }) =>
                                  `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                    active
                                      ? "bg-gray-100 text-gray-900"
                                      : "text-gray-900"
                                  }`
                                }
                              >
                                {({ selected }) => (
                                  <>
                                    <span
                                      className={`block truncate ${
                                        selected ? "font-medium" : "font-normal"
                                      }`}
                                    >
                                      {skill}
                                    </span>
                                    {selected ? (
                                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-900">
                                        <svg
                                          className="h-5 w-5"
                                          viewBox="0 0 20 20"
                                          fill="currentColor"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                          />
                                        </svg>
                                      </span>
                                    ) : null}
                                  </>
                                )}
                              </Listbox.Option>
                            ))
                          )}
                        </Listbox.Options>
                      </Transition>
                    </div>
                  </Listbox>
                </div>

                {/* Job Titles Filter */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Job Titles
                  </label>
                  <Listbox
                    value={selectedJobTitles}
                    onChange={(value) => {
                      setSelectedJobTitles(value);
                      performSearch(searchQuery);
                    }}
                    multiple
                  >
                    <div className="relative">
                      <Listbox.Button className="relative w-full py-3 pl-4 pr-10 text-left bg-white border border-gray-200 rounded-md cursor-default focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent">
                        <span className="block truncate text-gray-900">
                          {selectedJobTitles.length === 0
                            ? "Select job titles"
                            : `${selectedJobTitles.length} selected`}
                        </span>
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <ChevronDownIcon
                            className="h-5 w-5 text-gray-400"
                            aria-hidden="true"
                          />
                        </span>
                      </Listbox.Button>
                      <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                      >
                        <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white border border-gray-200 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                          {availableJobTitles.length === 0 ? (
                            <div className="px-4 py-3 text-gray-500 text-sm">
                              No job titles found yet.
                            </div>
                          ) : (
                            availableJobTitles.map((title) => (
                              <Listbox.Option
                                key={title}
                                value={title}
                                className={({ active }) =>
                                  `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                    active
                                      ? "bg-gray-100 text-gray-900"
                                      : "text-gray-900"
                                  }`
                                }
                              >
                                {({ selected }) => (
                                  <>
                                    <span
                                      className={`block truncate ${
                                        selected ? "font-medium" : "font-normal"
                                      }`}
                                    >
                                      {title}
                                    </span>
                                    {selected ? (
                                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-900">
                                        <svg
                                          className="h-5 w-5"
                                          viewBox="0 0 20 20"
                                          fill="currentColor"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                          />
                                        </svg>
                                      </span>
                                    ) : null}
                                  </>
                                )}
                              </Listbox.Option>
                            ))
                          )}
                        </Listbox.Options>
                      </Transition>
                    </div>
                  </Listbox>
                </div>

                {/* Selected Filters Display */}
                {(selectedSkills.length > 0 || selectedJobTitles.length > 0) && (
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Active Filters</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedSkills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center px-3 py-1 rounded-full bg-gray-900 text-white text-sm"
                        >
                          {skill}
                          <button
                            onClick={() => {
                              setSelectedSkills(
                                selectedSkills.filter((s) => s !== skill)
                              );
                              performSearch(searchQuery);
                            }}
                            className="ml-2 hover:text-gray-300 transition-colors duration-200"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </span>
                      ))}
                      {selectedJobTitles.map((title) => (
                        <span
                          key={title}
                          className="inline-flex items-center px-3 py-1 rounded-full bg-gray-700 text-white text-sm"
                        >
                          {title}
                          <button
                            onClick={() => {
                              setSelectedJobTitles(
                                selectedJobTitles.filter((t) => t !== title)
                              );
                              performSearch(searchQuery);
                            }}
                            className="ml-2 hover:text-gray-300 transition-colors duration-200"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Section */}
      {/* Main Content Section */}
      <div className="bg-gray-50 py-12 sm:py-16 lg:py-20">
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
                    className="group relative bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-[1.02] hover:border-brand-200/50"
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
                          <img
                            src={portfolio.hero_image}
                            alt={`${portfolio.title} portfolio hero`}
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
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white text-gray-900 backdrop-blur-sm shadow-md">
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
                              className="inline-flex items-center px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-900 rounded-lg text-xs font-bold backdrop-blur-sm shadow-md transition-all duration-200 hover:shadow-lg"
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              Visit Site
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
                          <img
                            src={portfolio.website_screenshot}
                            alt={`${portfolio.title} portfolio screenshot`}
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
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white text-gray-900 backdrop-blur-sm shadow-md">
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
                              className="inline-flex items-center px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-900 rounded-lg text-xs font-bold backdrop-blur-sm shadow-md transition-all duration-200 hover:shadow-lg"
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              Visit Site
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
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white text-gray-900 backdrop-blur-sm shadow-md">
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
                              className="inline-flex items-center px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-900 rounded-lg text-xs font-bold backdrop-blur-sm shadow-md transition-all duration-200 hover:shadow-lg"
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              Visit Site
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-50/30 via-transparent to-emerald-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                    
                    {/* Profile Header */}
                    <div className="relative p-6 pb-4">
                      <div className="flex items-start space-x-4 mb-5">
                        {/* Enhanced Avatar */}
                        <div className="flex-shrink-0 relative">
                          {portfolio.profile_image ? (
                            <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110">
                              <img
                                src={portfolio.profile_image}
                                alt={`${portfolio.name} profile`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                              {/* Fallback gradient */}
                              <div className="hidden w-full h-full bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 flex items-center justify-center">
                                <span className="text-white font-bold text-lg">
                                  {portfolio.name?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="w-14 h-14 bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110">
                              <span className="text-white font-bold text-lg">
                                {portfolio.name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          {/* Status Indicator */}
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
                        </div>
                        
                        {/* Enhanced Profile Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-heading font-bold text-gray-900 mb-1 group-hover:text-brand-600 transition-colors duration-300 line-clamp-1">
                            {portfolio.title}
                          </h3>
                          <p className="text-gray-700 text-sm font-semibold mb-1">
                            {portfolio.name}
                          </p>
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-100 text-brand-800 border border-brand-200">
                              {portfolio.job_title}
                            </span>
                            <span className="text-xs text-gray-500 font-medium">
                              Available
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Enhanced Description */}
                      <div className="mb-5">
                        <p className="text-gray-800 line-clamp-3 leading-relaxed text-sm font-medium">
                          {portfolio.description}
                        </p>
                      </div>
                      
                      {/* Enhanced Skills Tags */}
                      <div className="mb-6">
                        <div className="flex flex-wrap gap-2">
                          {portfolio.skills &&
                            portfolio.skills.slice(0, 3).map((skill, index) => {
                              const colors = [
                                'bg-gradient-to-r from-brand-500 to-brand-600 text-white border-brand-600',
                                'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-emerald-600',
                                'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-600',
                                'bg-gradient-to-r from-rose-500 to-rose-600 text-white border-rose-600',
                                'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-600',
                                'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-600'
                              ];
                              const colorClass = colors[index % colors.length];
                              return (
                                <span
                                  key={index}
                                  className={`${colorClass} rounded-xl px-3 py-1.5 text-xs font-semibold border shadow-sm group-hover:shadow-md transition-all duration-200`}
                                >
                                  {skill}
                                </span>
                              );
                            })}
                          {portfolio.skills && portfolio.skills.length > 3 && (
                            <span className="bg-gradient-to-r from-gray-800 to-gray-900 text-white border border-gray-800 rounded-xl px-3 py-1.5 text-xs font-bold shadow-md">
                              +{portfolio.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Enhanced Social Links & Actions */}
                    <div className="relative px-6 pb-6">
                      <div className="flex items-center justify-between">
                        {/* Enhanced Social Links */}
                        <div className="flex items-center space-x-2">
                          {portfolio.github_url && (
                            <a
                              href={portfolio.github_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2.5 text-gray-600 hover:text-white hover:bg-gray-800 rounded-xl transition-all duration-200 hover:scale-110 shadow-md hover:shadow-lg"
                              title="GitHub"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                              </svg>
                            </a>
                          )}
                          {portfolio.linkedin_url && (
                            <a
                              href={portfolio.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2.5 text-gray-600 hover:text-white hover:bg-blue-600 rounded-xl transition-all duration-200 hover:scale-110 shadow-md hover:shadow-lg"
                              title="LinkedIn"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                              </svg>
                            </a>
                          )}
                          {portfolio.website_url && (
                            <a
                              href={portfolio.website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2.5 text-gray-600 hover:text-white hover:bg-emerald-600 rounded-xl transition-all duration-200 hover:scale-110 shadow-md hover:shadow-lg"
                              title="Website"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                              </svg>
                            </a>
                          )}
                        </div>
                        
                        {/* Enhanced View Profile Button */}
                        <Link
                          href={`/portfolio/${portfolio.id}`}
                          className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-black rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 text-sm"
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
                  className="inline-flex items-center px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-display font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
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
