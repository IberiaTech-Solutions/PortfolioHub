"use client";

import { SparklesIcon } from "@heroicons/react/20/solid";

interface StepProfessionalProps {
  formData: {
    title: string;
    job_title: string;
    experience_level: string;
    preferred_work_type: string[];
    description: string;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setFormData: (fn: (prev: any) => any) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  debouncedAnalyze: (field: string, content: string, fieldType: string) => void;
  debouncedExtractSkills: (content: string) => void;
  aiSuggestions: { [key: string]: string[] };
  analyzingField: string | null;
  extractedSkills: string[];
  extractingSkills: boolean;
  selectedSkills: string[];
  addExtractedSkill: (skill: string) => void;
  aiCallCount: number;
  MAX_AI_CALLS: number;
}

export default function StepProfessional({
  formData,
  setFormData,
  handleChange,
  debouncedAnalyze,
  debouncedExtractSkills,
  aiSuggestions,
  analyzingField,
  extractedSkills,
  extractingSkills,
  selectedSkills,
  addExtractedSkill,
  aiCallCount,
  MAX_AI_CALLS,
}: StepProfessionalProps) {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-500/10 border border-blue-400/30 rounded-lg">
        <p className="text-xs text-blue-300">
          AI Analysis: {MAX_AI_CALLS - aiCallCount} calls remaining
        </p>
      </div>

      {/* Portfolio Title */}
      <div className="space-y-3 sm:space-y-4">
        <label htmlFor="title" className="block text-xs sm:text-sm font-semibold text-white">
          Portfolio Title <span className="text-red-400">*</span>
          <span className="ml-2 sm:ml-3 inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-brand-500/20 text-brand-300 border border-brand-400/30">
            <SparklesIcon className="h-3 w-3 mr-1" />
            AI Analysis
          </span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={(e) => {
            handleChange(e);
            debouncedAnalyze("title", e.target.value, "title");
          }}
          required
          className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/10 backdrop-blur-sm border rounded-lg sm:rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200 shadow-sm hover:shadow-md text-sm sm:text-base ${
            !formData.title ? "border-red-400/50" : "border-white/20"
          }`}
          placeholder="Front-end Developer with 5 years experience"
        />
        {!formData.title && <p className="text-red-400 text-xs mt-1">This field is required</p>}

        {(aiSuggestions.title?.length > 0 || analyzingField === "title") && (
          <div className="mt-4 p-4 bg-brand-500/10 border border-brand-400/30 rounded-xl backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <SparklesIcon className="h-4 w-4 text-brand-300" />
              <span className="text-sm font-semibold text-brand-200">AI Suggestions</span>
              {analyzingField === "title" && (
                <div className="h-3 w-3 border border-brand-300 border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>
            {aiSuggestions.title?.map((suggestion, index) => (
              <p key={index} className="text-sm text-white mb-1 font-medium">
                • {suggestion}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Job Title */}
      <div className="space-y-3">
        <label htmlFor="job_title" className="block text-sm font-medium text-white">
          Job Title <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          id="job_title"
          name="job_title"
          value={formData.job_title}
          onChange={handleChange}
          required
          className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white/10 text-sm sm:text-base ${
            !formData.job_title ? "border-red-400/50" : "border-white/20"
          }`}
          placeholder="Senior Front-end Developer"
        />
        {!formData.job_title && <p className="text-red-400 text-xs mt-1">This field is required</p>}
      </div>

      {/* Experience Level */}
      <div className="space-y-2 sm:space-y-3">
        <label htmlFor="experience_level" className="block text-xs sm:text-sm font-medium text-white">
          Experience Level
        </label>
        <select
          id="experience_level"
          name="experience_level"
          value={formData.experience_level}
          onChange={handleChange}
          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white/10 text-sm sm:text-base"
        >
          <option value="">Select experience level</option>
          <option value="Entry Level">Entry Level (0-2 years)</option>
          <option value="Mid Level">Mid Level (3-5 years)</option>
          <option value="Senior Level">Senior Level (6+ years)</option>
          <option value="Lead Level">Lead Level (8+ years)</option>
          <option value="Student">Student/Intern</option>
        </select>
      </div>

