"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/utils/supabase";
import {
  CodeBracketIcon,
  GlobeAltIcon,
  UserGroupIcon,
  ArrowTopRightOnSquareIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import dynamic from "next/dynamic";
const PortfolioChat = dynamic(() => import("@/components/PortfolioChat"), { ssr: false });
import { Portfolio } from "@/types";

export default function PortfolioDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [githubScore, setGithubScore] = useState<{ score: number; level: string; topLanguages: Array<{ language: string; repos: number }> } | null>(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      setLoading(true);

      if (!supabase) {
        console.warn('Supabase not configured');
        setLoading(false);
        return;
      }

      if (!params.id) {
        console.error('Portfolio ID is required');
        setLoading(false);
        return;
      }


      const { data: portfolioData, error } = await supabase
        .from("portfolios")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error) {
        console.error("Error fetching portfolio:", error);
        console.error("Portfolio ID:", params.id);
        console.error("Supabase client:", !!supabase);
        setLoading(false);
        return;
      }

      setPortfolio(portfolioData as unknown as Portfolio);

      // Set dynamic page title and meta
      document.title = `${portfolioData.name} — ${portfolioData.job_title} | TalentAgent`;
      const metaDesc = document.querySelector('meta[name="description"]');
      const desc = typeof portfolioData.description === 'string' ? portfolioData.description.slice(0, 120) : '';
      if (metaDesc) {
        metaDesc.setAttribute('content', `${portfolioData.name} is a ${portfolioData.job_title}. ${desc}`);
      }

      // Check if current user is the owner
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        if (portfolioData.user_id === user.id) {
          setIsOwner(true);
        }
      }

      setLoading(false);

      // Fetch GitHub score if they have a GitHub URL
      if (portfolioData.github_url) {
        fetch('/api/githubScore', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ githubUrl: portfolioData.github_url }),
        })
          .then(r => r.json())
          .then(data => {
            if (!data.error) {
              setGithubScore(data);
            }
          })
          .catch(() => {});
      }

      // Track page view (fire-and-forget)
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portfolio_id: params.id, event_type: 'view' }),
      }).catch(() => {});
    };

    if (params.id) {
      fetchPortfolio();
    }
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <div className="max-w-7xl mx-auto py-16 px-6">
          <div className="text-center mb-16">
            <div className="w-32 h-32 bg-white/10 rounded-full mx-auto mb-8 animate-pulse"></div>
            <div className="h-10 bg-white/10 rounded-lg w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 bg-white/5 rounded-lg w-48 mx-auto mb-3 animate-pulse"></div>
            <div className="h-4 bg-white/5 rounded-lg w-56 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 animate-pulse">
                <div className="h-5 bg-white/10 rounded w-24 mb-6"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-white/5 rounded w-full"></div>
                  <div className="h-4 bg-white/5 rounded w-5/6"></div>
                  <div className="h-4 bg-white/5 rounded w-4/6"></div>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 animate-pulse">
                <div className="h-5 bg-white/10 rounded w-20 mb-6"></div>
                <div className="flex flex-wrap gap-2">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-8 bg-white/5 rounded-lg w-20"></div>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 animate-pulse">
                <div className="h-4 bg-white/10 rounded w-20 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-8 bg-white/5 rounded-lg"></div>
                  <div className="h-8 bg-white/5 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <XMarkIcon className="w-10 h-10 text-gray-300" />
          </div>
          <h2 className="text-3xl font-display font-bold text-white mb-4">Portfolio not found</h2>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <ArrowTopRightOnSquareIcon className="w-4 h-4" />
            Return to Home
          </Link>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Subtle Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto py-16 px-6">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-white/5 border border-white/10 rounded-full text-gray-400 text-xs font-medium mb-6 tracking-wide uppercase">
            Portfolio
          </div>
          
          {/* Profile Image */}
          <div className="flex justify-center mb-8">
            {portfolio.profile_image ? (
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-2xl">
                <Image
                  src={portfolio.profile_image}
                  alt={`${portfolio.name} profile`}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                {/* Fallback gradient */}
                <div className="hidden w-full h-full bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 flex items-center justify-center">
                  <span className="text-white font-bold text-4xl">
                    {portfolio.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            ) : (
              <div className="w-32 h-32 bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 rounded-full flex items-center justify-center border-4 border-white shadow-2xl">
                <span className="text-white font-bold text-4xl">
                  {portfolio.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white mb-6 leading-tight">
            {portfolio.name}
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-200 mb-4">
            {portfolio.job_title}
          </p>
          <p className="text-xl text-gray-300 mb-4">
            {portfolio.title}
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-400 mb-3">
            <span>Portfolio created {new Date(portfolio.created_at).toLocaleDateString()}</span>
            <span>•</span>
            {portfolio.updated_at && <span>Last updated {new Date(portfolio.updated_at).toLocaleDateString()}</span>}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            {portfolio.description && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8">
                <h2 className="text-lg font-heading font-semibold text-white mb-4">About</h2>
                <div className="text-gray-300 leading-relaxed space-y-3">
                  {portfolio.description.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="text-base">
                      {paragraph.trim()}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Skills Section */}
            {portfolio.skills && portfolio.skills.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8">
                <h2 className="text-lg font-heading font-semibold text-white mb-4">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {portfolio.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-white/10 text-gray-200 rounded-lg text-sm font-medium border border-white/10 hover:bg-white/15 transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Website Screenshot Section */}
            {portfolio.website_screenshot && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8">
                <h2 className="text-lg font-heading font-semibold text-white mb-4">Website Preview</h2>
                <div className="rounded-xl overflow-hidden border border-white/10">
                  <Image
                    src={portfolio.website_screenshot}
                    alt={`${portfolio.name} website screenshot`}
                    width={800}
                    height={400}
                    className="w-full h-auto object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  {/* Fallback */}
                  <div className="hidden w-full h-64 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">Website Screenshot</span>
                  </div>
                </div>
              </div>
            )}

            {/* Projects Section */}
            {portfolio.projects && portfolio.projects.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8">
                <h2 className="text-lg font-heading font-semibold text-white mb-5">Projects</h2>
                <div className="grid gap-4">
                  {portfolio.projects.map((project, index) => (
                    <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/8 transition-colors duration-200">
                      <h3 className="text-base font-heading font-semibold text-white mb-2">{project.title}</h3>
                      <p className="text-gray-400 text-sm mb-3 leading-relaxed">{project.description}</p>
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {project.techStack?.map((tech: string, techIndex: number) => (
                          <span
                            key={techIndex}
                            className="px-2 py-1 bg-slate-800 text-gray-300 rounded-md text-xs font-medium"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-brand-400 hover:text-brand-300 text-sm font-medium transition-colors"
                      >
                        View Project
                        <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-5">
            {/* GitHub Score */}
            {githubScore && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h3 className="text-sm font-heading font-semibold text-gray-400 uppercase tracking-wide mb-4">GitHub Score</h3>
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative w-14 h-14">
                    <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                      <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                      <circle
                        cx="28" cy="28" r="24" fill="none"
                        stroke={githubScore.score >= 60 ? "#10b981" : githubScore.score >= 30 ? "#f59e0b" : "#6366f1"}
                        strokeWidth="4" strokeLinecap="round"
                        strokeDasharray={`${(githubScore.score / 100) * 151} 151`}
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-white text-sm font-bold">
                      {githubScore.score}
                    </span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{githubScore.level}</p>
                    <p className="text-gray-500 text-xs">Developer Score</p>
                  </div>
                </div>
                {githubScore.topLanguages.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-white/5">
                    {githubScore.topLanguages.map((lang) => (
                      <span key={lang.language} className="px-2 py-0.5 bg-white/5 text-gray-400 rounded-md text-xs">
                        {lang.language}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Contact Info */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="text-sm font-heading font-semibold text-gray-400 uppercase tracking-wide mb-4">Contact</h3>
              <div className="space-y-4">
                {portfolio.website_url && (
                  <a
                    href={portfolio.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors p-2.5 rounded-lg hover:bg-white/5"
                  >
                    <GlobeAltIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">Website</span>
                  </a>
                )}
                {portfolio.github_url && (
                  <a
                    href={portfolio.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors p-2.5 rounded-lg hover:bg-white/5"
                  >
                    <CodeBracketIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">GitHub</span>
                  </a>
                )}
                {portfolio.linkedin_url && (
                  <a
                    href={portfolio.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors p-2.5 rounded-lg hover:bg-white/5"
                  >
                    <UserGroupIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">LinkedIn</span>
                  </a>
                )}
                
                {/* Additional Links */}
                {portfolio.additional_links && portfolio.additional_links.length > 0 && (
                  <>
                    <div className="border-t border-white/20 pt-4 mt-4">
                      <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">Additional Links</h4>
                      <div className="space-y-3">
                        {portfolio.additional_links.map((link, index) => (
                          <a
                            key={index}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors p-2.5 rounded-lg hover:bg-white/5"
                          >
                            <ArrowTopRightOnSquareIcon className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">{link.label}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Additional Information */}
            {(portfolio.location || portfolio.experience_level || (portfolio.preferred_work_type && portfolio.preferred_work_type.length > 0) || portfolio.languages) && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h3 className="text-sm font-heading font-semibold text-gray-400 uppercase tracking-wide mb-4">Details</h3>
                <div className="space-y-4">
                  {portfolio.location && (isOwner || !portfolio.private_fields?.includes('location')) && (
                    <div className="py-2.5">
                      <p className="text-xs text-gray-500">Location</p>
                      <p className="text-gray-200 text-sm">{portfolio.location}</p>
                    </div>
                  )}
                  {portfolio.experience_level && (isOwner || !portfolio.private_fields?.includes('experience_level')) && (
                    <div className="py-2.5 border-t border-white/5">
                      <p className="text-xs text-gray-500">Experience</p>
                      <p className="text-gray-200 text-sm">{portfolio.experience_level}</p>
                    </div>
                  )}
                  {portfolio.preferred_work_type && portfolio.preferred_work_type.length > 0 && (isOwner || !portfolio.private_fields?.includes('preferred_work_type')) && (
                    <div className="py-2.5 border-t border-white/5">
                      <p className="text-xs text-gray-500">Work Type</p>
                      <p className="text-gray-200 text-sm">{portfolio.preferred_work_type.join(", ")}</p>
                    </div>
                  )}
                  {portfolio.languages && (isOwner || !portfolio.private_fields?.includes('languages')) && (
                    <div className="py-2.5 border-t border-white/5">
                      <p className="text-xs text-gray-500">Languages</p>
                      <p className="text-gray-200 text-sm">{portfolio.languages}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Share Portfolio */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="text-sm font-heading font-semibold text-gray-400 uppercase tracking-wide mb-4">Share</h3>
              <div className="space-y-4">
                {portfolio.username && (
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-xs text-gray-500 mb-1">Vanity URL</p>
                    <p className="text-brand-300 font-mono text-sm font-bold">
                      talentagent.com/{portfolio.username}
                    </p>
                  </div>
                )}
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      navigator.clipboard.writeText(window.location.href);
                      setLinkCopied(true);
                      setTimeout(() => setLinkCopied(false), 2000);
                    }
                  }}
                  className="block w-full px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-center text-sm font-medium transition-colors"
                >
                  {linkCopied ? "Link Copied!" : "Copy Link"}
                </button>
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-2">Share this portfolio</p>
                  <div className="flex justify-center space-x-4">
                    <a
                      href={`https://twitter.com/intent/tweet?text=Check out ${portfolio.name}'s portfolio&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    </a>
                    <a
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* AI Chat Widget */}
      <PortfolioChat portfolio={portfolio} />
    </div>
  );
}