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
  }, [searchParams, performSearch]);

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
    <div className="min-h-screen bg-gradient-to-r from-gray-900 to-gray-800">
      <div className="w-full max-w-6xl mx-auto px-4 py-16 flex flex-col items-center">
        <div className="text-center mb-12">
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Find talented people by skills, expertise, or job title. Connect
            with professionals who can bring your projects to life.
          </p>
        </div>

        <div className="w-full max-w-2xl mb-8">
          <form onSubmit={handleSearch} className="relative mb-4">
            <input
              type="text"
              placeholder="Search by skill, expertise, or job title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg"
            >
              Search
            </button>
          </form>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-gray-300 hover:text-white flex items-center gap-2 group"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
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
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  {selectedSkills.length + selectedJobTitles.length}
                </span>
              )}
            </button>
            {(selectedSkills.length > 0 || selectedJobTitles.length > 0) && (
              <button
                onClick={clearFilters}
                className="text-gray-400 hover:text-gray-300 text-sm"
              >
                Clear all filters
              </button>
            )}
          </div>

          {showFilters && (
            <div className="mt-4 p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl space-y-4 relative z-50">
              {/* Skills Filter */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-300 mb-2">
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
                    <Listbox.Button className="relative w-full py-2 pl-3 pr-10 text-left bg-white/5 border border-white/10 rounded-lg cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent">
                      <span className="block truncate text-gray-300">
                        {selectedSkills.length === 0
                          ? "Select skills"
                          : `${selectedSkills.length} selected`}
                      </span>
                      <span className="absolute inset-y-0 right-0 flex items-center pr-2">
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
                      <Listbox.Options className="absolute z-[60] mt-1 max-h-60 w-full overflow-auto rounded-lg bg-gray-800 border border-white/10 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {availableSkills.length === 0 ? (
                          <div className="px-4 py-3 text-gray-400 text-sm">
                            No skills found in the database yet.
                          </div>
                        ) : (
                          availableSkills.map((skill) => (
                            <Listbox.Option
                              key={skill}
                              value={skill}
                              className={({ active }) =>
                                `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                  active
                                    ? "bg-blue-500/20 text-blue-300"
                                    : "text-gray-300"
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
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-400">
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
                        <div className="px-4 py-3 border-t border-white/10">
                          <p className="text-gray-400 text-sm">
                            Can&apos;t find a skill? Skills are added to our
                            database when portfolios are created. Create your
                            portfolio to add new skills.
                          </p>
                          <Link
                            href="/create-portfolio"
                            className="mt-2 inline-flex items-center text-sm text-blue-400 hover:text-blue-300"
                          >
                            <PlusIcon className="h-4 w-4 mr-1" />
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
                <label className="block text-sm font-medium text-gray-300 mb-2">
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
                    <Listbox.Button className="relative w-full py-2 pl-3 pr-10 text-left bg-white/5 border border-white/10 rounded-lg cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent">
                      <span className="block truncate text-gray-300">
                        {selectedJobTitles.length === 0
                          ? "Select job titles"
                          : `${selectedJobTitles.length} selected`}
                      </span>
                      <span className="absolute inset-y-0 right-0 flex items-center pr-2">
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
                      <Listbox.Options className="absolute z-[60] mt-1 max-h-60 w-full overflow-auto rounded-lg bg-gray-800 border border-white/10 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {availableJobTitles.length === 0 ? (
                          <div className="px-4 py-3 text-gray-400 text-sm">
                            No job titles found in the database yet.
                          </div>
                        ) : (
                          availableJobTitles.map((title) => (
                            <Listbox.Option
                              key={title}
                              value={title}
                              className={({ active }) =>
                                `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                  active
                                    ? "bg-blue-500/20 text-blue-300"
                                    : "text-gray-300"
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
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-400">
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
                        <div className="px-4 py-3 border-t border-white/10">
                          <p className="text-gray-400 text-sm">
                            Can&apos;t find a job title? Job titles are added
                            when portfolios are created. Create your portfolio
                            to add new ones.
                          </p>
                          <Link
                            href="/create-portfolio"
                            className="mt-2 inline-flex items-center text-sm text-blue-400 hover:text-blue-300"
                          >
                            <PlusIcon className="h-4 w-4 mr-1" />
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
                <div className="pt-4 border-t border-white/10">
                  <div className="flex flex-wrap gap-2">
                    {selectedSkills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center px-3 py-1 rounded-lg bg-blue-500/20 text-blue-300 text-sm border border-blue-500/20"
                      >
                        {skill}
                        <button
                          onClick={() => {
                            setSelectedSkills(
                              selectedSkills.filter((s) => s !== skill)
                            );
                            performSearch(searchQuery);
                          }}
                          className="ml-2 hover:text-blue-200"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </span>
                    ))}
                    {selectedJobTitles.map((title) => (
                      <span
                        key={title}
                        className="inline-flex items-center px-3 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-sm border border-purple-500/20"
                      >
                        {title}
                        <button
                          onClick={() => {
                            setSelectedJobTitles(
                              selectedJobTitles.filter((t) => t !== title)
                            );
                            performSearch(searchQuery);
                          }}
                          className="ml-2 hover:text-purple-200"
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

        {/* Portfolio grid container */}
        <div className="relative z-0">
          {loading ? (
            <div className="text-center py-12">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
              </div>
              <p className="mt-4 text-gray-300">Loading results...</p>
            </div>
          ) : hasSearched ? (
            <div className="w-full">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {searchQuery
                    ? `Results for "${searchQuery}"`
                    : "All Portfolios"}
                </h2>
                <p className="text-gray-400">
                  Found {portfolios.length} results
                </p>
              </div>

              {portfolios.length === 0 ? (
                <div className="text-center py-12 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No portfolios found
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Try a different search term or browse all portfolios
                  </p>
                  <Link
                    href="/create-portfolio"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl hover:opacity-90 transition-all duration-200 font-medium"
                  >
                    Create Your Portfolio
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {portfolios.map((portfolio) => (
                    <div
                      key={portfolio.id}
                      className="group bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-300 hover:shadow-lg"
                    >
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors duration-200">
                          {portfolio.title}
                        </h3>
                        <p className="text-gray-400 text-sm mb-3">
                          {portfolio.name} • {portfolio.job_title}
                        </p>
                        <p className="text-gray-300 mb-4 line-clamp-2">
                          {portfolio.description}
                        </p>
                        <div className="mb-4 flex flex-wrap gap-2">
                          {portfolio.skills &&
                            portfolio.skills.map((skill, index) => (
                              <span
                                key={index}
                                className="bg-white/10 text-gray-300 text-xs px-3 py-1 rounded-full hover:bg-white/20 transition-colors duration-200"
                              >
                                {skill}
                              </span>
                            ))}
                        </div>
                        <div className="flex justify-between items-center">
                          <Link
                            href={`/portfolio/${portfolio.id}`}
                            className="text-blue-400 hover:text-blue-300 font-medium flex items-center group/link"
                          >
                            View Profile
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 ml-1 transform transition-transform group-hover/link:translate-x-1"
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
                              className="text-gray-400 hover:text-gray-300 flex items-center"
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
    </div>
  );
}
