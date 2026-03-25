"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { User } from "@supabase/supabase-js";

export type UserRole = "candidate" | "admin";

interface AuthState {
  user: User | null;
  role: UserRole;
  loading: boolean;
  hasPortfolio: boolean;
  isAdmin: boolean;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>("candidate");
  const [loading, setLoading] = useState(true);
  const [hasPortfolio, setHasPortfolio] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const init = async () => {
      try {
        const { data: { user } } = await supabase!.auth.getUser();
        setUser(user);

        if (user) {
          // Check admin from auth metadata
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const authRole = (user as any).app_metadata?.role;
          if (authRole === "admin") {
            setRole("admin");
          } else {
            // Check portfolio for candidate role
            const { data: portfolio } = await supabase!
              .from("portfolios")
              .select("id, user_role")
              .eq("user_id", user.id)
              .maybeSingle();

            setHasPortfolio(!!portfolio);
            if (portfolio && typeof (portfolio as { user_role?: string }).user_role === "string") {
              setRole((portfolio as { user_role: string }).user_role as UserRole);
            }
          }
        }
      } catch (error) {
        console.error("Auth init error:", error);
      } finally {
        setLoading(false);
      }
    };

    init();

    const { data: { subscription } } = supabase!.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setRole("candidate");
        setHasPortfolio(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    role,
    loading,
    hasPortfolio,
    isAdmin: role === "admin",
  };
}
