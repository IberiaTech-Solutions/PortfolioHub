"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
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

export default function PortfolioDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      setLoading(true);

      const { data: currentUser } = await supabase.auth.getUser();
      setUser(currentUser.user);

      const { data: portfolioData, error } = await supabase
        .from("portfolios")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error) {
        console.error("Error fetching portfolio:", error);
        if (error.code === "PGRST116") {
          // Record not found
          router.push("/");
          return;
        }
      }

      setPortfolio(portfolioData as Portfolio);
      setLoading(false);
    };

    if (params.id) {
      fetchPortfolio();
    }
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Portfolio not found
      </div>
    );
  }

  const isOwner = user && user.id === portfolio.user_id;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{portfolio.title}</h1>
              <p className="text-xl text-gray-600 mb-1">{portfolio.name}</p>
              <p className="text-gray-600">{portfolio.job_title}</p>
            </div>

            {isOwner && (
              <Link
                href="/create-portfolio"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Edit Portfolio
              </Link>
            )}
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">About</h2>
            <p className="text-gray-700 whitespace-pre-line">
              {portfolio.description}
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {portfolio.skills &&
                portfolio.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
            </div>
          </div>

          {portfolio.website_url && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3">Website</h2>
              <a
                href={portfolio.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center"
              >
                {portfolio.website_url}
                <span className="ml-1">↗</span>
              </a>
            </div>
          )}

          <div className="flex justify-between pt-4 border-t">
            <Link href="/" className="text-blue-600 hover:underline">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
