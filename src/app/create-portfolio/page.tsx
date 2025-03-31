"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
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

export default function CreatePortfolioPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    name: "",
    job_title: "",
    description: "",
    website_url: "",
    skills: "",
  });
  const [existingPortfolio, setExistingPortfolio] = useState<Portfolio | null>(
    null
  );

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth?redirect=/create-portfolio");
        return;
      }

      setUser(user);

      // Check if user already has a portfolio
      const { data: portfolio } = await supabase
        .from("portfolios")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (portfolio) {
        setExistingPortfolio(portfolio as Portfolio);
        setFormData({
          title: portfolio.title || "",
          name: portfolio.name || "",
          job_title: portfolio.job_title || "",
          description: portfolio.description || "",
          website_url: portfolio.website_url || "",
          skills: portfolio.skills ? portfolio.skills.join(", ") : "",
        });
      }
    };

    checkAuth();
  }, [router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (!user) {
        throw new Error("You must be logged in to create a portfolio");
      }

      const portfolioData = {
        ...formData,
        skills: formData.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
        user_id: user.id,
      };

      if (existingPortfolio) {
        // Update existing portfolio
        const { error } = await supabase
          .from("portfolios")
          .update(portfolioData)
          .eq("id", existingPortfolio.id);

        if (error) throw error;
      } else {
        // Create new portfolio
        const { error } = await supabase
          .from("portfolios")
          .insert([portfolioData]);

        if (error) throw error;
      }

      router.push("/profile");
    } catch (error) {
      console.error("Error saving portfolio:", error);
      alert("Error saving portfolio. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Redirecting to login...
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">
        {existingPortfolio ? "Edit Your Portfolio" : "Create Your Portfolio"}
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-6"
      >
        <div className="mb-4">
          <label
            htmlFor="name"
            className="block text-gray-700 font-medium mb-2"
          >
            Your Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="John Doe"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="title"
            className="block text-gray-700 font-medium mb-2"
          >
            Portfolio Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Front-end Developer with 5 years experience"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="job_title"
            className="block text-gray-700 font-medium mb-2"
          >
            Job Title
          </label>
          <input
            type="text"
            id="job_title"
            name="job_title"
            value={formData.job_title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Senior Front-end Developer"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="description"
            className="block text-gray-700 font-medium mb-2"
          >
            About You / Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={5}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="A brief description about yourself, your experience, and what you're looking for"
          ></textarea>
        </div>

        <div className="mb-4">
          <label
            htmlFor="website_url"
            className="block text-gray-700 font-medium mb-2"
          >
            Website URL
          </label>
          <input
            type="url"
            id="website_url"
            name="website_url"
            value={formData.website_url}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://yourwebsite.com"
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="skills"
            className="block text-gray-700 font-medium mb-2"
          >
            Skills (comma separated)
          </label>
          <input
            type="text"
            id="skills"
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="React, TypeScript, NextJS, CSS"
          />
          <p className="text-sm text-gray-500 mt-1">
            Separate skills with commas. These will be used for search and
            filtering.
          </p>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium disabled:opacity-50"
          >
            {loading
              ? "Saving..."
              : existingPortfolio
              ? "Update Portfolio"
              : "Create Portfolio"}
          </button>
        </div>
      </form>
    </div>
  );
}
