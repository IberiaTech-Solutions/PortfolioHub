"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { User } from "@supabase/supabase-js";

type Portfolio = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  website_url: string;
  website_screenshot: string;
  profile_image?: string;
  hero_image?: string;
  github_url: string;
  linkedin_url: string;
  location?: string;
  experience_level?: string;
  preferred_work_type?: string[];
  languages?: string;
  additional_links: Array<{label: string, url: string}>;
  skills: string[];
  projects: Array<{
    title: string;
    description: string;
    url: string;
    techStack: string[];
  }>;
  job_title: string;
  created_at: string;
  name: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      if (!supabase) {
        console.warn('Supabase not configured');
        router.push("/auth");
        return;
      }
      
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth");
        return;
      }

      setUser(user);

      // Fetch user's portfolio
      const { data: portfolioData, error: portfolioError } = await supabase
        .from("portfolios")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (portfolioError) {
        console.error('Error fetching portfolio:', portfolioError);
      }

      setPortfolio(portfolioData as Portfolio);
      setLoading(false);
    };

    getUser();
  }, [router]);

  const handleSignOut = async () => {
    if (!supabase) {
      console.warn('Supabase not configured');
      router.push("/auth");
      return;
    }
    
    await supabase.auth.signOut();
    router.push("/auth");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
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

      <div className="relative max-w-6xl mx-auto py-8 sm:py-12 lg:py-16 px-4 sm:px-6 space-y-8 sm:space-y-10 lg:space-y-12">
        {/* Profile Header */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl sm:rounded-2xl overflow-hidden shadow-xl">
          <div className="relative">
            {portfolio?.hero_image ? (
              <div className="h-32 sm:h-40 relative overflow-hidden">
                <Image
                  src={portfolio.hero_image}
                  alt={`${portfolio.name} hero`}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                {/* Fallback gradient */}
                <div className="hidden absolute inset-0 bg-gradient-to-r from-brand-500 via-brand-600 to-emerald-600"></div>
                {/* Overlay for better text readability */}
                <div className="absolute inset-0 bg-black/20"></div>
              </div>
            ) : (
              <div className="h-32 sm:h-40 bg-gradient-to-r from-brand-500 via-brand-600 to-emerald-600"></div>
            )}
            <div className="absolute -bottom-10 sm:-bottom-12 left-4 sm:left-8">
              {portfolio?.profile_image ? (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl overflow-hidden shadow-xl border-3 sm:border-4 border-white">
                  <Image
                    src={portfolio.profile_image}
                    alt={`${portfolio.name} profile`}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  {/* Fallback gradient */}
                  <div className="hidden w-full h-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">
                      {portfolio?.name?.charAt(0).toUpperCase() || user?.email?.split("@")[0]?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl sm:rounded-2xl shadow-xl flex items-center justify-center border-3 sm:border-4 border-white">
                  <span className="text-white font-bold text-2xl">
                    {portfolio?.name?.charAt(0).toUpperCase() || user?.email?.split("@")[0]?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="p-4 sm:p-6 lg:p-8 pt-16 sm:pt-18 lg:pt-20">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-6 sm:mb-8">
              <div className="mb-4 sm:mb-6 md:mb-0">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-white mb-1 sm:mb-2">
                  {portfolio?.name || user?.email?.split("@")[0] || "User"}
                </h1>
                <p className="text-lg sm:text-xl text-gray-200">
                  {portfolio ? portfolio.job_title : "Portfolio Creator"}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link
                  href="/create-portfolio"
                  className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white rounded-lg sm:rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 text-sm sm:text-base"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {portfolio ? "Edit Portfolio" : "Create Portfolio"}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg sm:rounded-xl font-semibold transition-all duration-300 border border-white/20 shadow-sm hover:shadow-md hover:scale-105 text-sm sm:text-base"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:gap-4">
              <div className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl border border-white/20 shadow-sm">
                <span className="p-2 sm:p-3 bg-gradient-to-br from-brand-500/20 to-brand-600/20 rounded-lg sm:rounded-xl">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 sm:h-6 sm:w-6 text-brand-300"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </span>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-300 uppercase tracking-wide">Email</p>
                  <p className="text-white font-semibold text-sm sm:text-base">{user!.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl border border-white/20 shadow-sm">
                <span className="p-2 sm:p-3 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-lg sm:rounded-xl">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-300"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-300 uppercase tracking-wide">Status</p>
                  <p className="text-white font-semibold text-sm sm:text-base">
                    {user!.email_confirmed_at ? (
                      <span className="inline-flex items-center space-x-2 text-emerald-600">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Verified Account</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-2 text-amber-600">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <span>Pending Verification</span>
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Section */}
        {portfolio ? (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 sm:mb-8 gap-4 sm:gap-0">
              <div>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-1 sm:mb-2">
                  Your Portfolio
                </h2>
                <p className="text-lg sm:text-xl text-gray-200">
                  Showcase your professional journey
                </p>
              </div>
              <Link
                href={`/portfolio/${portfolio.id}`}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white rounded-lg sm:rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 text-sm sm:text-base"
              >
                View Live Portfolio
              </Link>
            </div>

            <div className="space-y-6 sm:space-y-8">
              {/* Basic Information */}
              <div className="p-4 sm:p-6 bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/20 shadow-sm">
                <h3 className="text-xl sm:text-2xl font-heading font-bold text-white mb-3 sm:mb-4">Basic Information</h3>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <h4 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">{portfolio.name}</h4>
                    <p className="text-lg sm:text-xl text-gray-200 font-semibold mb-1 sm:mb-2">{portfolio.job_title}</p>
                    <p className="text-sm sm:text-base text-gray-300 font-medium">{portfolio.title}</p>
                  </div>
                  {portfolio.description && (
                    <div className="pt-3 sm:pt-4 border-t border-white/20">
                      <h5 className="text-sm sm:text-md font-semibold text-white mb-1 sm:mb-2">About</h5>
                      <p className="text-sm sm:text-base text-gray-300 leading-relaxed">{portfolio.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Information */}
              {(portfolio.location || portfolio.experience_level || (portfolio.preferred_work_type && portfolio.preferred_work_type.length > 0) || portfolio.languages) && (
                <div className="p-4 sm:p-6 bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/20 shadow-sm">
                  <h3 className="text-lg sm:text-xl font-heading font-bold text-white mb-4 sm:mb-6">Additional Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {portfolio.location && (
                      <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-white/5 rounded-lg">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-gray-300">Location</p>
                          <p className="text-white font-medium text-sm sm:text-base">{portfolio.location}</p>
                        </div>
                      </div>
                    )}
                    {portfolio.experience_level && (
                      <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-white/5 rounded-lg">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-gray-300">Experience Level</p>
                          <p className="text-white font-medium text-sm sm:text-base">{portfolio.experience_level}</p>
                        </div>
                      </div>
                    )}
                    {portfolio.preferred_work_type && portfolio.preferred_work_type.length > 0 && (
                      <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-white/5 rounded-lg">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-gray-300">Preferred Work Type</p>
                          <p className="text-white font-medium text-sm sm:text-base">
                            {portfolio.preferred_work_type.join(", ")}
                          </p>
                        </div>
                      </div>
                    )}
                    {portfolio.languages && (
                      <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-white/5 rounded-lg">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-rose-500 to-rose-600 rounded-lg flex items-center justify-center">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-gray-300">Languages</p>
                          <p className="text-white font-medium text-sm sm:text-base">{portfolio.languages}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Contact Information */}
              {(portfolio.website_url || portfolio.github_url || portfolio.linkedin_url || portfolio.additional_links?.length > 0) && (
                <div className="p-4 sm:p-6 bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/20 shadow-sm">
                  <h3 className="text-lg sm:text-xl font-heading font-bold text-white mb-4 sm:mb-6">Contact Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {portfolio.website_url && (
                      <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-white/5 rounded-lg">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-brand-600 to-brand-700 rounded-lg flex items-center justify-center">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-gray-300">Website</p>
                          <a href={portfolio.website_url} target="_blank" rel="noopener noreferrer" className="text-white hover:text-brand-300 transition-colors text-sm sm:text-base break-all">
                            {portfolio.website_url}
                          </a>
                        </div>
                      </div>
                    )}
                    {portfolio.github_url && (
                      <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-white/5 rounded-lg">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-gray-300">GitHub</p>
                          <a href={portfolio.github_url} target="_blank" rel="noopener noreferrer" className="text-white hover:text-brand-300 transition-colors text-sm sm:text-base break-all">
                            {portfolio.github_url}
                          </a>
                        </div>
                      </div>
                    )}
                    {portfolio.linkedin_url && (
                      <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-white/5 rounded-lg">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-gray-300">LinkedIn</p>
                          <a href={portfolio.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-white hover:text-brand-300 transition-colors text-sm sm:text-base break-all">
                            {portfolio.linkedin_url}
                          </a>
                        </div>
                      </div>
                    )}
                    {portfolio.additional_links?.map((link, index) => (
                      <div key={index} className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-white/5 rounded-lg">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-gray-300">{link.label}</p>
                          <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-white hover:text-brand-300 transition-colors text-sm sm:text-base break-all">
                            {link.url}
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {portfolio.skills && portfolio.skills.length > 0 && (
                <div className="p-4 sm:p-6 bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/20 shadow-sm">
                  <h3 className="text-lg sm:text-xl font-heading font-bold text-white mb-4 sm:mb-6">Skills & Expertise</h3>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
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
                          className={`${colorClass} px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold border shadow-md`}
                        >
                          {skill}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Projects */}
              {portfolio.projects && portfolio.projects.length > 0 && (
                <div className="p-4 sm:p-6 bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/20 shadow-sm">
                  <h3 className="text-lg sm:text-xl font-heading font-bold text-white mb-4 sm:mb-6">Featured Projects</h3>
                  <div className="grid gap-3 sm:gap-4">
                    {portfolio.projects.map((project, index) => (
                      <div key={index} className="p-3 sm:p-4 bg-white/5 rounded-lg border border-white/10">
                        <h4 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">{project.title}</h4>
                        <p className="text-sm sm:text-base text-gray-300 mb-2 sm:mb-3">{project.description}</p>
                        {project.techStack && project.techStack.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                            {project.techStack.map((tech, techIndex) => (
                              <span
                                key={techIndex}
                                className="px-2 py-1 bg-gray-700 text-gray-200 rounded text-xs font-medium"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-brand-300 hover:text-brand-200 transition-colors text-xs sm:text-sm"
                        >
                          View Project
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-12 shadow-xl">
            <div className="text-center max-w-lg mx-auto">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-brand-500/20 to-brand-600/20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 sm:h-10 sm:w-10 text-brand-300"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-3 sm:mb-4">
                Create Your Portfolio
              </h2>
              <p className="text-lg sm:text-xl text-gray-200 mb-6 sm:mb-8 leading-relaxed">
                Showcase your skills and experience to potential clients and
                employers. Stand out from the crowd with a professional
                portfolio.
              </p>
              <Link
                href="/create-portfolio"
                className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white rounded-lg sm:rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 text-sm sm:text-base"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Create Portfolio
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
