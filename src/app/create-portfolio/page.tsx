"use client";

import { useEffect, useState, Fragment, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import { User } from "@supabase/supabase-js";
import { Combobox, Transition } from "@headlessui/react";
import {
  CheckIcon,
  ChevronUpDownIcon,
  XMarkIcon,
  PlusIcon,
  SparklesIcon,
} from "@heroicons/react/20/solid";
import ProjectCards from "@/components/ProjectCards";
import ScreenshotPreview from "@/components/ScreenshotPreview";
import CollaborationManager from "@/components/CollaborationManager";

type Project = {
  title: string;
  description: string;
  url: string;
  techStack: string[];
  stars?: number;
  forks?: number;
  language?: string;
  lastUpdated: string;
};

type Collaboration = {
  id: string;
  collaborator_name: string;
  collaborator_email: string;
  project_title: string;
  project_description?: string;
  role: string;
  status: 'pending' | 'accepted' | 'declined';
  verified_at?: string;
  created_at: string;
};

type Portfolio = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  website_url: string;
  website_screenshot: string;
  github_url: string;
  linkedin_url: string;
  skills: string[];
  projects: Project[];
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
  const [aiSuggestions, setAiSuggestions] = useState<{[key: string]: string[]}>({});
  const [analyzingField, setAnalyzingField] = useState<string | null>(null);
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);
  const [extractingSkills, setExtractingSkills] = useState(false);
  const [detectedProjects, setDetectedProjects] = useState<Project[]>([]);
  const [detectingProjects, setDetectingProjects] = useState(false);
  const [websiteScreenshot, setWebsiteScreenshot] = useState<string>("");
  const [generatingScreenshot, setGeneratingScreenshot] = useState(false);
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
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

  // Debounced AI analysis function
  const analyzeField = useCallback(
    async (field: string, content: string, fieldType: string) => {
      if (!content || content.trim().length < 10) {
        setAiSuggestions(prev => ({ ...prev, [field]: [] }));
        return;
      }

      setAnalyzingField(field);
      try {
        const response = await fetch('/api/analyzePortfolio', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ field, content, fieldType }),
        });

        if (response.ok) {
          const data = await response.json();
          setAiSuggestions(prev => ({ ...prev, [field]: data.suggestions || [] }));
        }
      } catch (error) {
        console.error('Error analyzing field:', error);
      } finally {
        setAnalyzingField(null);
      }
    },
    []
  );

  // Extract skills from description
  const extractSkillsFromDescription = useCallback(
    async (content: string) => {
      if (!content || content.trim().length < 20) {
        setExtractedSkills([]);
        return;
      }

      setExtractingSkills(true);
      try {
        const response = await fetch('/api/analyzePortfolio', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            field: 'description', 
            content, 
            fieldType: 'description',
            extractSkills: true 
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setExtractedSkills(data.extractedSkills || []);
        }
      } catch (error) {
        console.error('Error extracting skills:', error);
      } finally {
        setExtractingSkills(false);
      }
    },
    []
  );

  // Add extracted skill to selected skills
  const addExtractedSkill = (skill: string) => {
    if (!selectedSkills.includes(skill)) {
      setSelectedSkills(prev => [...prev, skill]);
    }
  };

  // Detect projects from GitHub/website URLs
  const detectProjects = useCallback(
    async (githubUrl: string, websiteUrl: string) => {
      if (!githubUrl && !websiteUrl) {
        setDetectedProjects([]);
        return;
      }

      setDetectingProjects(true);
      try {
        const response = await fetch('/api/detectProjects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ githubUrl, websiteUrl }),
        });

        if (response.ok) {
          const data = await response.json();
          setDetectedProjects(data.projects || []);
        }
      } catch (error) {
        console.error('Error detecting projects:', error);
      } finally {
        setDetectingProjects(false);
      }
    },
    []
  );

  // Remove project from detected projects
  const removeProject = (index: number) => {
    setDetectedProjects(prev => prev.filter((_, i) => i !== index));
  };

  // Generate screenshot for website
  const generateScreenshot = useCallback(
    async (url: string) => {
      if (!url) {
        setWebsiteScreenshot("");
        return;
      }

      setGeneratingScreenshot(true);
      try {
        const response = await fetch('/api/generateScreenshot', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url }),
        });

        if (response.ok) {
          const data = await response.json();
          setWebsiteScreenshot(data.screenshotUrl || "");
        }
      } catch (error) {
        console.error('Error generating screenshot:', error);
      } finally {
        setGeneratingScreenshot(false);
      }
    },
    []
  );

  // Debounce function
  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  const debouncedAnalyze = useCallback(
    debounce((field: string, content: string, fieldType: string) => {
      analyzeField(field, content, fieldType);
    }, 1500),
    [analyzeField]
  );

  const debouncedExtractSkills = useCallback(
    debounce((content: string) => {
      extractSkillsFromDescription(content);
    }, 2000),
    [extractSkillsFromDescription]
  );

  const debouncedDetectProjects = useCallback(
    debounce((githubUrl: string, websiteUrl: string) => {
      detectProjects(githubUrl, websiteUrl);
    }, 3000),
    [detectProjects]
  );

  const debouncedGenerateScreenshot = useCallback(
    debounce((url: string) => {
      generateScreenshot(url);
    }, 2000),
    [generateScreenshot]
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
        setWebsiteScreenshot(portfolio.website_screenshot || "");
        setDetectedProjects(portfolio.projects || []);
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
        projects: detectedProjects,
        website_screenshot: websiteScreenshot,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}></div>
      </div>

      <div className="relative z-10 container mx-auto max-w-4xl py-12 px-4">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent leading-tight">
            {existingPortfolio ? "Edit Your" : "Create Your"}
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Portfolio
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Showcase your skills, projects, and collaborations in a beautiful, professional portfolio
          </p>
        </div>

        {/* AI Features Banner */}
        <div className="mb-8 p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-blue-500/20 rounded-2xl shadow-2xl">
          <div className="flex items-center gap-3 mb-3">
            <SparklesIcon className="h-6 w-6 text-blue-400" />
            <h3 className="text-xl font-bold text-white">AI-Powered Portfolio Builder</h3>
          </div>
          <p className="text-gray-300 leading-relaxed">
            Our AI assistant analyzes your content in real-time and provides suggestions to improve clarity, impact, and professional presentation. 
            It also automatically detects skills from your description and fetches project information to save you time.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 space-y-8 shadow-2xl"
        >
          <div className="space-y-3">
            <label htmlFor="name" className="block text-lg font-semibold text-white">
              Your Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-400 transition-all duration-300 text-lg shadow-lg"
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-3">
            <label htmlFor="title" className="block text-lg font-semibold text-white">
              Portfolio Title
              <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                <SparklesIcon className="h-4 w-4 mr-1" />
                AI Analysis
              </span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={(e) => {
                handleChange(e);
                debouncedAnalyze('title', e.target.value, 'title');
              }}
              required
              className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-400 transition-all duration-300 text-lg shadow-lg"
              placeholder="Front-end Developer with 5 years experience"
            />
            
            {/* AI Suggestions for Title */}
            {(aiSuggestions.title?.length > 0 || analyzingField === 'title') && (
              <div className="mt-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <SparklesIcon className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-medium text-blue-300">AI Suggestions</span>
                  {analyzingField === 'title' && (
                    <div className="h-3 w-3 border border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  )}
                </div>
                {aiSuggestions.title?.map((suggestion, index) => (
                  <p key={index} className="text-sm text-blue-200 mb-1">
                    • {suggestion}
                  </p>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label
              htmlFor="job_title"
              className="block text-lg font-semibold text-white"
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
              className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-400 transition-all duration-300 text-lg shadow-lg"
              placeholder="Senior Front-end Developer"
            />
          </div>

          <div className="space-y-3">
            <label
              htmlFor="description"
              className="block text-lg font-semibold text-white"
            >
              About You / Description
              <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                <SparklesIcon className="h-4 w-4 mr-1" />
                AI Analysis
              </span>
              <span className="ml-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-300 border border-green-500/30">
                <SparklesIcon className="h-4 w-4 mr-1" />
                Auto Skills
              </span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={(e) => {
                handleChange(e);
                debouncedAnalyze('description', e.target.value, 'description');
                debouncedExtractSkills(e.target.value);
              }}
              required
              rows={5}
              className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-400 transition-all duration-300 text-lg shadow-lg resize-none"
              placeholder="A brief description about yourself, your experience, and what you're looking for"
            ></textarea>
            
            {/* AI Suggestions for Description */}
            {(aiSuggestions.description?.length > 0 || analyzingField === 'description') && (
              <div className="mt-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <SparklesIcon className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-medium text-blue-300">AI Suggestions</span>
                  {analyzingField === 'description' && (
                    <div className="h-3 w-3 border border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  )}
                </div>
                {aiSuggestions.description?.map((suggestion, index) => (
                  <p key={index} className="text-sm text-blue-200 mb-1">
                    • {suggestion}
                  </p>
                ))}
              </div>
            )}

            {/* Extracted Skills */}
            {(extractedSkills.length > 0 || extractingSkills) && (
              <div className="mt-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <SparklesIcon className="h-4 w-4 text-green-400" />
                  <span className="text-sm font-medium text-green-300">Auto-detected Skills</span>
                  {extractingSkills && (
                    <div className="h-3 w-3 border border-green-400 border-t-transparent rounded-full animate-spin"></div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {extractedSkills.map((skill, index) => (
                    <button
                      key={index}
                      onClick={() => addExtractedSkill(skill)}
                      disabled={selectedSkills.includes(skill)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                        selectedSkills.includes(skill)
                          ? 'bg-green-600 text-white cursor-not-allowed'
                          : 'bg-green-500/20 text-green-300 hover:bg-green-500/30 border border-green-500/30 hover:border-green-500/50'
                      }`}
                    >
                      {selectedSkills.includes(skill) ? '✓ ' : '+ '}{skill}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-green-400 mt-2">
                  Click to add skills to your portfolio
                </p>
              </div>
            )}
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
                            onClick={() => {
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
                        className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-200 bg-transparent focus:ring-0 focus:outline-none"
                        displayValue={(skill: string) => skill}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search or add skills..."
                      />
                      <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronUpDownIcon
                          className="h-5 w-5 text-gray-400"
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
                      <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {filteredSkills.length === 0 && query !== "" ? (
                          <div className="px-4 py-3 border-b border-white/5">
                            <p className="text-gray-400 mb-2">
                              No matching skills found.
                            </p>
                            <button
                              type="button"
                              onClick={() => setIsAddingSkill(true)}
                              className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                            >
                              Add "{query}" as new skill
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
                                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
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
                                              : "text-blue-500"
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
                      </Combobox.Options>
                    </Transition>
                  </div>
                </div>
              </Combobox>
            </div>
            <p className="text-sm text-gray-400 mt-1">
              Select multiple skills from the predefined list or add your own.
            </p>
          </div>

          {/* Replace the existing modal with the new component */}
          {isAddingSkill && <AddSkillModal />}

          <div className="space-y-2">
            <label
              htmlFor="website_url"
              className="block text-gray-300 font-medium"
            >
              Website URL
              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                <SparklesIcon className="h-3 w-3 mr-1" />
                Auto Projects
              </span>
            </label>
            <input
              type="url"
              id="website_url"
              name="website_url"
              value={formData.website_url}
              onChange={(e) => {
                handleChange(e);
                debouncedDetectProjects(formData.github_url, e.target.value);
                debouncedGenerateScreenshot(e.target.value);
              }}
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
              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                <SparklesIcon className="h-3 w-3 mr-1" />
                Auto Projects
              </span>
            </label>
            <input
              type="url"
              id="github_url"
              name="github_url"
              value={formData.github_url}
              onChange={(e) => {
                handleChange(e);
                debouncedDetectProjects(e.target.value, formData.website_url);
              }}
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


          {/* Project Auto-Detection */}
          {(detectedProjects.length > 0 || detectingProjects) && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <SparklesIcon className="h-5 w-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Auto-Detected Projects</h3>
                {detectingProjects && (
                  <div className="h-4 w-4 border border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>
              <ProjectCards 
                projects={detectedProjects} 
                onRemoveProject={removeProject}
                editable={true}
              />
            </div>
          )}

          {/* Collaboration Manager */}
          <CollaborationManager
            portfolioId={existingPortfolio?.id || ''}
            collaborations={collaborations}
            onCollaborationsChange={setCollaborations}
          />

          <div className="flex justify-center pt-8">
            <button
              type="submit"
              disabled={loading}
              className="px-12 py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-2xl font-bold text-lg transition-all duration-300 disabled:opacity-50 shadow-2xl hover:shadow-3xl hover:scale-105 transform"
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
