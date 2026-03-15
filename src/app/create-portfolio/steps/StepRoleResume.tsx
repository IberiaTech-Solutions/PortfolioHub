"use client";

import { SparklesIcon, XMarkIcon } from "@heroicons/react/20/solid";

interface StepRoleResumeProps {
  formData: {
    user_role: string;
    company_name: string;
    company_logo: string;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setFormData: (fn: (prev: any) => any) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  existingPortfolio: any;
  showResumeImport: boolean;
  setShowResumeImport: (v: boolean) => void;
  resumeText: string;
  setResumeText: (v: string) => void;
  resumeParsing: boolean;
  handleResumeImport: (source: "file" | "text") => void;
}

export default function StepRoleResume({
  formData,
  setFormData,
  handleChange,
  existingPortfolio,
  showResumeImport,
  setShowResumeImport,
  resumeText,
  setResumeText,
  resumeParsing,
  handleResumeImport,
}: StepRoleResumeProps) {
  return (
    <div className="space-y-8">
      {/* Role Selector */}
      {!existingPortfolio && (
        <div>
          <p className="text-sm font-medium text-gray-300 mb-3">I am a...</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onClick={() => setFormData((prev: any) => ({ ...prev, user_role: "candidate" }))}
              className={`p-4 rounded-xl border text-left transition-all ${
                formData.user_role === "candidate"
                  ? "bg-brand-600/15 border-brand-500/50 text-white"
                  : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
              }`}
            >
              <div className="text-lg mb-1">
                <svg className="w-6 h-6 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <p className="font-heading font-semibold text-sm">Candidate</p>
              <p className="text-xs text-gray-500 mt-1">Looking for jobs, showcase my work</p>
            </button>
            <button
              type="button"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onClick={() => setFormData((prev: any) => ({ ...prev, user_role: "recruiter" }))}
              className={`p-4 rounded-xl border text-left transition-all ${
                formData.user_role === "recruiter"
                  ? "bg-brand-600/15 border-brand-500/50 text-white"
                  : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
              }`}
            >
              <div className="text-lg mb-1">
                <svg className="w-6 h-6 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <p className="font-heading font-semibold text-sm">Recruiter / Company</p>
              <p className="text-xs text-gray-500 mt-1">Hiring talent, posting jobs</p>
            </button>
          </div>
        </div>
      )}

      {/* Company Fields (recruiter only) */}
      {formData.user_role === "recruiter" && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-heading font-semibold text-white">Company Details</h3>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Company Name</label>
            <input
              type="text"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              placeholder="Acme Corp"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Company Logo URL</label>
            <input
              type="url"
              name="company_logo"
              value={formData.company_logo}
              onChange={handleChange}
              placeholder="https://example.com/logo.png"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>
      )}

      {/* Resume Import Section */}
      {!existingPortfolio && formData.user_role === "candidate" && (
        <div>
          {!showResumeImport ? (
            <button
              type="button"
              onClick={() => setShowResumeImport(true)}
              className="w-full py-4 bg-gradient-to-r from-brand-500/20 to-emerald-500/20 hover:from-brand-500/30 hover:to-emerald-500/30 border-2 border-dashed border-brand-500/40 hover:border-brand-500/60 rounded-2xl text-white font-heading font-bold transition-all duration-300 flex items-center justify-center gap-3"
            >
              <svg className="w-6 h-6 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Import from Resume — Fill your profile in 30 seconds
            </button>
          ) : (
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-heading font-bold text-white flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5 text-brand-400" />
                  Import from Resume
                </h3>
                <button
                  type="button"
                  onClick={() => setShowResumeImport(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Upload a file or paste your resume text. AI will extract your info and fill the form automatically.
              </p>
              <div className="space-y-4">
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume text here..."
                  rows={6}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                  disabled={resumeParsing}
                />
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => handleResumeImport("text")}
                    disabled={resumeParsing || resumeText.trim().length < 50}
                    className="flex-1 py-3 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
                  >
                    {resumeParsing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Parsing with AI...
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="w-4 h-4" />
                        Parse Resume Text
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleResumeImport("file")}
                    disabled={resumeParsing}
                    className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-sm transition-all duration-300 border border-white/20 flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Upload File (.txt, .md)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
