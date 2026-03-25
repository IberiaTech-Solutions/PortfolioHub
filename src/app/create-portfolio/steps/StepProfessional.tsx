"use client";

import { SparklesIcon } from "@heroicons/react/20/solid";

interface StepProfessionalProps {
  formData: {
    name: string;
    job_title: string;
    location: string;
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

      {/* Full Name */}
      <div className="space-y-3">
        <label htmlFor="name" className="block text-xs sm:text-sm font-semibold text-white">
          Your Full Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/10 border rounded-lg sm:rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm sm:text-base ${
            !formData.name ? "border-red-400/50" : "border-white/20"
          }`}
          placeholder="John Doe"
        />
        {!formData.name && <p className="text-red-400 text-xs mt-1">This field is required</p>}
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
          className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white/10 text-sm sm:text-base ${
            !formData.job_title ? "border-red-400/50" : "border-white/20"
          }`}
          placeholder="Senior Front-end Developer"
        />
        {!formData.job_title && <p className="text-red-400 text-xs mt-1">This field is required</p>}
      </div>

      {/* Location */}
      <div className="space-y-3">
        <label htmlFor="location" className="block text-sm font-medium text-white">Location</label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white/10 text-sm sm:text-base"
          placeholder="San Francisco, CA or Remote"
        />
      </div>

      {/* Experience Level + Work Type — side by side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="experience_level" className="block text-xs sm:text-sm font-medium text-white">
            Experience Level
          </label>
          <select
            id="experience_level"
            name="experience_level"
            value={formData.experience_level}
            onChange={handleChange}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white/10 text-sm sm:text-base"
          >
            <option value="">Select level</option>
            <option value="Entry Level">Entry Level (0-2 years)</option>
            <option value="Mid Level">Mid Level (3-5 years)</option>
            <option value="Senior Level">Senior Level (6+ years)</option>
            <option value="Lead Level">Lead Level (8+ years)</option>
            <option value="Student">Student/Intern</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-xs sm:text-sm font-medium text-white">Work Type</label>
          <div className="flex flex-wrap gap-2">
            {["Full-time", "Part-time", "Contract", "Freelance"].map((workType) => (
              <label key={workType} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm cursor-pointer border transition-all ${
                formData.preferred_work_type.includes(workType)
                  ? "bg-brand-500/20 border-brand-500/50 text-brand-300"
                  : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
              }`}>
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
                  className="hidden"
                />
                {workType}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2 sm:space-y-3">
        <label htmlFor="description" className="block text-xs sm:text-sm font-medium text-white">
          About You <span className="text-red-400">*</span>
          <span className="ml-2 inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-brand-500/20 text-brand-300 border border-brand-400/30">
            <SparklesIcon className="h-3 w-3 mr-1" />
            AI Analysis
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
          rows={8}
          className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none bg-white/10 text-sm sm:text-base ${
            !formData.description ? "border-red-400/50" : "border-white/20"
          }`}
          placeholder="A brief description about yourself, your experience, and what you're looking for"
        ></textarea>
        {!formData.description && <p className="text-red-400 text-xs mt-1">This field is required</p>}

        {(aiSuggestions.description?.length > 0 || analyzingField === "description") && (
          <div className="mt-3 p-4 bg-brand-500/10 border border-brand-400/30 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <SparklesIcon className="h-4 w-4 text-brand-300" />
              <span className="text-sm font-semibold text-brand-200">AI Suggestions</span>
              {analyzingField === "description" && (
                <div className="h-3 w-3 border border-brand-300 border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>
            {aiSuggestions.description?.map((suggestion, index) => (
              <p key={index} className="text-sm text-white mb-1 font-medium">
                {suggestion}
              </p>
            ))}
          </div>
        )}

        {(extractedSkills.length > 0 || extractingSkills) && (
          <div className="mt-3 p-4 bg-emerald-500/10 border border-emerald-400/30 rounded-xl">
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
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    selectedSkills.includes(skill)
                      ? "bg-emerald-500/20 text-emerald-200 cursor-not-allowed border border-emerald-400/30"
                      : "bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20 border border-emerald-400/30"
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
