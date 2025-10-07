"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hasPortfolio, setHasPortfolio] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      
      // Check if user has a portfolio
      if (user) {
        const { data: portfolio } = await supabase
          .from("portfolios")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();
        
        setHasPortfolio(!!portfolio);
      }
      
      setLoading(false);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      
      // Check portfolio when user changes
      if (session?.user) {
        const { data: portfolio } = await supabase
          .from("portfolios")
          .select("id")
          .eq("user_id", session.user.id)
          .maybeSingle();
        
        setHasPortfolio(!!portfolio);
      } else {
        setHasPortfolio(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    setIsDropdownOpen(false);
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
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-brand-600 to-brand-700 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-display font-bold text-lg">PH</span>
              </div>
              <span className="text-2xl font-display font-semibold text-gray-900">PortfolioHub</span>
            </Link>
          </div>

          {/* Navigation Links & User Menu */}
          <div className="flex items-center space-x-4">
            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              {!loading && user && (
                <>
                  <Link
                    href="/create-portfolio"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      pathname === "/create-portfolio"
                        ? "bg-brand-600 text-white shadow-sm"
                        : "text-gray-600 hover:text-brand-600 hover:bg-brand-50"
                    }`}
                  >
                    {hasPortfolio ? "Edit Portfolio" : "Create Portfolio"}
                  </Link>
                  <Link
                    href="/collaborations"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      pathname === "/collaborations"
                        ? "bg-brand-600 text-white shadow-sm"
                        : "text-gray-600 hover:text-brand-600 hover:bg-brand-50"
                    }`}
                  >
                    Collaborations
                  </Link>
                </>
              )}
            </div>

            {/* User Avatar Dropdown */}
            {!loading && (
              <div className="relative user-dropdown">
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-medium text-sm">
                          {user.email?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[60]">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">
                            {user.email?.split('@')[0]}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user.email}
                          </p>
                        </div>
                        
                        <Link
                          href="/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <UserCircleIcon className="w-4 h-4 mr-3" />
                          Profile
                        </Link>
                        
                        <Link
                          href="/create-portfolio"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <Cog6ToothIcon className="w-4 h-4 mr-3" />
                          {hasPortfolio ? "Edit Portfolio" : "Create Portfolio"}
                        </Link>
                        
                        <div className="border-t border-gray-100 my-1"></div>
                        
                        <button
                          onClick={handleSignOut}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                        >
                          <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href="/auth"
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-brand-600 hover:bg-brand-50 transition-all duration-200"
                  >
                    <UserCircleIcon className="w-5 h-5" />
                    <span className="hidden sm:inline">Sign In</span>
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500"
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
