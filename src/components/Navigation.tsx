"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { User } from "@supabase/supabase-js";
import {
  UserCircleIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
  ArrowRightEndOnRectangleIcon,
  SparklesIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";
import { LogoFull, LogoIcon } from "@/components/Logo";

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hasPortfolio, setHasPortfolio] = useState(false);
  const [userRole, setUserRole] = useState<string>("candidate");
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const getUser = async () => {
      if (!supabase) {
        console.warn('Supabase not configured');
        setLoading(false);
        return;
      }
      
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);
        
        // Check role: admin from auth metadata, candidate/recruiter from portfolio
        if (user) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const authRole = (user as any).app_metadata?.role;
          if (authRole === "admin") {
            setUserRole("admin");
            setHasPortfolio(false);
          } else {
            try {
              const { data: portfolio, error } = await supabase
                .from("portfolios")
                .select("id, user_role")
                .eq("user_id", user.id)
                .maybeSingle();

              if (error) {
                console.error('Error fetching portfolio:', error);
                setHasPortfolio(false);
              } else {
                setHasPortfolio(!!portfolio);
                if (portfolio && 'user_role' in portfolio && typeof portfolio.user_role === 'string') setUserRole(portfolio.user_role);
              }
            } catch (portfolioError) {
              console.error('Error checking portfolio:', portfolioError);
              setHasPortfolio(false);
            }
          }
        }
      } catch (error) {
        console.error('Error getting user:', error);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    if (!supabase) {
      setLoading(false);
      return;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      
      // Check role when user changes
      if (session?.user && supabase) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const authRole = (session.user as any).app_metadata?.role;
        if (authRole === "admin") {
          setUserRole("admin");
          setHasPortfolio(false);
          return;
        }
        try {
          const { data: portfolio, error } = await supabase
            .from("portfolios")
            .select("id, user_role")
            .eq("user_id", session.user.id)
            .maybeSingle();

          if (error) {
            console.error('Error fetching portfolio in auth state change:', error);
            setHasPortfolio(false);
          } else {
            setHasPortfolio(!!portfolio);
            if (portfolio && 'user_role' in portfolio && typeof portfolio.user_role === 'string') setUserRole(portfolio.user_role);
          }
        } catch (portfolioError) {
          console.error('Error checking portfolio in auth state change:', portfolioError);
          setHasPortfolio(false);
        }
      } else {
        setHasPortfolio(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    setIsDropdownOpen(false);

    if (!supabase) {
      console.warn('Supabase not configured');
      router.push("/");
      return;
    }

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Sign out error:', error);
        return;
      }

      router.push("/");
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDropdownOpen) {
        const target = event.target as Element;
        if (!target.closest('.user-dropdown')) {
          setIsDropdownOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuOpen) {
        const target = event.target as Element;
        if (!target.closest('.mobile-menu')) {
          setMobileMenuOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  return (
    <nav className="bg-slate-900/95 backdrop-blur-md border-b border-slate-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16 lg:h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <LogoFull className="hidden sm:block" />
              <LogoIcon className="sm:hidden w-8 h-8" />
            </Link>
          </div>

          {/* Desktop Navigation & User Menu + Mobile Hamburger */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="mobile-menu md:hidden inline-flex items-center justify-center p-2 -mr-2 rounded-lg text-white hover:text-gray-200 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-slate-500 transition-all duration-200"
              aria-expanded={mobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="block h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {/* Desktop Navigation & User Menu */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Desktop Navigation Links */}
              <div className="flex items-center space-x-0.5 lg:space-x-1">
                {mounted && !loading && user && (
                  <>
                    {userRole === "admin" ? (
                      <>
                        <Link
                          href="/admin"
                          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            pathname === "/admin" ? "bg-rose-600 text-white" : "text-gray-300 hover:text-white hover:bg-slate-800"
                          }`}
                        >
                          Dashboard
                        </Link>
                        <Link
                          href="/admin/users"
                          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            pathname === "/admin/users" ? "bg-rose-600 text-white" : "text-gray-300 hover:text-white hover:bg-slate-800"
                          }`}
                        >
                          Users
                        </Link>
                        <Link
                          href="/admin/jobs"
                          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            pathname === "/admin/jobs" ? "bg-rose-600 text-white" : "text-gray-300 hover:text-white hover:bg-slate-800"
                          }`}
                        >
                          Jobs
                        </Link>
                        <Link
                          href="/admin/reports"
                          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            pathname === "/admin/reports" ? "bg-rose-600 text-white" : "text-gray-300 hover:text-white hover:bg-slate-800"
                          }`}
                        >
                          Reports
                        </Link>
                      </>
                    ) : userRole === "candidate" ? (
                      <>
                        <Link
                          href="/check-fit"
                          className={`px-2 lg:px-3 py-2 rounded-md text-sm font-bold transition-colors ${
                            pathname === "/check-fit" ? "bg-brand-600 text-white" : "text-brand-300 hover:text-white hover:bg-slate-800"
                          }`}
                        >
                          Check Fit
                        </Link>
                        <Link
                          href="/jobs"
                          className={`px-2 lg:px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            pathname === "/jobs" ? "bg-brand-600 text-white" : "text-gray-300 hover:text-white hover:bg-slate-800"
                          }`}
                        >
                          Jobs
                        </Link>
                        <Link
                          href="/create-portfolio"
                          className={`px-2 lg:px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            pathname === "/create-portfolio" ? "bg-brand-600 text-white" : "text-gray-300 hover:text-white hover:bg-slate-800"
                          }`}
                        >
                          {hasPortfolio ? "My Profile" : "Profile"}
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/recruiter"
                          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            pathname === "/recruiter" ? "bg-brand-600 text-white" : "text-gray-300 hover:text-white hover:bg-slate-800"
                          }`}
                        >
                          Dashboard
                        </Link>
                        <Link
                          href="/#discover-talent"
                          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            pathname === "/" ? "bg-brand-600 text-white" : "text-gray-300 hover:text-white hover:bg-slate-800"
                          }`}
                        >
                          Browse Talent
                        </Link>
                        <Link
                          href="/jobs/post"
                          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            pathname === "/jobs/post" ? "bg-brand-600 text-white" : "text-gray-300 hover:text-white hover:bg-slate-800"
                          }`}
                        >
                          Post a Job
                        </Link>
                        <Link
                          href="/jobs"
                          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            pathname === "/jobs" ? "bg-brand-600 text-white" : "text-gray-300 hover:text-white hover:bg-slate-800"
                          }`}
                        >
                          My Jobs
                        </Link>
                      </>
                    )}
                  </>
                )}
                {/* Show loading state for navigation links */}
                {mounted && loading && (
                  <div className="flex items-center space-x-1">
                    <div className="px-3 py-2 rounded-md text-sm font-medium text-gray-400 animate-pulse">
                      Loading...
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar Dropdown */}
              {mounted && !loading && (
                <div className="relative user-dropdown">
                  {user ? (
                    <div className="relative">
                      <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-800 transition-colors duration-200"
                      >
                        <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {user.email?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <ChevronDownIcon className="w-4 h-4 text-gray-300" />
                      </button>

                      {/* Dropdown Menu */}
                      {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-slate-800 rounded-lg shadow-xl border border-slate-700 py-2 z-[60]">
                          <div className="px-4 py-2 border-b border-slate-700">
                            <p className="text-sm font-medium text-white">
                              {user.email?.split('@')[0]}
                            </p>
                            <p className="text-xs text-gray-300 truncate">
                              {user.email}
                            </p>
                            <span className={`inline-flex items-center mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              userRole === "admin"
                                ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                                : userRole === "recruiter"
                                ? "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                                : "bg-brand-500/15 text-brand-400 border border-brand-500/30"
                            }`}>
                              {userRole}
                            </span>
                          </div>
                          
                          <Link
                            href="/profile"
                            className="flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-slate-700 transition-colors duration-200"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <UserCircleIcon className="w-4 h-4 mr-3" />
                            Profile
                          </Link>
                          
                          <Link
                            href="/create-portfolio"
                            className="flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-slate-700 transition-colors duration-200"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <Cog6ToothIcon className="w-4 h-4 mr-3" />
                            {hasPortfolio ? "Edit Portfolio" : "Create Portfolio"}
                          </Link>
                          
                          <div className="border-t border-slate-700 my-1"></div>
                          
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleSignOut();
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-200 hover:bg-slate-700 transition-colors duration-200"
                          >
                            <ArrowRightEndOnRectangleIcon className="w-4 h-4 mr-3" />
                            Sign Out
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Link
                        href="/check-fit"
                        className={`px-3 py-2 rounded-md text-sm font-bold transition-colors ${
                          pathname === "/check-fit" ? "bg-brand-600 text-white" : "text-brand-300 hover:text-white hover:bg-slate-800"
                        }`}
                      >
                        Check Fit
                      </Link>
                      <Link
                        href="/jobs"
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          pathname === "/jobs" ? "bg-brand-600 text-white" : "text-gray-300 hover:text-white hover:bg-slate-800"
                        }`}
                      >
                        Jobs
                      </Link>
                      <Link
                        href="/pricing"
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          pathname === "/pricing" ? "bg-brand-600 text-white" : "text-gray-300 hover:text-white hover:bg-slate-800"
                        }`}
                      >
                        Pricing
                      </Link>
                      <Link
                        href="/auth?mode=signin"
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          pathname === "/auth" && searchParams.get("mode") === "signin"
                            ? "bg-brand-600 text-white shadow-sm border-2 border-white/30"
                            : "text-gray-300 hover:text-white hover:bg-slate-800 border border-transparent hover:border-white/30"
                        }`}
                      >
                        <UserCircleIcon className="w-5 h-5" />
                        <span className="hidden sm:inline">Sign In</span>
                      </Link>
                      <Link
                        href="/auth?mode=signup"
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          pathname === "/auth" && searchParams.get("mode") === "signup"
                            ? "bg-brand-600 text-white shadow-sm border-2 border-white/30"
                            : "text-gray-300 hover:text-white hover:bg-slate-800 border border-transparent hover:border-white/30"
                        }`}
                      >
                        <span className="hidden sm:inline">Sign Up</span>
                        <span className="sm:hidden">Sign Up</span>
                      </Link>
                    </div>
                  )}
                </div>
              )}
              
              {/* Show loading state for user menu */}
              {mounted && loading && (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-slate-700 rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu panel */}
      {mobileMenuOpen && (
        <div className="mobile-menu md:hidden bg-slate-900/98 backdrop-blur-md border-b border-slate-700">
          <div className="px-3 py-2 space-y-1">
            {/* User Info Section (if logged in) */}
            {mounted && !loading && user && (
              <div className="flex items-center space-x-2 p-2 mb-1 bg-slate-800/30 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user.email?.split('@')[0]}
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Links */}
            {mounted && !loading && user && (
              <div className="space-y-1">
                <Link
                  href="/#discover-talent"
                  className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    pathname === "/"
                      ? "bg-brand-600 text-white"
                      : "text-gray-300 hover:text-white hover:bg-slate-800"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Browse Portfolios
                </Link>
                <Link
                  href="/create-portfolio"
                  className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    pathname === "/create-portfolio"
                      ? "bg-brand-600 text-white"
                      : "text-gray-300 hover:text-white hover:bg-slate-800"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  {hasPortfolio ? "Edit Portfolio" : "Create Portfolio"}
                </Link>
                <Link
                  href="/jobs"
                  className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    pathname === "/jobs"
                      ? "bg-brand-600 text-white"
                      : "text-gray-300 hover:text-white hover:bg-slate-800"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Jobs
                </Link>
                <Link
                  href="/check-fit"
                  className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    pathname === "/check-fit"
                      ? "bg-brand-600 text-white"
                      : "text-gray-300 hover:text-white hover:bg-slate-800"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <SparklesIcon className="w-4 h-4 mr-3" />
                  Check Fit
                </Link>
                <Link
                  href="/applications"
                  className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    pathname === "/applications"
                      ? "bg-brand-600 text-white"
                      : "text-gray-300 hover:text-white hover:bg-slate-800"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <BriefcaseIcon className="w-4 h-4 mr-3" />
                  Applications
                </Link>
                <Link
                  href="/collaborations"
                  className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    pathname === "/collaborations"
                      ? "bg-brand-600 text-white"
                      : "text-gray-300 hover:text-white hover:bg-slate-800"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Collaborations
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-slate-800 transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserCircleIcon className="w-4 h-4 mr-3" />
                  Profile
                </Link>
              </div>
            )}

            {/* Auth Buttons (if not logged in) */}
            {mounted && !loading && !user && (
              <div className="space-y-1">
                <Link
                  href="/auth?mode=signin"
                  className={`flex items-center justify-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    pathname === "/auth" && searchParams.get("mode") === "signin"
                      ? "bg-brand-600 text-white"
                      : "text-gray-300 hover:text-white hover:bg-slate-800"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserCircleIcon className="w-4 h-4 mr-2" />
                  Sign In
                </Link>
                <Link
                  href="/auth?mode=signup"
                  className="flex items-center justify-center px-3 py-2.5 rounded-lg text-sm font-medium bg-brand-600 hover:bg-brand-700 text-white transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Sign Out Button (if logged in) */}
            {mounted && !loading && user && (
              <div className="pt-1">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-300 hover:text-red-200 hover:bg-red-900/20 transition-colors duration-200"
                >
                  <ArrowRightEndOnRectangleIcon className="w-4 h-4 mr-3" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
