"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/utils/supabase";

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

export default function Home() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    // If there's an initial query param, perform search
    if (searchParams.get("q")) {
      performSearch(searchParams.get("q") || "");
    }
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    // Update URL for shareable links, but don't navigate
    const newUrl = searchQuery ? `/?q=${encodeURIComponent(searchQuery)}` : "/";

    window.history.pushState({}, "", newUrl);

    performSearch(searchQuery);
  };

  const performSearch = async (query: string) => {
    setLoading(true);
    setHasSearched(true);

    const { data: portfoliosData, error } = await supabase
      .from("portfolios")
      .select("*");

    if (error) {
      console.error("Error fetching portfolios:", error);
      setLoading(false);
      return;
    }

    // Filter portfolios based on the search query
    let filteredPortfolios = portfoliosData as Portfolio[];

    if (query) {
      const lowerQuery = query.toLowerCase();
      filteredPortfolios = filteredPortfolios.filter(
        (portfolio) =>
          portfolio.title?.toLowerCase().includes(lowerQuery) ||
          portfolio.description?.toLowerCase().includes(lowerQuery) ||
          portfolio.job_title?.toLowerCase().includes(lowerQuery) ||
          portfolio.skills?.some((skill) =>
            skill.toLowerCase().includes(lowerQuery)
          )
      );
    }

    setPortfolios(filteredPortfolios || []);
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center bg-cover bg-center bg-fixed bg-no-repeat"
      style={{
        backgroundImage: "url('/portfolio.jpg')",
        backgroundColor: "rgba(0,0,0,0.7)",
        backgroundBlendMode: "overlay",
      }}
    >
      <div className="w-full max-w-4xl px-4 py-16 flex flex-col items-center">
        <h1 className="text-4xl font-bold mb-2 text-center text-white">
          PortfolioHub
        </h1>
        <p className="text-xl mb-8 text-center text-gray-200">
          Find talented people by skills, expertise, or job title
        </p>

        <form onSubmit={handleSearch} className="w-full max-w-xl mb-12">
          <div className="flex shadow-lg rounded-lg overflow-hidden">
            <input
              type="text"
              placeholder="Search by skill, expertise, or job title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow px-4 py-3 focus:outline-none text-lg"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-lg font-medium"
            >
              Search
            </button>
          </div>
        </form>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-lg">Loading results...</p>
          </div>
        ) : hasSearched ? (
          <div className="w-full bg-white bg-opacity-85 rounded-lg p-6 shadow-lg">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">
                {searchQuery
                  ? `Results for "${searchQuery}"`
                  : "All Portfolios"}
              </h2>
              <p className="text-gray-700">Found {portfolios.length} results</p>
            </div>

            {portfolios.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-2">
                  No portfolios found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try a different search term or browse all portfolios
                </p>
                <Link
                  href="/create-portfolio"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium"
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
        ) : (
          <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="border rounded-lg overflow-hidden shadow-md bg-white hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-2">
                    Create Your Portfolio
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Showcase your skills and projects to potential employers or
                    clients.
                  </p>
                  <Link
                    href="/auth"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium"
                  >
                    Get Started
                  </Link>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden shadow-md bg-white hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-2">
                    Discover Talent
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Find professionals with the exact skills and expertise
                    you&apos;re looking for.
                  </p>
                  <button
                    onClick={() => performSearch("")}
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium"
                  >
                    Browse All Portfolios
                  </button>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden shadow-md bg-white hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-2">
                    Connect & Collaborate
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Reach out to professionals and build your network with
                    talented individuals.
                  </p>
                  <Link
                    href="/auth"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium"
                  >
                    Join Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
