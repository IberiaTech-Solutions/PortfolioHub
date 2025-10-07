"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { User } from "@supabase/supabase-js";

export default function Navigation() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <nav className="bg-gradient-to-r from-gray-900 to-gray-800 shadow-lg relative z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between py-4">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="relative h-20 w-60">
                <Image
                  src="/images/PortFolioHub3.png"
                  alt="PortfolioHub Logo"
                  fill
                  sizes="240px"
                  className="object-contain"
                  priority
                />
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {!loading &&
              (user ? (
                <>
                  <Link
                    href="/create-portfolio"
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                      pathname === "/create-portfolio"
                        ? "bg-white text-gray-900"
                        : "bg-white/10 text-white hover:bg-white hover:text-gray-900"
                    }`}
                  >
                    {pathname === "/create-portfolio"
                      ? "Edit Portfolio"
                      : "Create Portfolio"}
                  </Link>
                    <Link
                      href="/profile"
                      className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                        pathname === "/profile"
                          ? "bg-white text-gray-900"
                          : "bg-white/10 text-white hover:bg-white hover:text-gray-900"
                      }`}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/collaborations"
                      className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                        pathname === "/collaborations"
                          ? "bg-white text-gray-900"
                          : "bg-white/10 text-white hover:bg-white hover:text-gray-900"
                      }`}
                    >
                      Collaborations
                    </Link>
                </>
              ) : (
                <Link
                  href="/auth"
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    pathname === "/auth"
                      ? "bg-white text-gray-900"
                      : "bg-white/10 text-white hover:bg-white hover:text-gray-900"
                  }`}
                >
                  Sign In / Sign Up
                </Link>
              ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
