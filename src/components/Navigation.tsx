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
    <nav className="bg-white border-b border-gray-200 relative z-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between py-4">
          <div className="flex">
            {pathname !== "/collaborations" && (
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="relative h-12 w-48">
                  <Image
                    src="/images/PortFolioHub3.png"
                    alt="PortfolioHub Logo"
                    fill
                    sizes="192px"
                    className="object-contain"
                    priority
                  />
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-6">
            {!loading &&
              (user ? (
                <>
                  <Link
                    href="/create-portfolio"
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      pathname === "/create-portfolio"
                        ? "bg-gray-900 text-white"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    {pathname === "/create-portfolio"
                      ? "Edit Portfolio"
                      : "Create Portfolio"}
                  </Link>
                  <Link
                    href="/profile"
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      pathname === "/profile"
                        ? "bg-gray-900 text-white"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/collaborations"
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      pathname === "/collaborations"
                        ? "bg-gray-900 text-white"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    Collaborations
                  </Link>
                </>
              ) : (
                <Link
                  href="/auth"
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    pathname === "/auth"
                      ? "bg-gray-900 text-white"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  Sign In
                </Link>
              ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
