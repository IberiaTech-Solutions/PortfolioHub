"use client";

import { Fragment } from "react";
import { Combobox, Transition } from "@headlessui/react";
import {
  CheckIcon,
  ChevronUpDownIcon,
  XMarkIcon,
  SparklesIcon,
} from "@heroicons/react/20/solid";
import dynamic from "next/dynamic";

const ProjectCards = dynamic(() => import("@/components/ProjectCards"), {
  loading: () => <div className="animate-pulse bg-gray-200 rounded-lg h-32"></div>,
  ssr: false,
});

import { Project, Skill } from "@/types";

interface StepSkillsLinksProps {
  formData: {
    website_url: string;
    github_url: string;
    linkedin_url: string;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setFormData: (fn: (prev: any) => any) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  selectedSkills: string[];
  setSelectedSkills: (fn: (prev: string[]) => string[]) => void;
  query: string;
  setQuery: (q: string) => void;
  filteredSkills: Skill[];
  isAddingSkill: boolean;
  setIsAddingSkill: (v: boolean) => void;
  newSkill: { name: string; category: string };
  setNewSkill: (s: { name: string; category: string }) => void;
  categories: string[];
  handleAddNewSkill: (e: React.FormEvent) => void;
  loading: boolean;
  debouncedDetectProjects: (githubUrl: string, websiteUrl: string) => void;
  debouncedGenerateScreenshot: (url: string) => void;
  detectedProjects: Project[];
  detectingProjects: boolean;
  removeProject: (index: number) => void;
}

export default function StepSkillsLinks({
  formData,
  setFormData,
  handleChange,
  selectedSkills,
  setSelectedSkills,
  query,
  setQuery,
  filteredSkills,
  isAddingSkill,
  setIsAddingSkill,
  newSkill,
  setNewSkill,
  categories,
  handleAddNewSkill,
  loading,
  debouncedDetectProjects,
  debouncedGenerateScreenshot,
  detectedProjects,
  detectingProjects,
  removeProject,
}: StepSkillsLinksProps) {
  const AddSkillModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={(e) => e.stopPropagation()}>
      <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md shadow-xl border border-slate-600" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-semibold text-white mb-4">Add New Skill</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-white text-sm font-medium mb-2">Skill Name</label>
            <input
              type="text"
              value={newSkill.name}
              onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
              className="w-full px-4 py-2 border border-white/20 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white/10"
              placeholder="Enter skill name"
            />
          </div>
          <div>
            <label className="block text-white text-sm font-medium mb-2">Category</label>
            <select
              value={newSkill.category}
              onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
              className="w-full px-4 py-2 border border-white/20 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white/10"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={() => { setIsAddingSkill(false); setNewSkill({ name: "", category: "" }); }} className="px-4 py-2 text-gray-300 hover:text-white transition-colors duration-200">
              Cancel
            </button>
            <button type="button" onClick={handleAddNewSkill} disabled={loading || !newSkill.name || !newSkill.category} className="px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors duration-200 disabled:opacity-50">
              {loading ? "Adding..." : "Add Skill"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Skills */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">Skills</label>
        <div className="relative">
          <Combobox value={selectedSkills} onChange={(v) => setSelectedSkills(() => v)} multiple>
            <div className="relative">
              <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white/10 border border-white/20 text-left focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500 transition-all duration-200">
                <div className="flex flex-wrap gap-2 p-3">
                  {selectedSkills.map((skill) => (
                    <span key={skill} className="inline-flex items-center px-3 py-1.5 rounded bg-white/10 text-white text-sm font-medium border border-white/20 hover:bg-white/20 transition-colors duration-200">
                      {skill}
                      <button type="button" onClick={() => setSelectedSkills((prev) => prev.filter((s) => s !== skill))} className="ml-2 hover:text-gray-300 focus:outline-none">
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </span>
                  ))}
                  <Combobox.Input
                    className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-white bg-transparent focus:ring-0 focus:outline-none placeholder-gray-500"
                    displayValue={() => ""}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={selectedSkills.length > 0 ? "Add more skills..." : "Search or add skills..."}
                  />
                  <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronUpDownIcon className="h-5 w-5 text-gray-300" aria-hidden="true" />
                  </Combobox.Button>
                </div>
                <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0" afterLeave={() => setQuery("")}>
                  <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-slate-800 border border-white/20 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {filteredSkills.length === 0 && query !== "" ? (
                      <div className="px-4 py-3 border-b border-white/20">
                        <p className="text-gray-300 mb-2">No matching skills found.</p>
                        <button type="button" onClick={() => setIsAddingSkill(true)} className="px-3 py-1 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors text-sm">
                          Add &quot;{query}&quot; as new skill
                        </button>
                      </div>
                    ) : (
                      Object.entries(
                        filteredSkills.reduce((acc, skill) => {
                          if (!acc[skill.category]) acc[skill.category] = [];
                          acc[skill.category].push(skill);
                          return acc;
                        }, {} as Record<string, typeof filteredSkills>)
                      ).map(([category, skills]) => (
                        <div key={category}>
                          <div className="sticky top-0 bg-slate-700 px-4 py-2 text-sm font-semibold text-white border-b border-white/20">{category}</div>
                          {skills.map((skill) => (
                            <Combobox.Option key={skill.id} className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? "bg-white/20 text-white" : "text-white"}`} value={skill.name}>
                              {({ selected, active }) => (
                                <>
                                  <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>{skill.name}</span>
                                  {selected && (
                                    <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? "text-blue-300" : "text-blue-500"}`}>
                                      <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                    </span>
                                  )}
                                </>
                              )}
                            </Combobox.Option>
                          ))}
                        </div>
                      ))
                    )}
                  </Combobox.Options>
                </Transition>
              </div>
            </div>
          </Combobox>
        </div>
        <p className="text-sm text-gray-300 mt-1">Select multiple skills from the predefined list or add your own.</p>
      </div>

      {isAddingSkill && <AddSkillModal />}

      {/* Website URL */}
      <div className="space-y-2">
        <label htmlFor="website_url" className="block text-xs sm:text-sm font-medium text-white">
          Website URL
          <span className="ml-1 sm:ml-2 inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-brand-500/20 text-brand-300 border border-brand-400/30">
            <SparklesIcon className="h-3 w-3 mr-1" />
            Auto Projects
          </span>
        </label>
        <input
          type="url"
          id="website_url"
          name="website_url"
          value={formData.website_url}
          onChange={(e) => {
            handleChange(e);
            debouncedDetectProjects(formData.github_url, e.target.value);
            debouncedGenerateScreenshot(e.target.value);
          }}
          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-white/20 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white/10 text-sm sm:text-base"
          placeholder="Your website (optional)"
        />
      </div>

      {/* GitHub URL */}
      <div className="space-y-2">
        <label htmlFor="github_url" className="block text-xs sm:text-sm font-medium text-white">
          GitHub URL
          <span className="ml-1 sm:ml-2 inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-brand-500/20 text-brand-300 border border-brand-400/30">
            <SparklesIcon className="h-3 w-3 mr-1" />
            Auto Projects
          </span>
        </label>
        <input
          type="url"
          id="github_url"
          name="github_url"
          value={formData.github_url}
          onChange={(e) => {
            handleChange(e);
            debouncedDetectProjects(e.target.value, formData.website_url);
          }}
          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-white/20 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white/10 text-sm sm:text-base"
          placeholder="GitHub profile (optional)"
        />
      </div>

      {/* LinkedIn URL */}
      <div className="space-y-2 sm:space-y-4">
        <label htmlFor="linkedin_url" className="block text-xs sm:text-sm font-semibold text-white">LinkedIn URL</label>
        <input
          type="url"
          id="linkedin_url"
          name="linkedin_url"
          value={formData.linkedin_url}
          onChange={handleChange}
          className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg sm:rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200 shadow-sm hover:shadow-md text-sm sm:text-base"
          placeholder="LinkedIn profile (optional)"
        />
      </div>

      {/* Auto-Detected Projects */}
      {(detectedProjects.length > 0 || detectingProjects) && (
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2">
            <SparklesIcon className="h-4 w-4 sm:h-5 sm:w-5 text-brand-300" />
            <h3 className="text-base sm:text-lg font-medium text-white">Auto-Detected Projects</h3>
            {detectingProjects && (
              <div className="h-3 w-3 sm:h-4 sm:w-4 border border-gray-600 border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>
          <ProjectCards projects={detectedProjects} onRemoveProject={removeProject} editable={true} />
        </div>
      )}

    </div>
  );
}