      {/* Work Type */}
      <div className="space-y-2 sm:space-y-3">
        <label className="block text-xs sm:text-sm font-medium text-white">Preferred Work Type</label>
        <div className="space-y-2">
          {["Full-time", "Part-time", "Contract", "Freelance"].map((workType) => (
            <label key={workType} className="flex items-center space-x-2 sm:space-x-3 cursor-pointer py-1">
              <input
                type="checkbox"
                checked={formData.preferred_work_type.includes(workType)}
                onChange={(e) => {
                  if (e.target.checked) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    setFormData((prev: any) => ({
                      ...prev,
                      preferred_work_type: [...prev.preferred_work_type, workType],
                    }));
                  } else {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    setFormData((prev: any) => ({
                      ...prev,
                      preferred_work_type: prev.preferred_work_type.filter((t: string) => t !== workType),
                    }));
                  }
                }}
                className="w-4 h-4 sm:w-5 sm:h-5 text-brand-600 bg-white/10 border-white/20 rounded focus:ring-brand-500 focus:ring-2"
              />
              <span className="text-white text-xs sm:text-sm">{workType}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2 sm:space-y-3">
        <label htmlFor="description" className="block text-xs sm:text-sm font-medium text-white">
          About You / Description <span className="text-red-400">*</span>
          <span className="ml-2 sm:ml-3 inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-brand-500/20 text-brand-300 border border-brand-400/30">
            <SparklesIcon className="h-3 w-3 mr-1" />
            AI Analysis
          </span>
          <span className="ml-1 sm:ml-2 inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-green-500/20 text-green-300 border border-green-500/30">
            <SparklesIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            Auto Skills
          </span>
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={(e) => {
            handleChange(e);
            debouncedAnalyze("description", e.target.value, "description");
            debouncedExtractSkills(e.target.value);
          }}
          required
          rows={4}
          className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none bg-white/10 text-sm sm:text-base ${
            !formData.description ? "border-red-400/50" : "border-white/20"
          }`}
          placeholder="A brief description about yourself, your experience, and what you're looking for"
        ></textarea>
        {!formData.description && <p className="text-red-400 text-xs mt-1">This field is required</p>}
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-gray-300">
            {formData.description.length > 2000 ? (
              <span className="text-amber-400">AI analysis disabled for long descriptions (2000+ chars)</span>
            ) : (
              <span>{formData.description.length} characters</span>
            )}
          </p>
        </div>

        {(aiSuggestions.description?.length > 0 || analyzingField === "description") && (
          <div className="mt-3 p-4 bg-brand-500/10 border border-brand-400/30 rounded-xl backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <SparklesIcon className="h-4 w-4 text-brand-300" />
              <span className="text-sm font-semibold text-brand-200">AI Suggestions</span>
              {analyzingField === "description" && (
                <div className="h-3 w-3 border border-brand-300 border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>
            {aiSuggestions.description?.map((suggestion, index) => (
              <p key={index} className="text-sm text-white mb-1 font-medium">
                • {suggestion}
              </p>
            ))}
          </div>
        )}

        {(extractedSkills.length > 0 || extractingSkills) && (
          <div className="mt-3 p-4 bg-emerald-500/10 border border-emerald-400/30 rounded-xl backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <SparklesIcon className="h-4 w-4 text-emerald-300" />
              <span className="text-sm font-semibold text-emerald-200">Auto-detected Skills</span>
              {extractingSkills && (
                <div className="h-3 w-3 border border-emerald-300 border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {extractedSkills.map((skill, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => addExtractedSkill(skill)}
                  disabled={selectedSkills.includes(skill)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm ${
                    selectedSkills.includes(skill)
                      ? "bg-emerald-500/20 text-emerald-200 cursor-not-allowed shadow-md border border-emerald-400/30"
                      : "bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20 border border-emerald-400/30 hover:border-emerald-400/50 shadow-md hover:shadow-lg"
                  }`}
                >
                  {selectedSkills.includes(skill) ? "\u2713 " : "+ "}
                  {skill}
                </button>
              ))}
            </div>
            <p className="text-xs text-emerald-300 mt-2">Click to add skills to your portfolio</p>
          </div>
        )}
      </div>
    </div>
  );
}
