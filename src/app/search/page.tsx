"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/utils/supabase";
import Link from "next/link";
import { useDebounce } from "use-debounce";

type Portfolio = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  website_url: string;
  github_url: string;
  linkedin_url: string;
  skills: string[];
  job_title: string;
  created_at: string;
  name: string;
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        const { data: portfoliosData, error } = await supabase
          .from("portfolios")
          .select("*")
          .textSearch("title", query)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setPortfolios(portfoliosData as Portfolio[]);
      } catch (error) {
        console.error("Error fetching portfolios:", error);
      }
    };

    if (query) {
      fetchPortfolios();
    }
  }, [query]);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {query ? `Search results for "${query}"` : "All Portfolios"}
        </h1>
        <p className="text-gray-600">
          {loading ? "Loading..." : `Found ${portfolios.length} results`}
        </p>
      </div>

      {!loading && portfolios.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No portfolios found</h2>
          <p className="text-gray-600 mb-6">
            Try a different search term or browse all portfolios
          </p>
          <Link
            href="/create-portfolio"
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-medium"
          >
            Create Your Portfolio
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolios.map((portfolio) => (
            <div
              key={portfolio.id}
              className="border rounded-lg overflow-hidden shadow-md bg-white hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-1">
                  {portfolio.title}
                </h3>
                <p className="text-gray-600 text-sm mb-2">
                  {portfolio.name} • {portfolio.job_title}
                </p>
                <p className="text-gray-700 mb-3 line-clamp-2">
                  {portfolio.description}
                </p>
                <div className="mb-4 flex flex-wrap gap-1">
                  {portfolio.skills &&
                    portfolio.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                      >
                        {skill}
                      </span>
                    ))}
                </div>
                <div className="flex justify-between">
                  <Link
                    href={`/portfolio/${portfolio.id}`}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    View Profile
                  </Link>
                  {portfolio.website_url && (
                    <a
                      href={portfolio.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:underline"
                    >
                      Visit Website →
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
