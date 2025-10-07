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
  SparklesIcon,
} from "@heroicons/react/20/solid";
import ProjectCards from "@/components/ProjectCards";
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
  profile_image?: string;
  hero_image?: string;
  github_url: string;
  linkedin_url: string;
  additional_links: Array<{label: string, url: string}>;
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
  const [profileImagePreview, setProfileImagePreview] = useState<string>("");
  const [heroImagePreview, setHeroImagePreview] = useState<string>("");
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    name: "",
    job_title: "",
    description: "",
    website_url: "",
    profile_image: "",
    hero_image: "",
    github_url: "",
    linkedin_url: "",
    additional_links: [] as Array<{label: string, url: string}>,
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
      }
    },
    []
  );


  const debouncedAnalyze = useCallback(
    (field: string, content: string, fieldType: string) => {
      setTimeout(() => {
        analyzeField(field, content, fieldType);
      }, 1500);
    },
    [analyzeField]
  );

  const debouncedExtractSkills = useCallback(
    (content: string) => {
      setTimeout(() => {
        extractSkillsFromDescription(content);
      }, 2000);
    },
    [extractSkillsFromDescription]
  );

  const debouncedDetectProjects = useCallback(
    (githubUrl: string, websiteUrl: string) => {
      setTimeout(() => {
        detectProjects(githubUrl, websiteUrl);
      }, 3000);
    },
    [detectProjects]
  );

  const debouncedGenerateScreenshot = useCallback(
    (url: string) => {
      setTimeout(() => {
        generateScreenshot(url);
      }, 2000);
    },
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
          profile_image: portfolio.profile_image || "",
          hero_image: portfolio.hero_image || "",
          github_url: portfolio.github_url || "",
          linkedin_url: portfolio.linkedin_url || "",
          additional_links: portfolio.additional_links || [],
        });
        setSelectedSkills(portfolio.skills || []);
        setWebsiteScreenshot(portfolio.website_screenshot || "");
        setDetectedProjects(portfolio.projects || []);
        if (portfolio.profile_image) {
          setProfileImagePreview(portfolio.profile_image);
        }
        if (portfolio.hero_image) {
          setHeroImagePreview(portfolio.hero_image);
        }
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

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setProfileImagePreview(result);
        setFormData((prev) => ({ ...prev, profile_image: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHeroImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setHeroImagePreview(result);
        setFormData((prev) => ({ ...prev, hero_image: result }));
      };
      reader.readAsDataURL(file);
    }
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

      console.log("Submitting portfolio data:", portfolioData);

      if (existingPortfolio) {
        // Update existing portfolio
        console.log("Updating existing portfolio:", existingPortfolio.id);
        const { error } = await supabase
          .from("portfolios")
          .update(portfolioData)
          .eq("id", existingPortfolio.id);

        if (error) {
          console.error("Supabase update error:", error);
          throw error;
        }
      } else {
        // Create new portfolio
        console.log("Creating new portfolio");
        const { error } = await supabase
          .from("portfolios")
          .insert([portfolioData]);

        if (error) {
          console.error("Supabase insert error:", error);
          throw error;
        }
      }

      console.log("Portfolio saved successfully");
      setLoading(false); // Reset loading state on success
      router.push("/profile");
    } catch (error) {
      console.error("Error saving portfolio:", error);
      alert(`Error saving portfolio: ${error instanceof Error ? error.message : 'Please try again.'}`);
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
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
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
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
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
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50/30 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Waves */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-brand-400/20 to-emerald-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-brand-400/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        
        {/* Floating Dots */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-brand-400/30 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
        <div className="absolute top-40 right-32 w-1.5 h-1.5 bg-emerald-400/40 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-32 left-32 w-2.5 h-2.5 bg-purple-400/30 rounded-full animate-bounce" style={{animationDelay: '3s'}}></div>
        
        {/* Network Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-5" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="network" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 10 20 M 0 10 L 20 10" stroke="currentColor" strokeWidth="0.5" fill="none"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#network)" className="text-brand-400"/>
        </svg>
      </div>

      <div className="relative max-w-6xl mx-auto py-16 px-6">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm border border-brand-200/50 rounded-full text-brand-700 text-sm font-medium mb-6 shadow-lg">
            <SparklesIcon className="h-4 w-4 mr-2" />
            AI-Powered Portfolio Builder
          </div>
          
          <h1 className="text-5xl md:text-6xl font-display font-bold text-gray-900 mb-6 leading-tight">
            {existingPortfolio ? "Edit Your" : "Create Your"}
            <br />
            <span className="bg-gradient-to-r from-brand-600 to-emerald-600 bg-clip-text text-transparent">
              Portfolio
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Showcase your skills, projects, and collaborations in a beautiful, professional portfolio that stands out
          </p>
          
          {/* Feature Highlights */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="flex items-center px-4 py-2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full text-sm text-gray-900 shadow-md">
              <SparklesIcon className="h-4 w-4 mr-2 text-brand-600" />
              AI-Powered Analysis
            </div>
            <div className="flex items-center px-4 py-2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full text-sm text-gray-900 shadow-md">
              <svg className="h-4 w-4 mr-2 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              Auto Skill Detection
            </div>
            <div className="flex items-center px-4 py-2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full text-sm text-gray-900 shadow-md">
              <svg className="h-4 w-4 mr-2 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              Project Integration
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-8 shadow-xl">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-4">
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-900">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200 shadow-sm hover:shadow-md"
                    placeholder="John Doe"
                  />
                </div>

                {/* Profile Image Upload */}
                <div className="space-y-4">
                  <label htmlFor="profile_image" className="block text-sm font-semibold text-gray-900">
                    Profile Image
                  </label>
                  <div className="flex items-center space-x-4">
                    {/* Image Preview */}
                    <div className="flex-shrink-0">
                      {profileImagePreview ? (
                        <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-gray-200">
                          <img
                            src={profileImagePreview}
                            alt="Profile preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 bg-gradient-to-br from-brand-100 to-brand-200 rounded-xl border-2 border-gray-200 flex items-center justify-center">
                          <svg className="w-8 h-8 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    {/* Upload Button */}
                    <div className="flex-1">
                      <input
                        type="file"
                        id="profile_image"
                        accept="image/*"
                        onChange={handleProfileImageChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="profile_image"
                        className="inline-flex items-center px-4 py-2 bg-white/60 hover:bg-white/80 border border-gray-200/50 rounded-xl text-gray-900 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        {profileImagePreview ? 'Change Image' : 'Upload Image'}
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        Recommended: Square image, max 2MB
                      </p>
                    </div>
                  </div>
                </div>

                {/* Hero Image Upload */}
                <div className="space-y-4">
                  <label htmlFor="hero_image" className="block text-sm font-semibold text-gray-900">
                    Portfolio Hero Image
                    <span className="ml-2 text-xs text-gray-500 font-normal">(Banner image for portfolio cards)</span>
                  </label>
                  <div className="flex items-center space-x-4">
                    {/* Image Preview */}
                    <div className="flex-shrink-0">
                      {heroImagePreview ? (
                        <div className="w-32 h-20 rounded-xl overflow-hidden border-2 border-gray-200">
                          <img
                            src={heroImagePreview}
                            alt="Hero image preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-32 h-20 bg-gradient-to-br from-brand-100 to-brand-200 rounded-xl border-2 border-gray-200 flex items-center justify-center">
                          <svg className="w-8 h-8 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    {/* Upload Button */}
                    <div className="flex-1">
                      <input
                        type="file"
                        id="hero_image"
                        accept="image/*"
                        onChange={handleHeroImageChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="hero_image"
                        className="inline-flex items-center px-4 py-2 bg-white/60 hover:bg-white/80 border border-gray-200/50 rounded-xl text-gray-900 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        {heroImagePreview ? 'Change Hero Image' : 'Upload Hero Image'}
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        Recommended: 16:9 aspect ratio, max 5MB
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label htmlFor="title" className="block text-sm font-semibold text-gray-900">
                    Portfolio Title
                    <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-brand-100 text-brand-700 border border-brand-200">
                      <SparklesIcon className="h-3 w-3 mr-1" />
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
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200 shadow-sm hover:shadow-md"
                    placeholder="Front-end Developer with 5 years experience"
                  />
            
                  {/* AI Suggestions for Title */}
                  {(aiSuggestions.title?.length > 0 || analyzingField === 'title') && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-brand-50 to-blue-50 border border-brand-200/50 rounded-xl backdrop-blur-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <SparklesIcon className="h-4 w-4 text-brand-600" />
                        <span className="text-sm font-semibold text-brand-700">AI Suggestions</span>
                        {analyzingField === 'title' && (
                          <div className="h-3 w-3 border border-brand-600 border-t-transparent rounded-full animate-spin"></div>
                        )}
                      </div>
                      {aiSuggestions.title?.map((suggestion, index) => (
                        <p key={index} className="text-sm text-gray-800 mb-1 font-medium">
                          • {suggestion}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

          <div className="space-y-3">
            <label
              htmlFor="job_title"
              className="block text-sm font-medium text-gray-700"
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
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="Senior Front-end Developer"
            />
          </div>

          <div className="space-y-3">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              About You / Description
              <span className="ml-3 inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                <SparklesIcon className="h-3 w-3 mr-1" />
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
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
              placeholder="A brief description about yourself, your experience, and what you're looking for"
            ></textarea>
            
            {/* AI Suggestions for Description */}
            {(aiSuggestions.description?.length > 0 || analyzingField === 'description') && (
              <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <SparklesIcon className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">AI Suggestions</span>
                  {analyzingField === 'description' && (
                    <div className="h-3 w-3 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  )}
                </div>
                {aiSuggestions.description?.map((suggestion, index) => (
                  <p key={index} className="text-sm text-gray-800 mb-1 font-medium">
                    • {suggestion}
                  </p>
                ))}
              </div>
            )}

            {/* Extracted Skills */}
            {(extractedSkills.length > 0 || extractingSkills) && (
              <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <SparklesIcon className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Auto-detected Skills</span>
                  {extractingSkills && (
                    <div className="h-3 w-3 border border-green-600 border-t-transparent rounded-full animate-spin"></div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {extractedSkills.map((skill, index) => (
                    <button
                      key={index}
                      onClick={() => addExtractedSkill(skill)}
                      disabled={selectedSkills.includes(skill)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm ${
                        selectedSkills.includes(skill)
                          ? 'bg-green-600 text-white cursor-not-allowed shadow-md'
                          : 'bg-green-100 text-green-800 hover:bg-green-200 border border-green-300 hover:border-green-400 shadow-md hover:shadow-lg'
                      }`}
                    >
                      {selectedSkills.includes(skill) ? '✓ ' : '+ '}{skill}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-green-600 mt-2">
                  Click to add skills to your portfolio
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Skills</label>
            <div className="relative">
              <Combobox
                value={selectedSkills}
                onChange={setSelectedSkills}
                multiple
              >
                <div className="relative">
                  <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white border border-gray-200 text-left focus-within:border-gray-900 focus-within:ring-2 focus-within:ring-gray-900 transition-all duration-200">
                    <div className="flex flex-wrap gap-2 p-3">
                      {selectedSkills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center px-3 py-1.5 rounded bg-gray-100 text-gray-700 text-sm font-medium border border-gray-200 hover:bg-gray-200 transition-colors duration-200"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSkills(
                                selectedSkills.filter((s) => s !== skill)
                              );
                            }}
                            className="ml-2 hover:text-gray-500 focus:outline-none"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </span>
                      ))}
                      <Combobox.Input
                        className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 bg-transparent focus:ring-0 focus:outline-none placeholder-gray-500"
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
                      <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white border border-gray-200 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {filteredSkills.length === 0 && query !== "" ? (
                          <div className="px-4 py-3 border-b border-gray-200">
                            <p className="text-gray-600 mb-2">
                              No matching skills found.
                            </p>
                            <button
                              type="button"
                              onClick={() => setIsAddingSkill(true)}
                              className="px-3 py-1 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
                            >
                              Add &quot;{query}&quot; as new skill
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
                                        ? "bg-gray-100 text-gray-900"
                                        : "text-gray-900"
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
            <p className="text-sm text-gray-600 mt-1">
              Select multiple skills from the predefined list or add your own.
            </p>
          </div>

          {/* Replace the existing modal with the new component */}
          {isAddingSkill && <AddSkillModal />}

          <div className="space-y-2">
            <label
              htmlFor="website_url"
              className="block text-sm font-medium text-gray-700"
            >
              Website URL
              <span className="ml-2 inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
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
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="https://yourwebsite.com"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="github_url"
              className="block text-sm font-medium text-gray-700"
            >
              GitHub URL
              <span className="ml-2 inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
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
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="https://github.com/yourusername"
            />
          </div>

                <div className="space-y-4">
                  <label
                    htmlFor="linkedin_url"
                    className="block text-sm font-semibold text-gray-900"
                  >
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    id="linkedin_url"
                    name="linkedin_url"
                    value={formData.linkedin_url}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200 shadow-sm hover:shadow-md"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>

                {/* Additional Links Section */}
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-900">
                    Additional Links
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      (Dribbble, Behance, Bestfolios, etc.)
                    </span>
                  </label>
                  
                  <div className="space-y-3">
                    {formData.additional_links.map((link, index) => (
                      <div key={index} className="flex gap-3">
                        <input
                          type="text"
                          placeholder="Label (e.g., Dribbble)"
                          value={link.label}
                          onChange={(e) => {
                            const newLinks = [...formData.additional_links];
                            newLinks[index].label = e.target.value;
                            setFormData({ ...formData, additional_links: newLinks });
                          }}
                          className="flex-1 px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200 shadow-sm hover:shadow-md"
                        />
                        <input
                          type="url"
                          placeholder="https://..."
                          value={link.url}
                          onChange={(e) => {
                            const newLinks = [...formData.additional_links];
                            newLinks[index].url = e.target.value;
                            setFormData({ ...formData, additional_links: newLinks });
                          }}
                          className="flex-2 px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200 shadow-sm hover:shadow-md"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newLinks = formData.additional_links.filter((_, i) => i !== index);
                            setFormData({ ...formData, additional_links: newLinks });
                          }}
                          className="px-3 py-3 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl transition-colors duration-200"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          additional_links: [...formData.additional_links, { label: "", url: "" }]
                        });
                      }}
                      className="flex items-center gap-2 px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-white/80 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Link
                    </button>
                  </div>
                </div>


          {/* Project Auto-Detection */}
          {(detectedProjects.length > 0 || detectingProjects) && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <SparklesIcon className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-medium text-gray-900">Auto-Detected Projects</h3>
                {detectingProjects && (
                  <div className="h-4 w-4 border border-gray-600 border-t-transparent rounded-full animate-spin"></div>
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
                    className="px-8 py-4 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
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

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* AI Features Card */}
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center">
                    <SparklesIcon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">AI Features</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-brand-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Smart Analysis</p>
                      <p className="text-xs text-gray-600">Real-time content suggestions</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Auto Skills</p>
                      <p className="text-xs text-gray-600">Detect skills from description</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Project Detection</p>
                      <p className="text-xs text-gray-600">Fetch GitHub projects</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Card */}
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Basic Info</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formData.name && formData.title && formData.job_title ? '✓' : '○'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Description</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formData.description ? '✓' : '○'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Skills</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedSkills.length > 0 ? '✓' : '○'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Links</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formData.website_url || formData.github_url || formData.linkedin_url ? '✓' : '○'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
