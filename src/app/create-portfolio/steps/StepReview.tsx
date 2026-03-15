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
            {formData.username && <p className="text-xs text-gray-400">portfoliohub.com/{formData.username}</p>}
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
        <p className="text-xs text-gray-400 mt-1">{formData.job_title || "No job title"}</p>
        {formData.experience_level && <p className="text-xs text-gray-400 mt-1">{formData.experience_level}</p>}
        {formData.preferred_work_type.length > 0 && (
          <p className="text-xs text-gray-400 mt-1">{formData.preferred_work_type.join(", ")}</p>
        )}
        {formData.description && (
          <p className="text-xs text-gray-300 mt-2 line-clamp-3">{formData.description}</p>
        )}
      </Section>

      <Section title="Skills & Links" step={4} goToStep={goToStep}>
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
        <div className="space-y-1">
          {formData.website_url && <p className="text-xs text-gray-400">Website: {formData.website_url}</p>}
          {formData.github_url && <p className="text-xs text-gray-400">GitHub: {formData.github_url}</p>}
          {formData.linkedin_url && <p className="text-xs text-gray-400">LinkedIn: {formData.linkedin_url}</p>}
          {formData.additional_links.filter((l) => l.url).map((link, i) => (
            <p key={i} className="text-xs text-gray-400">{link.label}: {link.url}</p>
          ))}
        </div>
        {detectedProjects.length > 0 && (
          <p className="text-xs text-gray-400 mt-2">{detectedProjects.length} project(s) detected</p>
        )}
      </Section>

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
