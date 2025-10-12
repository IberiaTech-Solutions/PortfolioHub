"use client";

import { useEffect, useState, Fragment, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/utils/supabase";
import { User, PostgrestResponse } from "@supabase/supabase-js";
import { Combobox, Transition } from "@headlessui/react";
import {
  CheckIcon,
  ChevronUpDownIcon,
  XMarkIcon,
  SparklesIcon,
} from "@heroicons/react/20/solid";
import dynamic from "next/dynamic";

// Lazy load heavy components
const ProjectCards = dynamic(() => import("@/components/ProjectCards"), {
  loading: () => <div className="animate-pulse bg-gray-200 rounded-lg h-32"></div>,
  ssr: false
});

const CollaborationManager = dynamic(() => import("@/components/CollaborationManager"), {
  loading: () => <div className="animate-pulse bg-gray-200 rounded-lg h-48"></div>,
  ssr: false
});

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
  location?: string;
  experience_level?: string;
  preferred_work_type?: string[];
  languages?: string;
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
  const [initialLoading, setInitialLoading] = useState(true);
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
  
  // AI call tracking
  const [aiCallCount, setAiCallCount] = useState(0);
  const MAX_AI_CALLS = 5;
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
    location: "",
    experience_level: "",
    preferred_work_type: [] as string[],
    languages: "",
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

      // Check call limit
      if (aiCallCount >= MAX_AI_CALLS) {
        console.log(`AI call limit reached (${MAX_AI_CALLS}). Skipping analysis for ${field}.`);
        return;
      }

      setAnalyzingField(field);
      setAiCallCount(prev => prev + 1);
      
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
    [aiCallCount, MAX_AI_CALLS]
  );

  // Extract skills from description
  const extractSkillsFromDescription = useCallback(
    async (content: string) => {
      if (!content || content.trim().length < 20) {
        setExtractedSkills([]);
        return;
      }

      // Check call limit
      if (aiCallCount >= MAX_AI_CALLS) {
        console.log(`AI call limit reached (${MAX_AI_CALLS}). Skipping skill extraction.`);
        return;
      }

      setExtractingSkills(true);
      setAiCallCount(prev => prev + 1);
      
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
    [aiCallCount, MAX_AI_CALLS]
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


  // Debounce timers
  const debounceTimers = useRef<{[key: string]: NodeJS.Timeout}>({});

  const debouncedAnalyze = useCallback(
    (field: string, content: string, fieldType: string) => {
      // Skip AI analysis for very long content to improve performance
      if (content.length > 2000) {
        console.log(`Skipping AI analysis for ${field} - content too long (${content.length} chars)`);
        return;
      }
      
      // Clear existing timer
      if (debounceTimers.current[field]) {
        clearTimeout(debounceTimers.current[field]);
      }
      
      // Set new timer with longer delay for better performance
      debounceTimers.current[field] = setTimeout(() => {
        analyzeField(field, content, fieldType);
        delete debounceTimers.current[field];
      }, 3000); // Increased to 3 seconds
    },
    [analyzeField]
  );

  const debouncedExtractSkills = useCallback(
    (content: string) => {
      // Skip AI analysis for very long content to improve performance
      if (content.length > 2000) {
        console.log(`Skipping skill extraction - content too long (${content.length} chars)`);
        return;
      }
      
      // Clear existing timer
      if (debounceTimers.current['extractSkills']) {
        clearTimeout(debounceTimers.current['extractSkills']);
      }
      
      // Set new timer with longer delay for better performance
      debounceTimers.current['extractSkills'] = setTimeout(() => {
        extractSkillsFromDescription(content);
        delete debounceTimers.current['extractSkills'];
      }, 3500); // Increased to 3.5 seconds
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
    const initializePage = async () => {
      if (!supabase) {
        console.warn('Supabase not configured');
        router.push("/auth?redirect=/create-portfolio");
        return;
      }

      try {
        // Run auth check and skills fetch in parallel
        const [authResult, skillsResult] = await Promise.all([
          supabase.auth.getUser(),
          supabase.from("predefined_skills").select("*").order("name")
        ]);

        // Handle skills result
        if (skillsResult.error) {
          console.error("Error fetching skills:", skillsResult.error);
        } else {
          setPredefinedSkills(skillsResult.data as Skill[]);
        }

        // Handle auth result
        const { user } = authResult.data;
        if (!user) {
          router.push("/auth?redirect=/create-portfolio");
          return;
        }

        setUser(user);

        // Fetch portfolio data after auth is confirmed
        const { data: portfolio, error: portfolioError } = await supabase
          .from("portfolios")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (portfolioError) {
          console.error("Error fetching existing portfolio:", portfolioError);
          // Continue without existing portfolio data
        } else if (portfolio) {
          const portfolioData = portfolio as unknown as Portfolio;
          setExistingPortfolio(portfolioData);
          setFormData({
            title: portfolioData.title || "",
            name: portfolioData.name || "",
            job_title: portfolioData.job_title || "",
            description: portfolioData.description || "",
            website_url: portfolioData.website_url || "",
            profile_image: portfolioData.profile_image || "",
            hero_image: portfolioData.hero_image || "",
            github_url: portfolioData.github_url || "",
            linkedin_url: portfolioData.linkedin_url || "",
            location: portfolioData.location || "",
            experience_level: portfolioData.experience_level || "",
            preferred_work_type: portfolioData.preferred_work_type || [],
            languages: portfolioData.languages || "",
            additional_links: portfolioData.additional_links || [],
          });
          setSelectedSkills(portfolioData.skills || []);
          setWebsiteScreenshot(portfolioData.website_screenshot || "");
          setDetectedProjects(portfolioData.projects || []);
          if (portfolioData.profile_image) {
            setProfileImagePreview(portfolioData.profile_image);
          }
          if (portfolioData.hero_image) {
            setHeroImagePreview(portfolioData.hero_image);
          }
        }
      } catch (error) {
        console.error("Error initializing page:", error);
        router.push("/auth?redirect=/create-portfolio");
      } finally {
        setInitialLoading(false);
      }
    };

    initializePage();
  }, [router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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

      // Clear all pending AI analysis timers to prevent delays
      Object.values(debounceTimers.current).forEach(timer => {
        if (timer) clearTimeout(timer);
      });
      debounceTimers.current = {};

      if (!supabase) {
        throw new Error("Database not configured");
      }

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
      
      // Validate required fields
      if (!portfolioData.title || !portfolioData.name || !portfolioData.job_title || !portfolioData.description) {
        throw new Error("Missing required fields: title, name, job_title, or description");
      }
      
      console.log("Validation passed, proceeding with submission...");

      if (existingPortfolio) {
        // Update existing portfolio
        console.log("Updating existing portfolio:", existingPortfolio.id);
        const { data, error } = await supabase
          .from("portfolios")
          .update(portfolioData)
          .eq("id", existingPortfolio.id)
          .select();

        if (error) {
          console.error("Supabase update error:", error);
          throw error;
        }
        
        console.log("Portfolio updated successfully:", data);
      } else {
        // Create new portfolio
        console.log("Creating new portfolio");
        console.log("Portfolio data being inserted:", JSON.stringify(portfolioData, null, 2));
        
        // Add timeout to detect hanging operations
        const insertPromise = supabase
          .from("portfolios")
          .insert([portfolioData])
          .select();

        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Supabase insert timeout after 10 seconds')), 10000)
        );

        const result = await Promise.race([insertPromise, timeoutPromise]);
        const { data, error } = result as PostgrestResponse<Portfolio>;

        console.log("Supabase response:", { data, error });

        if (error) {
          console.error("Supabase insert error:", error);
          console.error("Error details:", {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
          throw error;
        }
        
        console.log("Portfolio created successfully:", data);
      }

      console.log("Portfolio saved successfully");
      console.log("Navigating to profile page...");
      router.push("/profile");
      console.log("Navigation initiated");
      
      // Fallback: reset loading state after a timeout in case navigation fails
      setTimeout(() => {
        console.log("Timeout reached, resetting loading state");
        setLoading(false);
      }, 3000);
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

    if (!supabase) {
      alert("Database not configured");
      return;
    }

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
      setPredefinedSkills((prev) => [...prev, data as Skill]);
      setSelectedSkills((prev) => [...prev, (data as Skill).name]);

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
        className="bg-slate-800 rounded-xl p-6 w-full max-w-md shadow-xl border border-slate-600"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-semibold text-white mb-4">Add New Skill</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Skill Name
            </label>
            <input
              type="text"
              value={newSkill.name}
              onChange={(e) =>
                setNewSkill({ ...newSkill, name: e.target.value })
              }
              className="w-full px-4 py-2 border border-white/20 rounded-lg text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white/10"
              placeholder="Enter skill name"
              required
            />
          </div>
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Category
            </label>
            <select
              value={newSkill.category}
              onChange={(e) =>
                setNewSkill({ ...newSkill, category: e.target.value })
              }
              className="w-full px-4 py-2 border border-white/20 rounded-lg text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white/10"
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
              className="px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors duration-200 disabled:opacity-50"
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
      <div className="flex justify-center items-center min-h-screen bg-slate-900">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        </div>
      </div>
    );
  }

  // Show loading screen while initializing
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading portfolio editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
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
          <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-sm font-medium mb-6 shadow-lg">
            <SparklesIcon className="h-4 w-4 mr-2" />
            AI-Powered Portfolio Builder
          </div>
          
          <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-6 leading-tight">
            {existingPortfolio ? "Edit Your" : "Create Your"}
            <br />
            <span className="bg-gradient-to-r from-brand-600 to-emerald-600 bg-clip-text text-transparent">
              Portfolio
            </span>
          </h1>
          
          <p className="text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed mb-8">
            Showcase your skills, projects, and collaborations in a beautiful, professional portfolio that stands out
          </p>
          
          {/* Feature Highlights */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm text-white shadow-lg">
              <SparklesIcon className="h-4 w-4 mr-2 text-brand-600" />
              AI-Powered Analysis
            </div>
            <div className="flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm text-white shadow-lg">
              <svg className="h-4 w-4 mr-2 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              Auto Skill Detection
            </div>
            <div className="flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm text-white shadow-lg">
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
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-xl">
              <div className="mb-6 p-4 bg-blue-500/10 border border-blue-400/30 rounded-lg">
                <p className="text-sm text-blue-200">
                  <span className="text-red-400 font-semibold">*</span> Required fields must be filled out to create your portfolio.
                </p>
                <p className="text-xs text-blue-300 mt-1">
                  AI Analysis: {MAX_AI_CALLS - aiCallCount} calls remaining
                </p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-4">
                  <label htmlFor="name" className="block text-sm font-semibold text-white">
                    Your Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border rounded-xl text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200 shadow-sm hover:shadow-md ${
                      !formData.name ? 'border-red-400/50' : 'border-white/20'
                    }`}
                    placeholder="John Doe"
                  />
                  {!formData.name && (
                    <p className="text-red-400 text-xs mt-1">This field is required</p>
                  )}
                </div>

                {/* Profile Image Upload */}
                <div className="space-y-4">
                  <label htmlFor="profile_image" className="block text-sm font-semibold text-white">
                    Profile Image
                  </label>
                  <div className="flex items-center space-x-4">
                    {/* Image Preview */}
                    <div className="flex-shrink-0">
                      {profileImagePreview ? (
                        <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-gray-200">
                          <Image
                            src={profileImagePreview}
                            alt="Profile preview"
                            width={80}
                            height={80}
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
                        className="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        {profileImagePreview ? 'Change Image' : 'Upload Image'}
                      </label>
                      <p className="text-xs text-gray-300 mt-1">
                        Recommended: Square image, max 2MB
                      </p>
                    </div>
                  </div>
                </div>

                {/* Hero Image Upload */}
                <div className="space-y-4">
                  <label htmlFor="hero_image" className="block text-sm font-semibold text-white">
                    Portfolio Hero Image
                    <span className="ml-2 text-xs text-gray-300 font-normal">(Banner image for portfolio cards)</span>
                  </label>
                  <div className="flex items-center space-x-4">
                    {/* Image Preview */}
                    <div className="flex-shrink-0">
                      {heroImagePreview ? (
                        <div className="w-32 h-20 rounded-xl overflow-hidden border-2 border-gray-200">
                          <Image
                            src={heroImagePreview}
                            alt="Hero image preview"
                            width={128}
                            height={80}
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
                        className="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        {heroImagePreview ? 'Change Hero Image' : 'Upload Hero Image'}
                      </label>
                      <p className="text-xs text-gray-300 mt-1">
                        Recommended: 16:9 aspect ratio, max 5MB
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label htmlFor="title" className="block text-sm font-semibold text-white">
                    Portfolio Title <span className="text-red-400">*</span>
                      <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-brand-500/20 text-brand-300 border border-brand-400/30">
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
                    className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border rounded-xl text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200 shadow-sm hover:shadow-md ${
                      !formData.title ? 'border-red-400/50' : 'border-white/20'
                    }`}
                    placeholder="Front-end Developer with 5 years experience"
                  />
                  {!formData.title && (
                    <p className="text-red-400 text-xs mt-1">This field is required</p>
                  )}
            
                  {/* AI Suggestions for Title */}
                  {(aiSuggestions.title?.length > 0 || analyzingField === 'title') && (
                    <div className="mt-4 p-4 bg-brand-500/10 border border-brand-400/30 rounded-xl backdrop-blur-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <SparklesIcon className="h-4 w-4 text-brand-300" />
                        <span className="text-sm font-semibold text-brand-200">AI Suggestions</span>
                        {analyzingField === 'title' && (
                          <div className="h-3 w-3 border border-brand-300 border-t-transparent rounded-full animate-spin"></div>
                        )}
                      </div>
                      {aiSuggestions.title?.map((suggestion, index) => (
                        <p key={index} className="text-sm text-white mb-1 font-medium">
                          • {suggestion}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

          <div className="space-y-3">
            <label
              htmlFor="job_title"
              className="block text-sm font-medium text-white"
            >
              Job Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="job_title"
              name="job_title"
              value={formData.job_title}
              onChange={handleChange}
              required
              className={`w-full px-4 py-3 border rounded-lg text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white/10 ${
                !formData.job_title ? 'border-red-400/50' : 'border-white/20'
              }`}
              placeholder="Senior Front-end Developer"
            />
            {!formData.job_title && (
              <p className="text-red-400 text-xs mt-1">This field is required</p>
            )}
          </div>

          {/* Location and Experience Level Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label
                htmlFor="location"
                className="block text-sm font-medium text-white"
              >
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-white/20 rounded-lg text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white/10"
                placeholder="San Francisco, CA or Remote"
              />
            </div>

            <div className="space-y-3">
              <label
                htmlFor="experience_level"
                className="block text-sm font-medium text-white"
              >
                Experience Level
              </label>
              <select
                id="experience_level"
                name="experience_level"
                value={formData.experience_level}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white/10"
              >
                <option value="">Select experience level</option>
                <option value="Entry Level">Entry Level (0-2 years)</option>
                <option value="Mid Level">Mid Level (3-5 years)</option>
                <option value="Senior Level">Senior Level (6+ years)</option>
                <option value="Lead Level">Lead Level (8+ years)</option>
                <option value="Student">Student/Intern</option>
              </select>
            </div>
          </div>

          {/* Work Type and Languages Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label
                htmlFor="preferred_work_type"
                className="block text-sm font-medium text-white"
              >
                Preferred Work Type
              </label>
              <div className="space-y-2">
                {["Full-time", "Part-time", "Contract", "Freelance"].map((workType) => (
                  <label key={workType} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.preferred_work_type.includes(workType)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            preferred_work_type: [...prev.preferred_work_type, workType]
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            preferred_work_type: prev.preferred_work_type.filter(type => type !== workType)
                          }));
                        }
                      }}
                      className="w-4 h-4 text-brand-600 bg-white/10 border-white/20 rounded focus:ring-brand-500 focus:ring-2"
                    />
                    <span className="text-white text-sm">{workType}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label
                htmlFor="languages"
                className="block text-sm font-medium text-white"
              >
                Languages
              </label>
              <input
                type="text"
                id="languages"
                name="languages"
                value={formData.languages}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-white/20 rounded-lg text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white/10"
                placeholder="English, Spanish, French"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-white"
            >
              About You / Description <span className="text-red-400">*</span>
              <span className="ml-3 inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-brand-500/20 text-brand-300 border border-brand-400/30">
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
              className={`w-full px-4 py-3 border rounded-lg text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none bg-white/10 ${
                !formData.description ? 'border-red-400/50' : 'border-white/20'
              }`}
              placeholder="A brief description about yourself, your experience, and what you're looking for"
            ></textarea>
            {!formData.description && (
              <p className="text-red-400 text-xs mt-1">This field is required</p>
            )}
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-300">
                {formData.description.length > 2000 ? (
                  <span className="text-amber-400">AI analysis disabled for long descriptions (2000+ chars)</span>
                ) : (
                  <span>{formData.description.length} characters</span>
                )}
              </p>
              {formData.description.length > 1500 && (
                <p className="text-xs text-gray-400">
                  Consider shortening for better performance
                </p>
              )}
            </div>
            
            {/* AI Suggestions for Description */}
            {(aiSuggestions.description?.length > 0 || analyzingField === 'description') && (
              <div className="mt-3 p-4 bg-brand-500/10 border border-brand-400/30 rounded-xl backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-3">
                  <SparklesIcon className="h-4 w-4 text-brand-300" />
                  <span className="text-sm font-semibold text-brand-200">AI Suggestions</span>
                  {analyzingField === 'description' && (
                    <div className="h-3 w-3 border border-brand-300 border-t-transparent rounded-full animate-spin"></div>
                  )}
                </div>
                {aiSuggestions.description?.map((suggestion, index) => (
                  <p key={index} className="text-sm text-white mb-1 font-medium">
                    • {suggestion}
                  </p>
                ))}
              </div>
            )}

            {/* Extracted Skills */}
            {(extractedSkills.length > 0 || extractingSkills) && (
              <div className="mt-3 p-4 bg-emerald-500/10 border border-emerald-400/30 rounded-xl backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-3">
                  <SparklesIcon className="h-4 w-4 text-emerald-300" />
                  <span className="text-sm font-semibold text-emerald-200">Auto-detected Skills</span>
                  {extractingSkills && (
                    <div className="h-3 w-3 border border-emerald-300 border-t-transparent rounded-full animate-spin"></div>
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
                          ? 'bg-emerald-500/20 text-emerald-200 cursor-not-allowed shadow-md border border-emerald-400/30'
                          : 'bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20 border border-emerald-400/30 hover:border-emerald-400/50 shadow-md hover:shadow-lg'
                      }`}
                    >
                      {selectedSkills.includes(skill) ? '✓ ' : '+ '}{skill}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-emerald-300 mt-2">
                  Click to add skills to your portfolio
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">Skills</label>
            <div className="relative">
              <Combobox
                value={selectedSkills}
                onChange={setSelectedSkills}
                multiple
              >
                <div className="relative">
                  <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white/10 border border-white/20 text-left focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500 transition-all duration-200">
                    <div className="flex flex-wrap gap-2 p-3">
                      {selectedSkills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center px-3 py-1.5 rounded bg-white/10 text-white text-sm font-medium border border-white/20 hover:bg-white/20 transition-colors duration-200"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSkills(
                                selectedSkills.filter((s) => s !== skill)
                              );
                            }}
                            className="ml-2 hover:text-gray-300 focus:outline-none"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </span>
                      ))}
                      <Combobox.Input
                        className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-white bg-transparent focus:ring-0 focus:outline-none placeholder-white"
                        displayValue={(skill: string) => skill}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search or add skills..."
                      />
                      <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronUpDownIcon
                          className="h-5 w-5 text-gray-300"
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
                      <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-slate-800 border border-white/20 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {filteredSkills.length === 0 && query !== "" ? (
                          <div className="px-4 py-3 border-b border-white/20">
                            <p className="text-gray-300 mb-2">
                              No matching skills found.
                            </p>
                            <button
                              type="button"
                              onClick={() => setIsAddingSkill(true)}
                              className="px-3 py-1 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors text-sm"
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
                              <div className="sticky top-0 bg-slate-700 px-4 py-2 text-sm font-semibold text-white border-b border-white/20">
                                {category}
                              </div>
                              {skills.map((skill) => (
                                <Combobox.Option
                                  key={skill.id}
                                  className={({ active }) =>
                                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                    active
                                      ? "bg-white/20 text-white"
                                      : "text-white"
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
            <p className="text-sm text-gray-300 mt-1">
              Select multiple skills from the predefined list or add your own.
            </p>
          </div>

          {/* Replace the existing modal with the new component */}
          {isAddingSkill && <AddSkillModal />}

          <div className="space-y-2">
            <label
              htmlFor="website_url"
              className="block text-sm font-medium text-white"
            >
              Website URL
              <span className="ml-2 inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-brand-500/20 text-brand-300 border border-brand-400/30">
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
              className="w-full px-4 py-3 border border-white/20 rounded-lg text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white/10"
              placeholder="https://yourwebsite.com"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="github_url"
              className="block text-sm font-medium text-white"
            >
              GitHub URL
              <span className="ml-2 inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-brand-500/20 text-brand-300 border border-brand-400/30">
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
              className="w-full px-4 py-3 border border-white/20 rounded-lg text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white/10"
              placeholder="https://github.com/yourusername"
            />
          </div>

                <div className="space-y-4">
                  <label
                    htmlFor="linkedin_url"
                    className="block text-sm font-semibold text-white"
                  >
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    id="linkedin_url"
                    name="linkedin_url"
                    value={formData.linkedin_url}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200 shadow-sm hover:shadow-md"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>

                {/* Additional Links Section */}
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-white">
                    Additional Links
                    <span className="ml-2 text-sm font-normal text-gray-300">
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
                          className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200 shadow-sm hover:shadow-md"
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
                          className="flex-2 px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200 shadow-sm hover:shadow-md"
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
                      className="flex items-center gap-2 px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-gray-300 hover:text-white hover:bg-white/20 transition-all duration-200 shadow-sm hover:shadow-md"
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
                <SparklesIcon className="h-5 w-5 text-brand-300" />
                <h3 className="text-lg font-medium text-white">Auto-Detected Projects</h3>
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
                    className="px-8 py-4 bg-transparent border-2 border-white/30 hover:border-white/50 text-white rounded-xl font-display font-semibold backdrop-blur-sm transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0"
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
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center">
                    <SparklesIcon className="h-5 w-5 text-brand-700" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">AI Features</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-brand-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-white">Smart Analysis</p>
                      <p className="text-xs text-gray-300">Real-time content suggestions</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-white">Auto Skills</p>
                      <p className="text-xs text-gray-300">Detect skills from description</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-white">Project Detection</p>
                      <p className="text-xs text-gray-300">Fetch GitHub projects</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Card */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-xl">
                <h3 className="text-lg font-semibold text-white mb-4">Progress</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Basic Info</span>
                    <span className="text-sm font-medium text-white">
                      {formData.name && formData.title && formData.job_title ? '✓' : '○'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Location & Experience</span>
                    <span className="text-sm font-medium text-white">
                      {formData.location && formData.experience_level ? '✓' : '○'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Work Type & Languages</span>
                    <span className="text-sm font-medium text-white">
                      {formData.preferred_work_type.length > 0 && formData.languages ? '✓' : '○'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Description</span>
                    <span className="text-sm font-medium text-white">
                      {formData.description ? '✓' : '○'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Skills</span>
                    <span className="text-sm font-medium text-white">
                      {selectedSkills.length > 0 ? '✓' : '○'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Links</span>
                    <span className="text-sm font-medium text-white">
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
