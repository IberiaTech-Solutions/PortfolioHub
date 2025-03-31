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
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth");
        return;
      }

      setUser(user);

      // Fetch user's portfolio
      const { data: portfolioData } = await supabase
        .from("portfolios")
        .select("*")
        .eq("user_id", user.id)
        .single();

      setPortfolio(portfolioData as Portfolio);
      setLoading(false);
    };

    getUser();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Your Profile</h1>

            <div className="mb-6">
              <p className="text-gray-700">
                <span className="font-medium">Email:</span> {user!.email}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">ID:</span> {user!.id}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Email verified:</span>{" "}
                {user!.email_confirmed_at ? "Yes" : "No"}
              </p>
            </div>
          </div>
        </div>

        {portfolio ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">Your Portfolio</h2>
                <Link
                  href="/create-portfolio"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Edit Portfolio
                </Link>
              </div>

              <div className="mb-4">
                <p className="text-xl font-semibold">{portfolio.title}</p>
                <p className="text-gray-600">{portfolio.job_title}</p>
              </div>

              <div className="mb-4">
                <h3 className="font-medium mb-1">Skills</h3>
                <div className="flex flex-wrap gap-1">
                  {portfolio.skills &&
                    portfolio.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                </div>
              </div>

              <Link
                href={`/portfolio/${portfolio.id}`}
                className="text-blue-600 hover:underline"
              >
                View Public Profile →
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Create Your Portfolio</h2>
              <p className="mb-4">
                You have not created a portfolio yet. Create one to showcase
                your skills and projects!
              </p>
              <Link
                href="/create-portfolio"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Create Portfolio
              </Link>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <button
              onClick={handleSignOut}
              className="w-full px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
