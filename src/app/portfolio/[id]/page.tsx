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
  profile_image?: string;
  hero_image?: string;
  github_url: string;
  linkedin_url: string;
  additional_links: Array<{label: string, url: string}>;
  skills: string[];
  projects: Array<{
    title: string;
    description: string;
    url: string;
    techStack: string[];
  }>;
  collaborations: Array<{
    id: string;
    collaborator_name: string;
    project_title: string;
    role: string;
    status: string;
  }>;
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
        .select(
          `
          *,
          collaborations(*)
        `
        )
        .eq("id", params.id)
        .single();

      if (error) {
        console.error("Error fetching portfolio:", error);
        router.push("/");
        return;
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce"></div>
          </div>
          <p className="text-gray-600">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <XMarkIcon className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">Portfolio not found</h2>
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

  const isOwner = user && user.id === portfolio.user_id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50/30 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Waves */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-brand-400/20 to-emerald-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-brand-400/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        
        {/* Floating Dots */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-brand-400/30 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
        <div className="absolute top-40 right-32 w-1.5 h-1.5 bg-emerald-400/40 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-32 left-32 w-2.5 h-2.5 bg-purple-400/30 rounded-full animate-bounce" style={{animationDelay: '3s'}}></div>
        
        {/* Network Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-5" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="network" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 10 20 M 0 10 L 20 10" stroke="currentColor" strokeWidth="0.5" fill="none"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#network)" className="text-brand-400"/>
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto py-16 px-6">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-white/90 backdrop-blur-sm border border-brand-300 rounded-full text-brand-800 text-sm font-bold mb-6 shadow-lg">
            <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            Professional Portfolio
          </div>
          
          {/* Profile Image */}
          <div className="flex justify-center mb-8">
            {portfolio.profile_image ? (
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-2xl">
                <img
                  src={portfolio.profile_image}
                  alt={`${portfolio.name} profile`}
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
          
          <h1 className="text-5xl md:text-6xl font-display font-bold text-gray-900 mb-6 leading-tight">
            {portfolio.name}
          </h1>
          <p className="text-2xl text-gray-600 mb-4">
            {portfolio.job_title}
          </p>
          <p className="text-xl text-gray-500">
            {portfolio.title}
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            {portfolio.description && (
              <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-8 shadow-xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-brand-600 to-brand-700 rounded-xl flex items-center justify-center shadow-xl">
                    <CodeBracketIcon className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-heading font-bold text-gray-900">About</h2>
                </div>
                <div className="text-gray-900 leading-relaxed space-y-4">
                  {portfolio.description.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="text-lg mb-4 last:mb-0 font-semibold">
                      {paragraph.trim()}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Skills Section */}
            {portfolio.skills && portfolio.skills.length > 0 && (
              <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-8 shadow-xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <StarIcon className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-heading font-bold text-gray-900">Skills</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  {portfolio.skills.map((skill, index) => {
                    const colors = [
                      'bg-gradient-to-r from-brand-500 to-brand-600 text-white border-brand-600',
                      'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-emerald-600',
                      'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-600',
                      'bg-gradient-to-r from-rose-500 to-rose-600 text-white border-rose-600',
                      'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-600',
                      'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-600'
                    ];
                    const colorClass = colors[index % colors.length];
                    return (
                      <span
                        key={index}
                        className={`${colorClass} px-4 py-2 rounded-xl text-sm font-bold border shadow-md`}
                      >
                        {skill}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Projects Section */}
            {portfolio.projects && portfolio.projects.length > 0 && (
              <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-8 shadow-xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <GlobeAltIcon className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-heading font-bold text-gray-900">Projects</h2>
                </div>
                <div className="grid gap-6">
                  {portfolio.projects.map((project, index) => (
                    <div key={index} className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
                      <h3 className="text-xl font-heading font-bold text-gray-900 mb-3">{project.title}</h3>
                      <p className="text-gray-900 mb-4 leading-relaxed font-bold">{project.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.techStack?.map((tech: string, techIndex: number) => (
                          <span
                            key={techIndex}
                            className="px-3 py-1 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg text-sm font-bold border border-gray-800 shadow-md"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 font-bold transition-all duration-200 px-4 py-3 rounded-xl shadow-lg hover:shadow-xl"
                      >
                        View Project
                        <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Collaborations Section */}
            {portfolio.collaborations && portfolio.collaborations.length > 0 && (
              <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-8 shadow-xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
                    <UserGroupIcon className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-heading font-bold text-gray-900">Collaborations</h2>
                </div>
                <div className="grid gap-4">
                  {portfolio.collaborations.map((collaboration, index) => (
                    <div key={index} className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-heading font-bold text-gray-900">{collaboration.collaborator_name}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold border shadow-md ${
                          collaboration.status === 'accepted' 
                            ? 'bg-emerald-500 text-white border-emerald-600' 
                            : collaboration.status === 'declined'
                            ? 'bg-red-500 text-white border-red-600'
                            : 'bg-amber-500 text-white border-amber-600'
                        }`}>
                          {collaboration.status}
                        </span>
                      </div>
                      <p className="text-gray-900 mb-2 font-bold">{collaboration.project_title}</p>
                      <p className="text-gray-800 text-sm font-semibold">Role: {collaboration.role}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Info */}
            <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-xl">
              <h3 className="text-xl font-heading font-bold text-gray-900 mb-6">Contact</h3>
              <div className="space-y-4">
                {portfolio.website_url && (
                  <a
                    href={portfolio.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-800 hover:text-brand-600 transition-colors duration-200 p-3 rounded-xl hover:bg-brand-50 font-medium"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-brand-600 to-brand-700 rounded-lg flex items-center justify-center shadow-lg">
                      <GlobeAltIcon className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-semibold">Website</span>
                  </a>
                )}
                {portfolio.github_url && (
                  <a
                    href={portfolio.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-800 hover:text-brand-600 transition-colors duration-200 p-3 rounded-xl hover:bg-brand-50 font-medium"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center shadow-lg">
                      <CodeBracketIcon className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-semibold">GitHub</span>
                  </a>
                )}
                {portfolio.linkedin_url && (
                  <a
                    href={portfolio.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-800 hover:text-brand-600 transition-colors duration-200 p-3 rounded-xl hover:bg-brand-50 font-medium"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg">
                      <UserGroupIcon className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-semibold">LinkedIn</span>
                  </a>
                )}
                
                {/* Additional Links */}
                {portfolio.additional_links && portfolio.additional_links.length > 0 && (
                  <>
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Additional Links</h4>
                      <div className="space-y-3">
                        {portfolio.additional_links.map((link, index) => (
                          <a
                            key={index}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 text-gray-800 hover:text-brand-600 transition-colors duration-200 p-3 rounded-xl hover:bg-brand-50 font-medium"
                          >
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                              <ArrowTopRightOnSquareIcon className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-semibold">{link.label}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Owner Actions */}
            {isOwner && (
              <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-xl">
                <h3 className="text-xl font-heading font-bold text-gray-900 mb-6">Actions</h3>
                <div className="space-y-4">
                  <Link
                    href="/create-portfolio"
                    className="block w-full px-6 py-3 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-black rounded-xl text-center font-bold transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
                  >
                    Edit Portfolio
                  </Link>
                  <Link
                    href="/profile"
                    className="block w-full px-6 py-3 bg-white hover:bg-gray-100 text-gray-900 rounded-xl text-center font-bold transition-all duration-300 border-2 border-gray-300 shadow-lg hover:shadow-xl hover:scale-105"
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