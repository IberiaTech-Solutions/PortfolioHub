"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { User } from "@supabase/supabase-js";
import { 
  UserCircleIcon, 
  ChevronDownIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from "@heroicons/react/24/outline";

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hasPortfolio, setHasPortfolio] = useState(false);
  const [mounted, setMounted] = useState(false);

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
        
        // Check if user has a portfolio
        if (user) {
          try {
            const { data: portfolio, error } = await supabase
              .from("portfolios")
              .select("id")
              .eq("user_id", user.id)
              .maybeSingle();
            
            if (error) {
              console.error('Error fetching portfolio:', error);
              setHasPortfolio(false);
            } else {
              setHasPortfolio(!!portfolio);
            }
          } catch (portfolioError) {
            console.error('Error checking portfolio:', portfolioError);
            setHasPortfolio(false);
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
      
      // Check portfolio when user changes
      if (session?.user && supabase) {
        try {
          const { data: portfolio, error } = await supabase
            .from("portfolios")
            .select("id")
            .eq("user_id", session.user.id)
            .maybeSingle();
          
          if (error) {
            console.error('Error fetching portfolio in auth state change:', error);
            setHasPortfolio(false);
          } else {
            setHasPortfolio(!!portfolio);
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
    console.log('Sign out clicked');
    setIsDropdownOpen(false);
    
    if (!supabase) {
      console.warn('Supabase not configured');
      router.push("/");
      return;
    }
    
    try {
      console.log('Attempting to sign out...');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        return;
      }
      
      console.log('Sign out successful');
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

  return (
    <nav className="bg-slate-900/95 backdrop-blur-md border-b border-slate-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <div className="w-48 h-48 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                <Image 
                  src="/images/Portfolio Hub Icon.png" 
                  alt="PortfolioHub Logo" 
                  width={192} 
                  height={192}
                  className="w-full h-full object-contain"
                />
              </div>
            </Link>
          </div>

          {/* Navigation Links & User Menu */}
          <div className="flex items-center space-x-4">
            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              {mounted && !loading && user && (
                <>
                  <Link
                    href="/#discover-talent"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      pathname === "/"
                        ? "bg-brand-600 text-white shadow-sm border-2 border-white/30"
                        : "text-gray-300 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    Browse Portfolios
                  </Link>
                  <Link
                    href="/create-portfolio"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      pathname === "/create-portfolio"
                        ? "bg-brand-600 text-white shadow-sm border-2 border-white/30"
                        : "text-gray-300 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    {hasPortfolio ? "Edit Portfolio" : "Create Portfolio"}
                  </Link>
                  <Link
                    href="/collaborations"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      pathname === "/collaborations"
                        ? "bg-brand-600 text-white shadow-sm border-2 border-white/30"
                        : "text-gray-300 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    Collaborations
                  </Link>
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
                          <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
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

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-slate-500"
              aria-expanded="false"
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
          </div>
        </div>
      </div>
    </nav>
  );
}
