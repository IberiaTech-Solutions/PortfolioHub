"use client";

import Link from "next/link";
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
    <nav className="bg-white shadow-md">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold">
                PortfolioHub
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {!loading &&
              (user ? (
                <>
                  <Link
                    href="/create-portfolio"
                    className={`px-3 py-2 rounded-md ${
                      pathname === "/create-portfolio"
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {pathname === "/create-portfolio"
                      ? "Edit Portfolio"
                      : "Create Portfolio"}
                  </Link>
                  <Link
                    href="/profile"
                    className={`px-3 py-2 rounded-md ${
                      pathname === "/profile"
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Profile
                  </Link>
                </>
              ) : (
                <Link
                  href="/auth"
                  className={`px-3 py-2 rounded-md ${
                    pathname === "/auth"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
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
