"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User } from "@supabase/supabase-js";

type Portfolio = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  website_url: string;
  github_url: string;
  skills: string[];
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

      <div className="relative max-w-6xl mx-auto py-16 px-6 space-y-12">
        {/* Profile Header */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden shadow-xl">
          <div className="relative">
            <div className="h-40 bg-gradient-to-r from-brand-500 via-brand-600 to-emerald-600"></div>
            <div className="absolute -bottom-12 left-8">
              <div className="w-24 h-24 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl shadow-xl flex items-center justify-center border-4 border-white">
                <span className="text-white font-bold text-2xl">
                  {user?.email?.split("@")[0]?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
            </div>
          </div>
          <div className="p-8 pt-20">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8">
              <div className="mb-6 md:mb-0">
                <h1 className="text-4xl font-display font-bold text-white mb-2">
                  {user?.email?.split("@")[0] || "User"}
                </h1>
                <p className="text-xl text-gray-200">
                  {portfolio ? portfolio.job_title : "Portfolio Creator"}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/create-portfolio"
                  className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
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
                  className="inline-flex items-center justify-center px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-all duration-300 border border-white/20 shadow-sm hover:shadow-md hover:scale-105"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
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

            <div className="grid gap-4">
              <div className="flex items-center space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 shadow-sm">
                <span className="p-3 bg-gradient-to-br from-brand-500/20 to-brand-600/20 rounded-xl">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-brand-300"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Email</p>
                  <p className="text-white font-semibold">{user!.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 shadow-sm">
                <span className="p-3 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-xl">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-emerald-300"
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
                  <p className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Status</p>
                  <p className="text-white font-semibold">
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
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-xl">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-3xl font-display font-bold text-white mb-2">
                  Your Portfolio
                </h2>
                <p className="text-xl text-gray-200">
                  Showcase your professional journey
                </p>
              </div>
              <Link
                href={`/portfolio/${portfolio.id}`}
                className="px-6 py-3 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                View Live Portfolio
              </Link>
            </div>

            <div className="space-y-8">
              <div className="p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 shadow-sm">
                <h3 className="text-2xl font-heading font-bold text-white mb-3">
                  {portfolio.title}
                </h3>
                <p className="text-xl text-gray-200 font-semibold mb-4">
                  {portfolio.job_title}
                </p>
                <p className="text-gray-300 leading-relaxed">
                  {portfolio.description}
                </p>
              </div>

              <div className="p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 shadow-sm">
                <h3 className="text-xl font-heading font-bold text-white mb-6">
                  Skills & Expertise
                </h3>
                <div className="flex flex-wrap gap-3">
                  {portfolio.skills &&
                    portfolio.skills.map((skill, index) => {
                      const colors = [
                        'bg-gradient-to-r from-brand-100 to-brand-200 text-brand-800 border-brand-300',
                        'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 border-emerald-300',
                        'bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 border-amber-300',
                        'bg-gradient-to-r from-rose-100 to-rose-200 text-rose-800 border-rose-300',
                        'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300',
                        'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-300'
                      ];
                      const colorClass = colors[index % colors.length];
                      return (
                        <span
                          key={index}
                          className={`${colorClass} px-4 py-2 rounded-xl text-sm font-semibold border shadow-sm`}
                        >
                          {skill}
                        </span>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-12 shadow-xl">
            <div className="text-center max-w-lg mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-brand-500/20 to-brand-600/20 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-brand-300"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <h2 className="text-3xl font-display font-bold text-white mb-4">
                Create Your Portfolio
              </h2>
              <p className="text-xl text-gray-200 mb-8 leading-relaxed">
                Showcase your skills and experience to potential clients and
                employers. Stand out from the crowd with a professional
                portfolio.
              </p>
              <Link
                href="/create-portfolio"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
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
