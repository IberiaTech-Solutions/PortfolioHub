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
  github_url: string;
  linkedin_url: string;
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          </div>
          <p className="text-gray-600">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XMarkIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-medium text-gray-900 mb-4">Portfolio not found</h2>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors duration-200 font-medium"
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
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto py-12 px-6">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light text-gray-900 mb-4">
            {portfolio.name}
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            {portfolio.job_title}
          </p>
          <p className="text-lg text-gray-500">
            {portfolio.title}
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            {portfolio.description && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <CodeBracketIcon className="w-4 h-4 text-gray-600" />
                  </div>
                  <h2 className="text-xl font-medium text-gray-900">About</h2>
                </div>
                <div className="text-gray-700 leading-relaxed space-y-4">
                  {portfolio.description.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 last:mb-0">
                      {paragraph.trim()}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Skills Section */}
            {portfolio.skills && portfolio.skills.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <StarIcon className="w-4 h-4 text-gray-600" />
                  </div>
                  <h2 className="text-xl font-medium text-gray-900">Skills</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {portfolio.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Projects Section */}
            {portfolio.projects && portfolio.projects.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <GlobeAltIcon className="w-4 h-4 text-gray-600" />
                  </div>
                  <h2 className="text-xl font-medium text-gray-900">Projects</h2>
                </div>
                <div className="grid gap-4">
                  {portfolio.projects.map((project, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-2">{project.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">{project.description}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {project.techStack?.map((tech: string, techIndex: number) => (
                          <span
                            key={techIndex}
                            className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                      >
                        View Project →
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Collaborations Section */}
            {portfolio.collaborations && portfolio.collaborations.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <UserGroupIcon className="w-4 h-4 text-gray-600" />
                  </div>
                  <h2 className="text-xl font-medium text-gray-900">Collaborations</h2>
                </div>
                <div className="grid gap-4">
                  {portfolio.collaborations.map((collaboration, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{collaboration.collaborator_name}</h3>
                        <span className={`px-2 py-1 rounded text-xs ${
                          collaboration.status === 'accepted' 
                            ? 'bg-green-100 text-green-700' 
                            : collaboration.status === 'declined'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {collaboration.status}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-1">{collaboration.project_title}</p>
                      <p className="text-gray-500 text-xs">Role: {collaboration.role}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Info */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Contact</h3>
              <div className="space-y-3">
                {portfolio.website_url && (
                  <a
                    href={portfolio.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-600 hover:text-gray-900"
                  >
                    <GlobeAltIcon className="w-4 h-4" />
                    Website
                  </a>
                )}
                {portfolio.github_url && (
                  <a
                    href={portfolio.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-600 hover:text-gray-900"
                  >
                    <CodeBracketIcon className="w-4 h-4" />
                    GitHub
                  </a>
                )}
                {portfolio.linkedin_url && (
                  <a
                    href={portfolio.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-600 hover:text-gray-900"
                  >
                    <UserGroupIcon className="w-4 h-4" />
                    LinkedIn
                  </a>
                )}
              </div>
            </div>

            {/* Owner Actions */}
            {isOwner && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
                <div className="space-y-3">
                  <Link
                    href="/create-portfolio"
                    className="block w-full px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-center font-medium transition-colors duration-200"
                  >
                    Edit Portfolio
                  </Link>
                  <Link
                    href="/profile"
                    className="block w-full px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-center font-medium transition-colors duration-200 border border-gray-200"
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