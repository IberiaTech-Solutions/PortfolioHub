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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative">
        <div className="max-w-4xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h1 className="text-6xl font-light text-gray-900 mb-6 tracking-tight">
              Find Your Next
              <br />
              <span className="font-normal text-gray-700">Collaboration</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-light">
              Connect with talented developers, designers, and creators. 
              Discover portfolios and build your next project together.
            </p>
          </div>

          {/* Search Section */}
          <div className="w-full max-w-2xl mx-auto mb-12">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by skill, expertise, or job title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 text-lg"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2 px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-md font-medium transition-colors duration-200"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Filter Toggle */}
            <div className="flex items-center justify-center mt-6">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                    clipRule="evenodd"
                  />
                </svg>
                Filters
                {(selectedSkills.length > 0 || selectedJobTitles.length > 0) && (
                  <span className="bg-gray-900 text-white text-xs px-2 py-1 rounded-full">
                    {selectedSkills.length + selectedJobTitles.length}
                  </span>
                )}
              </button>
              {(selectedSkills.length > 0 || selectedJobTitles.length > 0) && (
                <button
                  onClick={clearFilters}
                  className="ml-4 text-gray-400 hover:text-gray-600 text-sm transition-colors duration-200"
                >
                  Clear all
                </button>
              )}
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
      <div className="max-w-6xl mx-auto px-6 pb-24">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {portfolios.map((portfolio) => (
                  <div
                    key={portfolio.id}
                    className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200"
                  >
                    <div className="p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-2 group-hover:text-gray-700 transition-colors duration-200">
                        {portfolio.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        {portfolio.name} • {portfolio.job_title}
                      </p>
                      <p className="text-gray-700 mb-4 line-clamp-3 leading-relaxed">
                        {portfolio.description}
                      </p>
                      <div className="mb-4 flex flex-wrap gap-2">
                        {portfolio.skills &&
                          portfolio.skills.slice(0, 4).map((skill, index) => (
                            <span
                              key={index}
                              className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                            >
                              {skill}
                            </span>
                          ))}
                        {portfolio.skills && portfolio.skills.length > 4 && (
                          <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded">
                            +{portfolio.skills.length - 4} more
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <Link
                          href={`/portfolio/${portfolio.id}`}
                          className="text-gray-900 hover:text-gray-700 font-medium flex items-center transition-colors duration-200"
                        >
                          View Profile
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 ml-1 transform transition-transform group-hover:translate-x-1"
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
                            className="text-gray-500 hover:text-gray-700 flex items-center transition-colors duration-200"
                          >
                            Website
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

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
