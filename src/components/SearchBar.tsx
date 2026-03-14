"use client";

import { Fragment } from "react";
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
  enableStickyBehavior?: boolean;
  isSticky?: boolean;
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
  availableRoles = [],
  availableExperience = [],
  availableLocations = [],
}: SearchBarProps) {
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);

    setTimeout(() => {
      const resultsSection = document.getElementById('discover-talent');
      if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <div>
      <div className="space-y-3">
        <form onSubmit={handleSearch} className="space-y-3">
          {/* Search Input */}
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder={placeholderExamples[currentPlaceholder]}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-28 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-base"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl px-5 py-2 text-sm font-medium transition-colors"
            >
              Search
            </button>
          </div>

          {/* Filter Toggle */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
            >
              <span>Filters</span>
              <svg
                className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Inline Filters */}
          {showFilters && (
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <select
                value={selectedJobTitles.length > 0 ? selectedJobTitles[0] : ''}
                onChange={(e) => setSelectedJobTitles(e.target.value ? [e.target.value] : [])}
                className="flex-1 w-full px-3 py-2.5 border border-white/20 rounded-xl text-white text-sm bg-white/10 focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none cursor-pointer"
              >
                <option value="" className="bg-slate-800">All Roles</option>
                {availableRoles.map((role) => (
                  <option key={role} value={role} className="bg-slate-800">{role}</option>
                ))}
              </select>
              <select
                className="flex-1 w-full px-3 py-2.5 border border-white/20 rounded-xl text-white text-sm bg-white/10 focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none cursor-pointer"
              >
                <option value="" className="bg-slate-800">All Experience</option>
                {availableExperience.map((exp) => (
                  <option key={exp} value={exp} className="bg-slate-800">{exp}</option>
                ))}
              </select>
              <select
                className="flex-1 w-full px-3 py-2.5 border border-white/20 rounded-xl text-white text-sm bg-white/10 focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none cursor-pointer"
              >
                <option value="" className="bg-slate-800">All Locations</option>
                {availableLocations.map((loc) => (
                  <option key={loc} value={loc} className="bg-slate-800">{loc}</option>
                ))}
              </select>
            </div>
          )}
        </form>

        {/* Skills & Job Title Filters (expandable) */}
        {showFilters && (
          <div className="p-5 bg-white/5 border border-white/10 rounded-xl space-y-4">
            {/* Skills Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Skills</label>
              <Listbox
                value={selectedSkills}
                onChange={(value) => { setSelectedSkills(value); onSearch(searchQuery); }}
                multiple
              >
                <div className="relative">
                  <Listbox.Button className="relative w-full pl-3 pr-10 py-2.5 text-left bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500">
                    <span className="block truncate">
                      {selectedSkills.length === 0 ? "Select skills" : `${selectedSkills.length} selected`}
                    </span>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                    </span>
                  </Listbox.Button>
                  <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Listbox.Options className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-lg bg-slate-800 border border-slate-700 py-1 text-sm shadow-xl">
                      {availableSkills.length === 0 ? (
                        <div className="px-3 py-2 text-gray-500 text-sm">No skills found</div>
                      ) : (
                        availableSkills.map((skill) => (
                          <Listbox.Option
                            key={skill}
                            value={skill}
                            className={({ active }: { active: boolean }) =>
                              `cursor-pointer select-none py-2 pl-8 pr-3 ${active ? "bg-white/10 text-white" : "text-gray-300"}`
                            }
                          >
                            {({ selected }: { selected: boolean }) => (
                              <>
                                <span className={selected ? "font-medium" : ""}>{skill}</span>
                                {selected && (
                                  <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-brand-400">
                                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </span>
                                )}
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
            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Job Titles</label>
              <Listbox
                value={selectedJobTitles}
                onChange={(value) => { setSelectedJobTitles(value); onSearch(searchQuery); }}
                multiple
              >
                <div className="relative">
                  <Listbox.Button className="relative w-full pl-3 pr-10 py-2.5 text-left bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500">
                    <span className="block truncate">
                      {selectedJobTitles.length === 0 ? "Select job titles" : `${selectedJobTitles.length} selected`}
                    </span>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                    </span>
                  </Listbox.Button>
                  <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Listbox.Options className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-lg bg-slate-800 border border-slate-700 py-1 text-sm shadow-xl">
                      {availableJobTitles.length === 0 ? (
                        <div className="px-3 py-2 text-gray-500 text-sm">No job titles found</div>
                      ) : (
                        availableJobTitles.map((title) => (
                          <Listbox.Option
                            key={title}
                            value={title}
                            className={({ active }: { active: boolean }) =>
                              `cursor-pointer select-none py-2 pl-8 pr-3 ${active ? "bg-white/10 text-white" : "text-gray-300"}`
                            }
                          >
                            {({ selected }: { selected: boolean }) => (
                              <>
                                <span className={selected ? "font-medium" : ""}>{title}</span>
                                {selected && (
                                  <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-brand-400">
                                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </span>
                                )}
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

            {/* Active Filters */}
            {(selectedSkills.length > 0 || selectedJobTitles.length > 0) && (
              <div className="pt-3 border-t border-white/10">
                <div className="flex flex-wrap gap-2">
                  {selectedSkills.map((skill) => (
                    <span key={skill} className="inline-flex items-center px-2.5 py-1 rounded-lg bg-brand-500/15 text-brand-300 text-xs font-medium">
                      {skill}
                      <button onClick={() => { setSelectedSkills(selectedSkills.filter((s) => s !== skill)); onSearch(searchQuery); }} className="ml-1.5 hover:text-white">
                        <XMarkIcon className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                  {selectedJobTitles.map((title) => (
                    <span key={title} className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white/10 text-gray-300 text-xs font-medium">
                      {title}
                      <button onClick={() => { setSelectedJobTitles(selectedJobTitles.filter((t) => t !== title)); onSearch(searchQuery); }} className="ml-1.5 hover:text-white">
                        <XMarkIcon className="h-3.5 w-3.5" />
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
