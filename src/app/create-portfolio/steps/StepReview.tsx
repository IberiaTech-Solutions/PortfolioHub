"use client";

interface StepReviewProps {
  formData: {
    name: string;
    job_title: string;
    description: string;
    location: string;
    experience_level: string;
    preferred_work_type: string[];
    website_url: string;
    github_url: string;
    linkedin_url: string;
  };
  selectedSkills: string[];
  detectedProjects: Array<{ title: string; description: string; url: string; techStack: string[] }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  existingPortfolio: any;
  loading: boolean;
  goToStep: (step: number) => void;
}

function Section({
  title,
  step,
  goToStep,
  children,
}: {
  title: string;
  step: number;
  goToStep: (s: number) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-heading font-semibold text-white">{title}</h3>
        <button
          type="button"
          onClick={() => goToStep(step)}
          className="text-xs text-brand-300 hover:text-brand-200 font-medium transition-colors"
        >
          Edit
        </button>
      </div>
      {children}
    </div>
  );
}

export default function StepReview({
  formData,
  selectedSkills,
  detectedProjects,
  existingPortfolio,
  loading,
  goToStep,
}: StepReviewProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-heading font-bold text-white mb-2">Review Your Profile</h2>
        <p className="text-sm text-gray-400">Make sure everything looks good before saving.</p>
      </div>

      <Section title="About You" step={2} goToStep={goToStep}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-brand-500/20 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">{formData.name?.charAt(0)?.toUpperCase() || "?"}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-white">{formData.name || "Not set"}</p>
            <p className="text-xs text-gray-400">{formData.job_title || "No job title"}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {formData.location && (
            <span className="px-2 py-0.5 bg-white/10 text-gray-300 text-xs rounded-md border border-white/20">{formData.location}</span>
          )}
          {formData.experience_level && (
            <span className="px-2 py-0.5 bg-purple-500/15 text-purple-300 text-xs rounded-md border border-purple-500/30">{formData.experience_level}</span>
          )}
          {formData.preferred_work_type.map((wt) => (
            <span key={wt} className="px-2 py-0.5 bg-brand-500/15 text-brand-300 text-xs rounded-md border border-brand-500/30">{wt}</span>
          ))}
        </div>
        {formData.description && (
          <div className="p-3 bg-white/5 rounded-lg border border-white/5">
            <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">{formData.description}</p>
          </div>
        )}
      </Section>

      <Section title={`Skills (${selectedSkills.length})`} step={3} goToStep={goToStep}>
        {selectedSkills.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {selectedSkills.map((skill) => (
              <span key={skill} className="px-2 py-1 bg-white/10 text-white text-xs rounded-lg border border-white/20">
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400">No skills added</p>
        )}
      </Section>

      {(formData.website_url || formData.github_url || formData.linkedin_url) && (
        <Section title="Links" step={3} goToStep={goToStep}>
          <div className="space-y-2">
            {formData.github_url && (
              <p className="text-xs text-brand-400">{formData.github_url}</p>
            )}
            {formData.linkedin_url && (
              <p className="text-xs text-brand-400">{formData.linkedin_url}</p>
            )}
            {formData.website_url && (
              <p className="text-xs text-brand-400">{formData.website_url}</p>
            )}
          </div>
        </Section>
      )}

      {detectedProjects.length > 0 && (
        <Section title={`Projects (${detectedProjects.length})`} step={3} goToStep={goToStep}>
          <div className="space-y-3">
            {detectedProjects.map((project, i) => (
              <div key={i} className="p-3 bg-white/5 rounded-lg border border-white/5">
                <p className="text-sm font-medium text-white">{project.title}</p>
                {project.description && <p className="text-xs text-gray-400 mt-1 leading-relaxed">{project.description}</p>}
                {project.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {project.techStack.map((tech, j) => (
                      <span key={j} className="px-1.5 py-0.5 bg-white/10 text-gray-300 text-[10px] rounded border border-white/10">{tech}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      <div className="flex justify-center pt-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white rounded-lg sm:rounded-xl font-display font-semibold transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0 text-sm sm:text-base w-full sm:w-auto shadow-lg hover:shadow-xl"
        >
          {loading ? "Saving..." : existingPortfolio ? "Update Portfolio" : "Save Profile"}
        </button>
      </div>
    </div>
  );
}
