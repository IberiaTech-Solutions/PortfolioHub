"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/utils/supabase";
import { Fragment } from "react";
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
  github_url: string;
  linkedin_url: string;
  skills: string[];
  job_title: string;
  created_at: string;
  name: string;
};

export default function Home() {
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

  const clearFilters = () => {
    setSelectedSkills([]);
    setSelectedJobTitles([]);
    performSearch(searchQuery);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent leading-tight">
              Find Your Next
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Collaboration
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Connect with talented developers, designers, and creators. 
              Discover amazing portfolios and build your next project together.
            </p>
          </div>

          {/* Search Section */}
          <div className="w-full max-w-3xl mx-auto mb-12">
            <form onSubmit={handleSearch} className="relative group">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by skill, expertise, or job title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-8 py-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-400 transition-all duration-300 text-lg shadow-2xl"
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                <button
                  type="submit"
                  className="absolute right-3 top-3 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Filter Toggle */}
            <div className="flex items-center justify-center mt-6">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-gray-300 hover:text-white hover:bg-white/20 transition-all duration-300 group"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 group-hover:rotate-180 transition-transform duration-300"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                    clipRule="evenodd"
                  />
                </svg>
                Advanced Filters
                {(selectedSkills.length > 0 || selectedJobTitles.length > 0) && (
                  <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm px-3 py-1 rounded-full font-medium">
                    {selectedSkills.length + selectedJobTitles.length}
                  </span>
                )}
              </button>
              {(selectedSkills.length > 0 || selectedJobTitles.length > 0) && (
                <button
                  onClick={clearFilters}
                  className="ml-4 text-gray-400 hover:text-gray-300 text-sm font-medium transition-colors duration-200"
                >
                  Clear all filters
                </button>
              )}
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="mt-8 p-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl space-y-6 relative z-50 shadow-2xl">
                {/* Skills Filter */}
                <div className="relative">
                  <label className="block text-lg font-semibold text-white mb-4">
                    Filter by Skills
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
                      <Listbox.Button className="relative w-full py-4 pl-6 pr-12 text-left bg-white/10 border border-white/20 rounded-xl cursor-default focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/30 focus-visible:border-blue-400 transition-all duration-300">
                        <span className="block truncate text-gray-200 text-lg">
                          {selectedSkills.length === 0
                            ? "Select skills to filter by"
                            : `${selectedSkills.length} skill${selectedSkills.length > 1 ? 's' : ''} selected`}
                        </span>
                        <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                          <ChevronDownIcon
                            className="h-6 w-6 text-gray-400"
                            aria-hidden="true"
                          />
                        </span>
                      </Listbox.Button>
                      <Transition
                        as={Fragment}
                        leave="transition ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                      >
                        <Listbox.Options className="absolute z-[60] mt-2 max-h-60 w-full overflow-auto rounded-xl bg-gray-800/95 backdrop-blur-xl border border-white/20 py-2 text-base shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                          {availableSkills.length === 0 ? (
                            <div className="px-6 py-4 text-gray-400 text-sm">
                              No skills found in the database yet.
                            </div>
                          ) : (
                            availableSkills.map((skill) => (
                              <Listbox.Option
                                key={skill}
                                value={skill}
                                className={({ active }) =>
                                  `relative cursor-default select-none py-3 pl-10 pr-4 ${
                                    active
                                      ? "bg-blue-500/20 text-blue-300"
                                      : "text-gray-300"
                                  }`
                                }
                              >
                                {({ selected }) => (
                                  <>
                                    <span
                                      className={`block truncate text-lg ${
                                        selected ? "font-semibold" : "font-normal"
                                      }`}
                                    >
                                      {skill}
                                    </span>
                                    {selected ? (
                                      <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-blue-400">
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
                          <div className="px-6 py-4 border-t border-white/10">
                            <p className="text-gray-400 text-sm mb-3">
                              Can&apos;t find a skill? Skills are added to our
                              database when portfolios are created.
                            </p>
                            <Link
                              href="/create-portfolio"
                              className="inline-flex items-center text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200"
                            >
                              <PlusIcon className="h-4 w-4 mr-2" />
                              Create Portfolio
                            </Link>
                          </div>
                        </Listbox.Options>
                      </Transition>
                    </div>
                  </Listbox>
                </div>

                {/* Job Titles Filter */}
                <div className="relative">
                  <label className="block text-lg font-semibold text-white mb-4">
                    Filter by Job Title
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
                      <Listbox.Button className="relative w-full py-4 pl-6 pr-12 text-left bg-white/10 border border-white/20 rounded-xl cursor-default focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-500/30 focus-visible:border-purple-400 transition-all duration-300">
                        <span className="block truncate text-gray-200 text-lg">
                          {selectedJobTitles.length === 0
                            ? "Select job titles to filter by"
                            : `${selectedJobTitles.length} job title${selectedJobTitles.length > 1 ? 's' : ''} selected`}
                        </span>
                        <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                          <ChevronDownIcon
                            className="h-6 w-6 text-gray-400"
                            aria-hidden="true"
                          />
                        </span>
                      </Listbox.Button>
                      <Transition
                        as={Fragment}
                        leave="transition ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                      >
                        <Listbox.Options className="absolute z-[60] mt-2 max-h-60 w-full overflow-auto rounded-xl bg-gray-800/95 backdrop-blur-xl border border-white/20 py-2 text-base shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                          {availableJobTitles.length === 0 ? (
                            <div className="px-6 py-4 text-gray-400 text-sm">
                              No job titles found in the database yet.
                            </div>
                          ) : (
                            availableJobTitles.map((title) => (
                              <Listbox.Option
                                key={title}
                                value={title}
                                className={({ active }) =>
                                  `relative cursor-default select-none py-3 pl-10 pr-4 ${
                                    active
                                      ? "bg-purple-500/20 text-purple-300"
                                      : "text-gray-300"
                                  }`
                                }
                              >
                                {({ selected }) => (
                                  <>
                                    <span
                                      className={`block truncate text-lg ${
                                        selected ? "font-semibold" : "font-normal"
                                      }`}
                                    >
                                      {title}
                                    </span>
                                    {selected ? (
                                      <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-purple-400">
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
                          <div className="px-6 py-4 border-t border-white/10">
                            <p className="text-gray-400 text-sm mb-3">
                              Can&apos;t find a job title? Job titles are added
                              when portfolios are created.
                            </p>
                            <Link
                              href="/create-portfolio"
                              className="inline-flex items-center text-sm text-purple-400 hover:text-purple-300 font-medium transition-colors duration-200"
                            >
                              <PlusIcon className="h-4 w-4 mr-2" />
                              Create Portfolio
                            </Link>
                          </div>
                        </Listbox.Options>
                      </Transition>
                    </div>
                  </Listbox>
                </div>

                {/* Selected Filters Display */}
                {(selectedSkills.length > 0 || selectedJobTitles.length > 0) && (
                  <div className="pt-6 border-t border-white/20">
                    <h3 className="text-lg font-semibold text-white mb-4">Active Filters</h3>
                    <div className="flex flex-wrap gap-3">
                      {selectedSkills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center px-4 py-2 rounded-xl bg-blue-500/20 text-blue-300 text-sm border border-blue-500/30 backdrop-blur-sm"
                        >
                          {skill}
                          <button
                            onClick={() => {
                              setSelectedSkills(
                                selectedSkills.filter((s) => s !== skill)
                              );
                              performSearch(searchQuery);
                            }}
                            className="ml-2 hover:text-blue-200 transition-colors duration-200"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </span>
                      ))}
                      {selectedJobTitles.map((title) => (
                        <span
                          key={title}
                          className="inline-flex items-center px-4 py-2 rounded-xl bg-purple-500/20 text-purple-300 text-sm border border-purple-500/30 backdrop-blur-sm"
                        >
                          {title}
                          <button
                            onClick={() => {
                              setSelectedJobTitles(
                                selectedJobTitles.filter((t) => t !== title)
                              );
                              performSearch(searchQuery);
                            }}
                            className="ml-2 hover:text-purple-200 transition-colors duration-200"
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
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 pb-20">
        {loading ? (
          <div className="text-center py-20">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-4 h-4 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-4 h-4 bg-pink-500 rounded-full animate-bounce"></div>
            </div>
            <p className="text-xl text-gray-300 font-medium">Discovering amazing portfolios...</p>
          </div>
        ) : hasSearched ? (
          <div className="w-full">
            <div className="mb-12 text-center">
              <h2 className="text-4xl font-bold text-white mb-4">
                {searchQuery
                  ? `Results for "${searchQuery}"`
                  : "Featured Portfolios"}
              </h2>
              <p className="text-xl text-gray-400">
                Found {portfolios.length} amazing {portfolios.length === 1 ? 'portfolio' : 'portfolios'}
              </p>
            </div>

            {portfolios.length === 0 ? (
              <div className="text-center py-20 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl">
                <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  No portfolios found
                </h3>
                <p className="text-gray-400 mb-8 text-lg max-w-md mx-auto">
                  Try a different search term or browse all portfolios to discover amazing talent
                </p>
                <Link
                  href="/create-portfolio"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Create Your Portfolio
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {portfolios.map((portfolio) => (
                  <div
                    key={portfolio.id}
                    className="group bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden hover:border-white/40 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
                  >
                    <div className="p-8">
                      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors duration-300">
                        {portfolio.title}
                      </h3>
                      <p className="text-gray-400 text-sm mb-4 font-medium">
                        {portfolio.name} • {portfolio.job_title}
                      </p>
                      <p className="text-gray-300 mb-6 line-clamp-3 leading-relaxed">
                        {portfolio.description}
                      </p>
                      <div className="mb-6 flex flex-wrap gap-2">
                        {portfolio.skills &&
                          portfolio.skills.slice(0, 4).map((skill, index) => (
                            <span
                              key={index}
                              className="bg-white/10 text-gray-300 text-sm px-3 py-1 rounded-lg hover:bg-white/20 transition-colors duration-200"
                            >
                              {skill}
                            </span>
                          ))}
                        {portfolio.skills && portfolio.skills.length > 4 && (
                          <span className="bg-white/10 text-gray-400 text-sm px-3 py-1 rounded-lg">
                            +{portfolio.skills.length - 4} more
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <Link
                          href={`/portfolio/${portfolio.id}`}
                          className="text-blue-400 hover:text-blue-300 font-semibold flex items-center group/link transition-colors duration-200"
                        >
                          View Profile
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 ml-2 transform transition-transform group-hover/link:translate-x-1"
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
                        {portfolio.website_url && (
                          <a
                            href={portfolio.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-gray-300 flex items-center transition-colors duration-200"
                          >
                            Visit Website
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 ml-1"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </a>
                        )}
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
  );
}
