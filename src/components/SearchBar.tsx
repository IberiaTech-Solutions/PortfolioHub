"use client";

import { useState, Fragment, useEffect } from "react";
import { Listbox, Transition } from "@headlessui/react";
import {
  ChevronDownIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: (query: string) => void;
  selectedSkills: string[];
  setSelectedSkills: (skills: string[]) => void;
  selectedJobTitles: string[];
  setSelectedJobTitles: (titles: string[]) => void;
  availableSkills: string[];
  availableJobTitles: string[];
  placeholderExamples: string[];
  currentPlaceholder: number;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  isSticky?: boolean;
  enableStickyBehavior?: boolean;
  availableRoles?: string[];
  availableExperience?: string[];
  availableLocations?: string[];
}

export default function SearchBar({
  searchQuery,
  setSearchQuery,
  onSearch,
  selectedSkills,
  setSelectedSkills,
  selectedJobTitles,
  setSelectedJobTitles,
  availableSkills,
  availableJobTitles,
  placeholderExamples,
  currentPlaceholder,
  showFilters,
  setShowFilters,
  isSticky = false,
  enableStickyBehavior = false,
  availableRoles = [],
  availableExperience = [],
  availableLocations = [],
}: SearchBarProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (!enableStickyBehavior) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 600);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [enableStickyBehavior]);
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
    
    // If search bar is not sticky, scroll to results section
    if (!shouldBeSticky) {
      setTimeout(() => {
        const resultsSection = document.getElementById('discover-talent');
        if (resultsSection) {
          resultsSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 100); // Small delay to ensure search results are rendered
    }
  };

  const shouldBeSticky = isSticky || (enableStickyBehavior && isScrolled);
  
  const containerClasses = shouldBeSticky 
    ? "fixed top-16 left-0 right-0 z-30 bg-slate-900/95 backdrop-blur-md transition-all duration-700 ease-out transform"
    : "transition-all duration-700 ease-out transform";

  const innerClasses = shouldBeSticky 
    ? "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-2 transition-all duration-500 ease-out"
    : "space-y-4 transition-all duration-500 ease-out";

  return (
    <div 
      className={containerClasses}
      style={{
        transform: shouldBeSticky ? 'translateY(0) scale(1)' : 'translateY(0) scale(1)',
        opacity: shouldBeSticky ? 1 : 1,
        backdropFilter: shouldBeSticky ? 'blur(12px)' : 'blur(8px)',
      }}
    >
      <div className={innerClasses}>
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
              className={`w-full pl-12 pr-32 border border-gray-300 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all duration-200 ${
                shouldBeSticky 
                  ? 'py-2 text-sm' 
                  : 'py-4 sm:py-5 text-base sm:text-xl'
              }`}
            />
            <button
              type="submit"
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl border border-slate-700 ${
                shouldBeSticky 
                  ? 'px-4 py-1 text-xs' 
                  : 'px-6 py-2 text-sm sm:text-base'
              }`}
            >
              Search
            </button>
          </div>

          {/* Filter Toggle Button */}
          <div className={`flex ${shouldBeSticky ? 'justify-start' : 'justify-center'} mb-4`}>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 text-white hover:text-gray-200 rounded-lg transition-all duration-200 ${
                shouldBeSticky 
                  ? 'px-3 py-1 text-xs w-full justify-center' 
                  : 'px-4 py-2 text-sm'
              }`}
            >
              <span>Advanced Filters</span>
              <svg 
                className={`w-4 h-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Collapsible Filter Row */}
          {showFilters && (
            <div className={`flex flex-col sm:flex-row gap-3 sm:gap-4 items-center animate-in slide-in-from-top-2 duration-200 ${
              shouldBeSticky ? 'w-full' : ''
            }`}>
            {/* Role Filter */}
            <div className="flex-1">
              <select
                value={selectedJobTitles.length > 0 ? selectedJobTitles[0] : ''}
                onChange={(e) => setSelectedJobTitles(e.target.value ? [e.target.value] : [])}
                className={`w-full px-4 border border-gray-300 rounded-lg text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all duration-200 ${
                  shouldBeSticky 
                    ? 'py-2 text-xs' 
                    : 'py-3 text-sm sm:text-base'
                }`}
              >
                <option value="">All Roles</option>
                {availableRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            {/* Experience Filter */}
            <div className="flex-1">
              <select
                className={`w-full px-4 border border-gray-300 rounded-lg text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all duration-200 ${
                  shouldBeSticky 
                    ? 'py-2 text-xs' 
                    : 'py-3 text-sm sm:text-base'
                }`}
              >
                <option value="">All Experience</option>
                {availableExperience.map((exp) => {
                  // Add descriptive text based on experience level
                  const getExperienceDescription = (level: string) => {
                    const lowerLevel = level.toLowerCase();
                    if (lowerLevel.includes('entry') || lowerLevel.includes('junior') || lowerLevel.includes('0-2')) {
                      return `${level} (0-2 years)`;
                    } else if (lowerLevel.includes('mid') || lowerLevel.includes('intermediate') || lowerLevel.includes('3-5')) {
                      return `${level} (3-5 years)`;
                    } else if (lowerLevel.includes('senior') || lowerLevel.includes('6+')) {
                      return `${level} (6+ years)`;
                    } else if (lowerLevel.includes('lead') || lowerLevel.includes('principal') || lowerLevel.includes('8+')) {
                      return `${level} (8+ years)`;
                    } else if (lowerLevel.includes('intern') || lowerLevel.includes('student')) {
                      return `${level} (Student/Intern)`;
                    }
                    return level; // Return as-is if no match
                  };
                  
                  return (
                    <option key={exp} value={exp}>
                      {getExperienceDescription(exp)}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Location Filter */}
            <div className="flex-1">
              <select
                className={`w-full px-4 border border-gray-300 rounded-lg text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all duration-200 ${
                  shouldBeSticky 
                    ? 'py-2 text-xs' 
                    : 'py-3 text-sm sm:text-base'
                }`}
              >
                <option value="">All Locations</option>
                {availableLocations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>

            </div>
          )}
        </form>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-6 p-6 bg-gray-50 border border-gray-200 rounded-lg space-y-6">
            {/* Skills Filter */}
            <div className="relative">
              <label className="block text-sm font-medium text-black mb-3">
                Skills
              </label>
              <Listbox
                value={selectedSkills}
                onChange={(value) => {
                  setSelectedSkills(value);
                  onSearch(searchQuery);
                }}
                multiple
              >
                <div className="relative">
                  <Listbox.Button className={`relative w-full pl-4 pr-10 text-left bg-transparent border border-gray-300 rounded-md cursor-default focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
                    shouldBeSticky 
                      ? 'py-2' 
                      : 'py-3'
                  }`}>
                    <span className={`block truncate text-black ${
                      shouldBeSticky 
                        ? 'text-xs' 
                        : 'text-sm'
                    }`}>
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
                        <div className="px-4 py-3 text-black text-sm">
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
                                  ? "bg-gray-100 text-black"
                                  : "text-black"
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
                                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-black">
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
              <label className="block text-sm font-medium text-black mb-3">
                Job Titles
              </label>
              <Listbox
                value={selectedJobTitles}
                onChange={(value) => {
                  setSelectedJobTitles(value);
                  onSearch(searchQuery);
                }}
                multiple
              >
                <div className="relative">
                  <Listbox.Button className={`relative w-full pl-4 pr-10 text-left bg-transparent border border-gray-300 rounded-md cursor-default focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
                    shouldBeSticky 
                      ? 'py-2' 
                      : 'py-3'
                  }`}>
                    <span className={`block truncate text-black ${
                      shouldBeSticky 
                        ? 'text-xs' 
                        : 'text-sm'
                    }`}>
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
                        <div className="px-4 py-3 text-black text-sm">
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
                                  ? "bg-gray-100 text-black"
                                  : "text-black"
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
                                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-black">
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
                <h3 className="text-sm font-medium text-black mb-3">Active Filters</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center px-3 py-1 rounded-full bg-white text-black text-sm"
                    >
                      {skill}
                      <button
                        onClick={() => {
                          setSelectedSkills(
                            selectedSkills.filter((s) => s !== skill)
                          );
                          onSearch(searchQuery);
                        }}
                        className="ml-2 hover:text-gray-200 transition-colors duration-200"
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
                          onSearch(searchQuery);
                        }}
                        className="ml-2 hover:text-gray-200 transition-colors duration-200"
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
  );
}
