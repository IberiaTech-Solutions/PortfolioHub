"use client";

import Image from "next/image";

interface StepReviewProps {
  formData: {
    user_role: string;
    company_name: string;
    name: string;
    username: string;
    title: string;
    job_title: string;
    description: string;
    location: string;
    experience_level: string;
    preferred_work_type: string[];
    languages: string;
    website_url: string;
    github_url: string;
    linkedin_url: string;
    additional_links: Array<{ label: string; url: string }>;
  };
  selectedSkills: string[];
  profileImagePreview: string;
  heroImagePreview: string;
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
  profileImagePreview,
  heroImagePreview,
  detectedProjects,
  existingPortfolio,
  loading,
  goToStep,
}: StepReviewProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-heading font-bold text-white mb-2">Review Your Portfolio</h2>
        <p className="text-sm text-gray-400">Make sure everything looks good before publishing.</p>
      </div>

      <Section title="Role & Setup" step={1} goToStep={goToStep}>
        <p className="text-sm text-gray-300 capitalize">{formData.user_role}</p>
        {formData.company_name && <p className="text-xs text-gray-400 mt-1">Company: {formData.company_name}</p>}
      </Section>

      <Section title="Personal Info" step={2} goToStep={goToStep}>
        <div className="flex items-center gap-3">
          {profileImagePreview ? (
            <Image src={profileImagePreview} alt="Profile" width={40} height={40} className="w-10 h-10 rounded-lg object-cover" />
          ) : (
            <div className="w-10 h-10 bg-brand-500/20 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">{formData.name?.charAt(0)?.toUpperCase() || "?"}</span>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-white">{formData.name || "Not set"}</p>
            {formData.username && <p className="text-xs text-gray-400">talentagent.com/{formData.username}</p>}
          </div>
        </div>
        {formData.location && <p className="text-xs text-gray-400 mt-2">{formData.location}</p>}
        {formData.languages && <p className="text-xs text-gray-400 mt-1">Languages: {formData.languages}</p>}
        {heroImagePreview && (
          <div className="mt-3 rounded-lg overflow-hidden h-20">
            <Image src={heroImagePreview} alt="Hero" width={320} height={80} className="w-full h-full object-cover" />
          </div>
        )}
      </Section>

      <Section title="Professional Info" step={3} goToStep={goToStep}>
        <p className="text-sm font-medium text-white">{formData.title || "No title"}</p>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.job_title && (
            <span className="px-2 py-0.5 bg-brand-500/15 text-brand-300 text-xs rounded-md border border-brand-500/30">{formData.job_title}</span>
          )}
          {formData.experience_level && (
            <span className="px-2 py-0.5 bg-purple-500/15 text-purple-300 text-xs rounded-md border border-purple-500/30">{formData.experience_level}</span>
          )}
          {formData.preferred_work_type.map((wt) => (
            <span key={wt} className="px-2 py-0.5 bg-white/10 text-gray-300 text-xs rounded-md border border-white/20">{wt}</span>
          ))}
        </div>
        {formData.description && (
          <div className="mt-3 p-3 bg-white/5 rounded-lg border border-white/5">
            <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">{formData.description}</p>
          </div>
        )}
      </Section>

      <Section title={`Skills (${selectedSkills.length})`} step={4} goToStep={goToStep}>
        {selectedSkills.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {selectedSkills.map((skill) => (
              <span key={skill} className="px-2 py-1 bg-white/10 text-white text-xs rounded-lg border border-white/20">
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 mb-3">No skills added</p>
        )}
      </Section>

      <Section title="Links" step={4} goToStep={goToStep}>
        <div className="space-y-2">
          {formData.website_url && (
            <a href={formData.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-brand-400 hover:text-brand-300 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" /></svg>
              {formData.website_url}
            </a>
          )}
          {formData.github_url && (
            <a href={formData.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-brand-400 hover:text-brand-300 transition-colors">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              {formData.github_url}
            </a>
          )}
          {formData.linkedin_url && (
            <a href={formData.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-brand-400 hover:text-brand-300 transition-colors">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              {formData.linkedin_url}
            </a>
          )}
          {formData.additional_links.filter((l) => l.url).map((link, i) => (
            <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-brand-400 hover:text-brand-300 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" /></svg>
              {link.label}: {link.url}
            </a>
          ))}
          {!formData.website_url && !formData.github_url && !formData.linkedin_url && (
            <p className="text-xs text-gray-500">No links added</p>
          )}
        </div>
      </Section>

      {/* Projects */}
      {detectedProjects.length > 0 && (
        <Section title={`Experience & Projects (${detectedProjects.length})`} step={4} goToStep={goToStep}>
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
          {loading ? "Saving..." : existingPortfolio ? "Update Portfolio" : "Publish Portfolio"}
        </button>
      </div>
    </div>
  );
}
