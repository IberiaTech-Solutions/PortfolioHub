"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/utils/supabase";
import { User } from "@supabase/supabase-js";
import { 
  CodeBracketIcon, 
  GlobeAltIcon, 
  UserGroupIcon,
  StarIcon,
  ArrowTopRightOnSquareIcon,
  CheckBadgeIcon,
  ClockIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";

type Portfolio = {
  id: string;
  user_id: string;
  title: string;
  name: string;
  job_title: string;
  description: string;
  website_url: string;
  github_url: string;
  linkedin_url: string;
  skills: string[];
  projects: any[];
  collaborations: any[];
  created_at: string;
  updated_at: string;
};

export default function PortfolioDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      setLoading(true);

      const { data: currentUser } = await supabase.auth.getUser();
      setUser(currentUser.user);

      const { data: portfolioData, error } = await supabase
        .from("portfolios")
        .select(`
          *,
          collaborations(*)
        `)
        .eq("id", params.id)
        .single();

      if (error) {
        console.error("Error fetching portfolio:", error);
        if (error.code === "PGRST116") {
          router.push("/");
          return;
        }
      }

      setPortfolio(portfolioData as Portfolio);
      setLoading(false);
    };

    if (params.id) {
      fetchPortfolio();
    }
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-3 h-3 bg-cyan-500 rounded-full animate-bounce"></div>
          </div>
          <p className="text-gray-400 font-mono">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <XMarkIcon className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Portfolio not found</h2>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-500 hover:to-purple-500 transition-all duration-300 font-medium"
          >
            <ArrowTopRightOnSquareIcon className="w-4 h-4" />
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = user && user.id === portfolio.user_id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-cyan-600/10"></div>
        <div className="absolute inset-0 opacity-5">
          <div className="font-mono text-xs text-white whitespace-pre overflow-hidden transform rotate-12">
            {`const developer = {
  name: "${portfolio.name}",
  role: "${portfolio.job_title}",
  skills: [${portfolio.skills?.map(skill => `"${skill}"`).join(', ')}],
  projects: ${portfolio.projects?.length || 0},
  collaborations: ${portfolio.collaborations?.length || 0}
};`}
          </div>
        </div>
        
        <div className="relative container mx-auto max-w-6xl px-4 py-16">
          <div className="flex items-center justify-between mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-mono">Available for work</span>
              </div>
              <h1 className="text-5xl font-bold text-white mb-2 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                {portfolio.name}
              </h1>
              <div className="flex items-center gap-4">
                <p className="text-2xl text-gray-300 font-medium">{portfolio.job_title}</p>
                <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                <p className="text-lg text-gray-400">{portfolio.title}</p>
              </div>
            </div>
            <button
              onClick={() => router.back()}
              className="group px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-500 hover:to-purple-500 transition-all duration-300 font-medium shadow-lg hover:shadow-blue-500/25 hover:scale-105 transform"
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Portfolio
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-6xl px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            {portfolio.description && (
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <CodeBracketIcon className="w-5 h-5 text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">About</h2>
                </div>
                <p className="text-gray-300 leading-relaxed text-lg">{portfolio.description}</p>
              </div>
            )}

            {/* Skills Section */}
            {portfolio.skills && portfolio.skills.length > 0 && (
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <StarIcon className="w-5 h-5 text-purple-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Skills & Technologies</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  {portfolio.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 text-sm font-medium border border-blue-500/30 hover:border-blue-400/50 transition-all duration-200 hover:scale-105"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Projects Section */}
            {portfolio.projects && portfolio.projects.length > 0 && (
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                    <CodeBracketIcon className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Featured Projects</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {portfolio.projects.map((project: any, index: number) => (
                    <div
                      key={index}
                      className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-200 group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                          {project.title}
                        </h3>
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                        </a>
                      </div>
                      <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                        {project.description}
                      </p>
                      {project.techStack && project.techStack.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {project.techStack.map((tech: string, techIndex: number) => (
                            <span
                              key={techIndex}
                              className="px-2 py-1 bg-gray-600/30 text-gray-300 text-xs rounded-full"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Collaborations Section */}
            {portfolio.collaborations && portfolio.collaborations.length > 0 && (
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <UserGroupIcon className="w-5 h-5 text-green-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Collaborated With</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {portfolio.collaborations.map((collaboration: any, index: number) => (
                    <div
                      key={index}
                      className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-white">{collaboration.collaborator_name}</h3>
                        <div className="flex items-center gap-1">
                          {collaboration.status === 'accepted' ? (
                            <CheckBadgeIcon className="h-4 w-4 text-green-400" />
                          ) : collaboration.status === 'declined' ? (
                            <XMarkIcon className="h-4 w-4 text-red-400" />
                          ) : (
                            <ClockIcon className="h-4 w-4 text-yellow-400" />
                          )}
                          <span className="text-xs text-gray-400">
                            {collaboration.status === 'accepted' ? 'Verified' : 
                             collaboration.status === 'declined' ? 'Declined' : 'Pending'}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-300 mb-1">{collaboration.project_title}</p>
                      <p className="text-sm text-gray-400 mb-2">Role: {collaboration.role}</p>
                      {collaboration.project_description && (
                        <p className="text-sm text-gray-400">{collaboration.project_description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
              <h3 className="text-lg font-semibold text-white mb-4">Get in Touch</h3>
              <div className="space-y-3">
                {portfolio.website_url && (
                  <a
                    href={portfolio.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 group"
                  >
                    <GlobeAltIcon className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
                    <span className="text-gray-300 group-hover:text-white">Website</span>
                    <ArrowTopRightOnSquareIcon className="w-4 h-4 text-gray-400 ml-auto" />
                  </a>
                )}
                {portfolio.github_url && (
                  <a
                    href={portfolio.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 group"
                  >
                    <CodeBracketIcon className="w-5 h-5 text-gray-400 group-hover:text-white" />
                    <span className="text-gray-300 group-hover:text-white">GitHub</span>
                    <ArrowTopRightOnSquareIcon className="w-4 h-4 text-gray-400 ml-auto" />
                  </a>
                )}
                {portfolio.linkedin_url && (
                  <a
                    href={portfolio.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 group"
                  >
                    <UserGroupIcon className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
                    <span className="text-gray-300 group-hover:text-white">LinkedIn</span>
                    <ArrowTopRightOnSquareIcon className="w-4 h-4 text-gray-400 ml-auto" />
                  </a>
                )}
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
              <h3 className="text-lg font-semibold text-white mb-4">Portfolio Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Skills</span>
                  <span className="text-white font-semibold">{portfolio.skills?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Projects</span>
                  <span className="text-white font-semibold">{portfolio.projects?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Collaborations</span>
                  <span className="text-white font-semibold">{portfolio.collaborations?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Member since</span>
                  <span className="text-white font-semibold">
                    {new Date(portfolio.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short' 
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Owner Actions */}
            {isOwner && (
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Portfolio Actions</h3>
                <div className="space-y-3">
                  <Link
                    href="/create-portfolio"
                    className="block w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-500 hover:to-purple-500 transition-all duration-300 font-medium text-center"
                  >
                    Edit Portfolio
                  </Link>
                  <Link
                    href="/profile"
                    className="block w-full px-4 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all duration-300 font-medium text-center"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}