"use client";

import { useEffect, useState, Fragment } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import { User } from "@supabase/supabase-js";
import { Combobox, Transition } from "@headlessui/react";
import {
  CheckIcon,
  ChevronUpDownIcon,
  XMarkIcon,
  PlusIcon,
} from "@heroicons/react/20/solid";

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

type Skill = {
  id: string;
  name: string;
  category: string;
};

export default function CreatePortfolioPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [predefinedSkills, setPredefinedSkills] = useState<Skill[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: "", category: "" });
  const [formData, setFormData] = useState({
    title: "",
    name: "",
    job_title: "",
    description: "",
    website_url: "",
    github_url: "",
    linkedin_url: "",
  });
  const [existingPortfolio, setExistingPortfolio] = useState<Portfolio | null>(
    null
  );

  const categories = [
    "Programming Languages",
    "Frontend",
    "Backend",
    "Database",
    "DevOps",
    "Design",
    "Mobile",
    "Other",
  ];

  useEffect(() => {
    const fetchSkills = async () => {
      const { data: skills, error } = await supabase
        .from("predefined_skills")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching skills:", error);
        return;
      }

      setPredefinedSkills(skills);
    };

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
          github_url: portfolio.github_url || "",
          linkedin_url: portfolio.linkedin_url || "",
        });
        setSelectedSkills(portfolio.skills || []);
      }
    };

    fetchSkills();
    checkAuth();
  }, [router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const filteredSkills =
    query === ""
      ? predefinedSkills
      : predefinedSkills.filter((skill) =>
          skill.name.toLowerCase().includes(query.toLowerCase())
        );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (!user) {
        throw new Error("You must be logged in to create a portfolio");
      }

      const portfolioData = {
        ...formData,
        skills: selectedSkills,
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
      setLoading(false); // Make sure to reset loading state on error
      return; // Prevent navigation on error
    }
  };

  const handleAddNewSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!newSkill.name || !newSkill.category) {
      alert("Please fill in both skill name and category");
      return;
    }

    try {
      setLoading(true);

      // Check if skill already exists
      const { data: existingSkills, error: searchError } = await supabase
        .from("predefined_skills")
        .select("name")
        .eq("name", newSkill.name.trim());

      if (searchError) {
        console.error("Error checking existing skills:", searchError);
        throw searchError;
      }

      if (existingSkills && existingSkills.length > 0) {
        alert("This skill already exists!");
        setLoading(false);
        return;
      }

      // Insert the new skill into the database
      const { data, error: insertError } = await supabase
        .from("predefined_skills")
        .insert([
          {
            name: newSkill.name.trim(),
            category: newSkill.category,
          },
        ])
        .select()
        .single();

      if (insertError) {
        console.error("Error inserting new skill:", insertError);
        throw insertError;
      }

      if (!data) {
        throw new Error("No data returned after inserting skill");
      }

      // Add to local state
      setPredefinedSkills((prev) => [...prev, data]);
      setSelectedSkills((prev) => [...prev, data.name]);

      // Reset form
      setNewSkill({ name: "", category: "" });
      setIsAddingSkill(false);
      setQuery("");

      // Show success message
      alert("Skill added successfully!");
    } catch (error) {
      console.error("Error adding new skill:", error);
      alert("Error adding new skill. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Separate modal component to prevent form nesting
  const AddSkillModal = () => (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="bg-gray-800 rounded-xl p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-semibold text-white mb-4">Add New Skill</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Skill Name
            </label>
            <input
              type="text"
              value={newSkill.name}
              onChange={(e) =>
                setNewSkill({ ...newSkill, name: e.target.value })
              }
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter skill name"
              required
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Category
            </label>
            <select
              value={newSkill.category}
              onChange={(e) =>
                setNewSkill({ ...newSkill, category: e.target.value })
              }
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsAddingSkill(false);
                setNewSkill({ name: "", category: "" });
              }}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddNewSkill}
              disabled={loading || !newSkill.name || !newSkill.category}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Skill"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="flex items-center space-x-3">
          <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-4 h-4 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8 px-4">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold mb-8 text-white">
          {existingPortfolio ? "Edit Your Portfolio" : "Create Your Portfolio"}
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 space-y-6"
        >
          <div className="space-y-2">
            <label htmlFor="name" className="block text-gray-300 font-medium">
              Your Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="title" className="block text-gray-300 font-medium">
              Portfolio Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Front-end Developer with 5 years experience"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="job_title"
              className="block text-gray-300 font-medium"
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
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Senior Front-end Developer"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="description"
              className="block text-gray-300 font-medium"
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
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="A brief description about yourself, your experience, and what you're looking for"
            ></textarea>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="website_url"
              className="block text-gray-300 font-medium"
            >
              Website URL
            </label>
            <input
              type="url"
              id="website_url"
              name="website_url"
              value={formData.website_url}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="https://yourwebsite.com"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="github_url"
              className="block text-gray-300 font-medium"
            >
              GitHub URL
            </label>
            <input
              type="url"
              id="github_url"
              name="github_url"
              value={formData.github_url}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="https://github.com/yourusername"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="linkedin_url"
              className="block text-gray-300 font-medium"
            >
              LinkedIn URL
            </label>
            <input
              type="url"
              id="linkedin_url"
              name="linkedin_url"
              value={formData.linkedin_url}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-gray-300 font-medium">Skills</label>
            <div className="relative">
              <Combobox
                value={selectedSkills}
                onChange={setSelectedSkills}
                multiple
              >
                <div className="relative">
                  <div className="relative w-full cursor-default overflow-hidden rounded-xl bg-white/5 border border-white/10 text-left focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 transition-all duration-200">
                    <div className="flex flex-wrap gap-2 p-3">
                      {selectedSkills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-300 text-sm font-medium border border-blue-500/20 hover:bg-blue-500/30 transition-colors duration-200"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setSelectedSkills(
                                selectedSkills.filter((s) => s !== skill)
                              );
                            }}
                            className="ml-2 hover:text-blue-200 focus:outline-none"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </span>
                      ))}
                      <Combobox.Input
                        className="bg-transparent border-none px-2 py-1 text-gray-200 placeholder-gray-400 focus:outline-none flex-1 min-w-[120px]"
                        placeholder="Search skills..."
                        onChange={(event) => setQuery(event.target.value)}
                        displayValue={() => ""}
                      />
                    </div>
                    <Combobox.Button className="absolute inset-y-0 right-0 flex items-center px-3 focus:outline-none">
                      <ChevronUpDownIcon
                        className="h-5 w-5 text-gray-400 hover:text-gray-300 transition-colors duration-200"
                        aria-hidden="true"
                      />
                    </Combobox.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                    afterLeave={() => setQuery("")}
                  >
                    <Combobox.Options className="absolute mt-2 max-h-[280px] w-full overflow-auto rounded-xl bg-gray-800 border border-white/10 py-2 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                      {filteredSkills.length === 0 && query !== "" ? (
                        <div className="px-4 py-3 border-b border-white/5">
                          <p className="text-gray-400 mb-2">
                            No matching skills found.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingSkill(true);
                              setNewSkill({ ...newSkill, name: query });
                            }}
                            className="inline-flex items-center text-sm text-blue-400 hover:text-blue-300"
                          >
                            <PlusIcon className="h-4 w-4 mr-1" />
                            Add &ldquo;{query}&rdquo; as a new skill
                          </button>
                        </div>
                      ) : (
                        Object.entries(
                          filteredSkills.reduce((acc, skill) => {
                            if (!acc[skill.category]) {
                              acc[skill.category] = [];
                            }
                            acc[skill.category].push(skill);
                            return acc;
                          }, {} as Record<string, typeof filteredSkills>)
                        ).map(([category, skills]) => (
                          <div key={category}>
                            <div className="sticky top-0 bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-400 border-b border-white/5">
                              {category}
                            </div>
                            {skills.map((skill) => (
                              <Combobox.Option
                                key={skill.id}
                                className={({ active }) =>
                                  `relative cursor-pointer select-none py-3 pl-10 pr-4 ${
                                    active
                                      ? "bg-blue-500/20 text-blue-300"
                                      : "text-gray-300"
                                  }`
                                }
                                value={skill.name}
                              >
                                {({ selected, active }) => (
                                  <>
                                    <span
                                      className={`block truncate ${
                                        selected ? "font-medium" : "font-normal"
                                      }`}
                                    >
                                      {skill.name}
                                    </span>
                                    {selected ? (
                                      <span
                                        className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                          active
                                            ? "text-blue-300"
                                            : "text-blue-400"
                                        }`}
                                      >
                                        <CheckIcon
                                          className="h-5 w-5"
                                          aria-hidden="true"
                                        />
                                      </span>
                                    ) : null}
                                  </>
                                )}
                              </Combobox.Option>
                            ))}
                          </div>
                        ))
                      )}
                      <div className="px-4 py-3 border-t border-white/5">
                        <button
                          type="button"
                          onClick={() => setIsAddingSkill(true)}
                          className="inline-flex items-center text-sm text-blue-400 hover:text-blue-300"
                        >
                          <PlusIcon className="h-4 w-4 mr-1" />
                          Add a new skill
                        </button>
                      </div>
                    </Combobox.Options>
                  </Transition>
                </div>
              </Combobox>
            </div>
            <p className="text-sm text-gray-400 mt-1">
              Select multiple skills from the predefined list or add your own.
            </p>
          </div>

          {/* Replace the existing modal with the new component */}
          {isAddingSkill && <AddSkillModal />}

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:opacity-90 transition-all duration-200 font-medium disabled:opacity-50 shadow-lg hover:shadow-xl"
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
    </div>
  );
}
