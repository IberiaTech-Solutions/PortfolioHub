"use client";

import { useState } from "react";
import { SparklesIcon, XMarkIcon } from "@heroicons/react/20/solid";

interface StepRoleResumeProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setFormData: (fn: (prev: any) => any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  existingPortfolio: any;
  showResumeImport: boolean;
  setShowResumeImport: (v: boolean) => void;
  resumeText: string;
  setResumeText: (v: string) => void;
  resumeParsing: boolean;
  handleResumeImport: (source: "file" | "text") => void;
  setSelectedSkills: (fn: (prev: string[]) => string[]) => void;
  setDetectedProjects: (fn: (prev: Array<{ title: string; description: string; url: string; techStack: string[]; stars?: number; forks?: number; language?: string; lastUpdated?: string }>) => Array<{ title: string; description: string; url: string; techStack: string[]; stars?: number; forks?: number; language?: string; lastUpdated?: string }>) => void;
  setProfileImagePreview: (v: string) => void;
}

export default function StepRoleResume({
  setFormData,
  existingPortfolio,
  showResumeImport,
  setShowResumeImport,
  resumeText,
  setResumeText,
  resumeParsing,
  handleResumeImport,
  setSelectedSkills,
  setDetectedProjects,
  setProfileImagePreview,
}: StepRoleResumeProps) {
  const [githubUrl, setGithubUrl] = useState("");
  const [githubImporting, setGithubImporting] = useState(false);
  const [showGithubImport, setShowGithubImport] = useState(false);

  const handleGithubImport = async () => {
    if (!githubUrl.trim()) return;
    setGithubImporting(true);
    try {
      const res = await fetch("/api/importGithub", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ githubUrl: githubUrl.trim() }),
      });
      const data = await res.json();
      if (data.profile) {
        const p = data.profile;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setFormData((prev: any) => ({
          ...prev,
          name: p.name || prev.name,
          description: p.description || prev.description,
          location: p.location || prev.location,
          website_url: p.website_url || prev.website_url,
          github_url: p.github_url || prev.github_url,
          job_title: p.job_title || prev.job_title,
          profile_image: p.profile_image || prev.profile_image,
        }));
        if (p.skills?.length) {
          setSelectedSkills((prev: string[]) => [...new Set([...prev, ...p.skills])]);
        }
        if (p.projects?.length) {
          setDetectedProjects((prev) => [...prev, ...p.projects]);
        }
        if (p.profile_image) {
          setProfileImagePreview(p.profile_image);
        }
        setShowGithubImport(false);
        setGithubUrl("");
      }
    } catch {
      // silent
    } finally {
      setGithubImporting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Role badge */}
      {!existingPortfolio && (
        <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-brand-500/20">
            <svg className="w-5 h-5 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-heading font-bold text-white">Candidate Account</p>
            <p className="text-xs text-gray-500">Build your portfolio and let AI represent you</p>
          </div>
        </div>
      )}

      {/* Resume Import Section */}
      {!existingPortfolio && (
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
                    Upload File (.pdf, .docx, .txt)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* GitHub Import Section */}
      {!existingPortfolio && (
        <div>
          {!showGithubImport ? (
            <button
              type="button"
              onClick={() => setShowGithubImport(true)}
              className="w-full py-4 bg-gradient-to-r from-gray-800/50 to-gray-700/50 hover:from-gray-700/50 hover:to-gray-600/50 border-2 border-dashed border-gray-600/40 hover:border-gray-500/60 rounded-2xl text-white font-heading font-bold transition-all duration-300 flex items-center justify-center gap-3"
            >
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Import from GitHub — Auto-fill from your profile
            </button>
          ) : (
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-heading font-bold text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  Import from GitHub
                </h3>
                <button type="button" onClick={() => setShowGithubImport(false)} className="text-gray-400 hover:text-white transition-colors">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Paste your GitHub profile URL. We&apos;ll import your name, bio, avatar, top languages as skills, and best repos as projects.
              </p>
              <div className="flex gap-3">
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/yourusername"
                  className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  disabled={githubImporting}
                />
                <button
                  type="button"
                  onClick={handleGithubImport}
                  disabled={githubImporting || !githubUrl.trim()}
                  className="px-5 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {githubImporting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Importing...
                    </>
                  ) : (
                    "Import"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
