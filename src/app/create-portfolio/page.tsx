"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import { authFetch } from "@/utils/authFetch";
import { User, PostgrestResponse } from "@supabase/supabase-js";
import {
  SparklesIcon,
} from "@heroicons/react/20/solid";
import { useToast } from "@/components/Toast";
import StepRoleResume from "./steps/StepRoleResume";
import StepProfessional from "./steps/StepProfessional";
import StepSkillsLinks from "./steps/StepSkillsLinks";
import StepReview from "./steps/StepReview";
import { Portfolio, Project, Skill } from "@/types";

export default function CreatePortfolioPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
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
  
  // AI call tracking
  const [aiCallCount, setAiCallCount] = useState(0);
  const MAX_AI_CALLS = 5;
  const [formData, setFormData] = useState({
    name: "",
    job_title: "",
    description: "",
    website_url: "",
    github_url: "",
    linkedin_url: "",
    location: "",
    experience_level: "",
    preferred_work_type: [] as string[],
    private_fields: [] as string[],
    user_role: "candidate" as string,
  });
  const [resumeParsing, setResumeParsing] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [showResumeImport, setShowResumeImport] = useState(false);
  const [existingPortfolio, setExistingPortfolio] = useState<Portfolio | null>(
    null
  );
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

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
        const response = await authFetch('/api/analyzePortfolio', {
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
        const response = await authFetch('/api/analyzePortfolio', {
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
        const response = await authFetch('/api/detectProjects', {
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
        const response = await authFetch('/api/generateScreenshot', {
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
        // Run all initial fetches in parallel for better performance
        const [authResult, skillsResult] = await Promise.all([
          supabase.auth.getUser(),
          supabase.from("predefined_skills").select("*").order("name")
        ]);

        // Handle auth result first
        const { user } = authResult.data;
        if (!user) {
          router.push("/auth?redirect=/create-portfolio");
          return;
        }

        // All users are candidates (recruiter path removed)
        setFormData((prev) => ({ ...prev, user_role: "candidate" }));

        setUser(user);

        // Handle skills result
        if (skillsResult.error) {
          console.error("Error fetching skills:", skillsResult.error);
        } else {
          setPredefinedSkills(skillsResult.data as Skill[]);
        }

        // Fetch portfolio data in parallel with skills (already fetched)
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
          
          // Show form loading state while populating
          setFormLoading(true);
          
          // Use setTimeout to batch state updates and show loading
          setTimeout(() => {
            // Batch all state updates for better performance
            setExistingPortfolio(portfolioData);
            setCurrentStep(4); // Edit mode: start at Review
            setFormData({
              name: portfolioData.name || "",
              job_title: portfolioData.job_title || "",
              description: portfolioData.description || "",
              website_url: portfolioData.website_url || "",
              github_url: portfolioData.github_url || "",
              linkedin_url: portfolioData.linkedin_url || "",
              location: portfolioData.location || "",
              experience_level: portfolioData.experience_level || "",
              preferred_work_type: portfolioData.preferred_work_type || [],
              private_fields: (portfolioData as unknown as { private_fields?: string[] }).private_fields || [],
              user_role: (portfolioData as unknown as { user_role?: string }).user_role || "candidate",
            });

            setSelectedSkills(portfolioData.skills || []);
            setWebsiteScreenshot(portfolioData.website_screenshot || "");
            setDetectedProjects(portfolioData.projects || []);
            
            setFormLoading(false);
          }, 100);
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

  // Resume import handler
  const handleResumeImport = async (source: 'file' | 'text') => {
    let text = resumeText;

    if (source === 'file') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.txt,.md,.pdf,.docx';
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        setResumeParsing(true);
        try {
          const formDataPayload = new FormData();

          if (file.name.endsWith('.pdf') || file.name.endsWith('.docx')) {
            // Send PDF/DOCX as file — server will extract text
            formDataPayload.append('resume', file);
          } else {
            // Read text files directly
            text = await file.text();
            formDataPayload.append('text', text);
          }

          const res = await authFetch('/api/parseResume', {
            method: 'POST',
            body: formDataPayload,
          });

          const result = await res.json();
          if (result.data) {
            applyResumeData(result.data);
          } else {
            toast(result.error || 'Failed to parse resume', 'error');
          }
        } catch {
          toast('Failed to parse resume. Try pasting the text instead.', 'error');
        } finally {
          setResumeParsing(false);
        }
      };
      input.click();
      return;
    }

    // Text paste mode
    if (!text || text.trim().length < 50) {
      toast('Please paste your resume text (at least 50 characters)', 'error');
      return;
    }

    setResumeParsing(true);
    try {
      const formDataPayload = new FormData();
      formDataPayload.append('text', text);

      const res = await authFetch('/api/parseResume', {
        method: 'POST',
        body: formDataPayload,
      });

      const result = await res.json();
      if (result.data) {
        applyResumeData(result.data);
      } else {
        toast(result.error || 'Failed to parse resume', 'error');
      }
    } catch {
      toast('Failed to parse resume. Please try again.', 'error');
    } finally {
      setResumeParsing(false);
    }
  };

  const applyResumeData = (data: {
    name?: string; job_title?: string; title?: string; description?: string;
    skills?: string[]; location?: string; experience_level?: string;
    preferred_work_type?: string[]; languages?: string;
    website_url?: string; github_url?: string; linkedin_url?: string;
    certifications?: string[]; education?: string;
    projects?: Array<{ title: string; description: string; url: string; techStack: string[] }>;
  }) => {
    // Append certifications to description if present
    let fullDescription = data.description || '';
    if (data.certifications?.length) {
      fullDescription += `\n\nCertifications: ${data.certifications.join(', ')}`;
    }
    if (data.education) {
      fullDescription += `\n\nEducation: ${data.education}`;
    }

    setFormData((prev) => ({
      ...prev,
      name: data.name || prev.name,
      job_title: data.job_title || prev.job_title,
      description: fullDescription || prev.description,
      location: data.location || prev.location,
      experience_level: data.experience_level || prev.experience_level,
      preferred_work_type: data.preferred_work_type?.length ? data.preferred_work_type : prev.preferred_work_type,
      website_url: data.website_url || prev.website_url,
      github_url: data.github_url || prev.github_url,
      linkedin_url: data.linkedin_url || prev.linkedin_url,
    }));
    if (data.skills?.length) {
      setSelectedSkills((prev) => [...new Set([...prev, ...data.skills!])]);
    }
    if (data.projects?.length) {
      setDetectedProjects((prev) => [...prev, ...data.projects!.map(p => ({
        title: p.title,
        description: p.description,
        url: p.url || '',
        techStack: p.techStack || [],
        lastUpdated: (p as { dates?: string }).dates || undefined,
      }))]);
    }
    setShowResumeImport(false);
    setResumeText('');

    // Count what was extracted
    const filled = [data.name, data.job_title, data.description, data.location].filter(Boolean).length;
    const skillCount = data.skills?.length || 0;
    const projectCount = data.projects?.length || 0;
    const linksFound = [data.website_url, data.github_url, data.linkedin_url].filter(Boolean).length;

    toast(
      `Resume parsed! ${filled} fields, ${skillCount} skills, ${projectCount} projects${linksFound > 0 ? `, ${linksFound} links` : ''} extracted. Review and edit in each step.`,
      'success'
    );

    // Auto-advance to Step 2 so they can review
    setTimeout(() => setCurrentStep(2), 500);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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
        title: formData.job_title, // Use job title as portfolio title
        private_fields: formData.private_fields.length > 0 ? formData.private_fields : [],
        skills: selectedSkills,
        projects: detectedProjects,
        website_screenshot: websiteScreenshot,
        user_id: user.id,
      };

      // Validate required fields
      if (!portfolioData.name || !portfolioData.job_title || !portfolioData.description) {
        throw new Error("Missing required fields: name, job_title, or description");
      }
      
      if (existingPortfolio) {
        // Update existing portfolio
        const { error } = await supabase
          .from("portfolios")
          .update(portfolioData)
          .eq("id", existingPortfolio.id)
          .select();

        if (error) {
          console.error("Supabase update error:", error);
          throw error;
        }
      } else {
        // Create new portfolio
        // Add timeout to detect hanging operations
        const insertPromise = supabase
          .from("portfolios")
          .insert([portfolioData])
          .select();

        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Supabase insert timeout after 10 seconds')), 10000)
        );

        const result = await Promise.race([insertPromise, timeoutPromise]);
        const { error } = result as PostgrestResponse<Portfolio>;

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
        
      }

      router.push("/profile");

      // Fallback: reset loading state after a timeout in case navigation fails
      setTimeout(() => {
        setLoading(false);
      }, 3000);
    } catch (error) {
      console.error("Error saving portfolio:", error);
      toast(`Error saving portfolio: ${error instanceof Error ? error.message : 'Please try again.'}`, 'error');
      setLoading(false); // Make sure to reset loading state on error
      return; // Prevent navigation on error
    }
  };

  const handleAddNewSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!supabase) {
      toast("Database not configured", "error");
      return;
    }

    if (!newSkill.name || !newSkill.category) {
      toast("Please fill in both skill name and category", "error");
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
        toast("This skill already exists!", "error");
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
      toast("Skill added successfully!", "success");
    } catch (error) {
      console.error("Error adding new skill:", error);
      toast("Error adding new skill. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-brand-500/30 border-t-brand-500 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading Portfolio Editor</h2>
          <p className="text-gray-300 mb-4">Fetching your portfolio data...</p>
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
            <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
            <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
          </div>
        </div>
      </div>
    );
  }

  const stepLabels = ["Import", "About You", "Skills & Projects", "Review"];

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Form Loading Overlay */}
      {formLoading && (
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-500/30 border-t-brand-500 mx-auto mb-4"></div>
            <p className="text-white font-medium">Loading your portfolio data...</p>
          </div>
        </div>
      )}

      {/* Subtle Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative max-w-3xl mx-auto py-8 sm:py-12 lg:py-16 px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center px-4 py-2 bg-white/5 border border-white/10 rounded-full text-gray-400 text-sm font-bold mb-6">
            <SparklesIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            AI-Powered Portfolio Builder
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mb-3">
            {existingPortfolio ? "Edit Your" : "Create Your"}{" "}
            <span className="animate-gradient-text">Portfolio</span>
          </h1>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-400 font-medium">
              Step {currentStep} of {totalSteps}: {stepLabels[currentStep - 1]}
            </span>
            <span className="text-xs text-gray-500">{Math.round((currentStep / totalSteps) * 100)}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-emerald-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
          {/* Step indicators */}
          <div className="flex justify-between mt-2">
            {stepLabels.map((label, i) => (
              <button
                key={label}
                type="button"
                onClick={() => goToStep(i + 1)}
                className={`text-xs transition-colors ${
                  i + 1 === currentStep
                    ? "text-brand-300 font-semibold"
                    : i + 1 < currentStep
                    ? "text-emerald-400 cursor-pointer hover:text-emerald-300"
                    : "text-gray-600"
                }`}
              >
                {i + 1 <= currentStep ? (i + 1 < currentStep ? "\u2713" : "\u25CF") : "\u25CB"}
              </button>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl mb-6">
          <form onSubmit={handleSubmit}>
            {currentStep === 1 && (
              <StepRoleResume
                setFormData={setFormData}
                existingPortfolio={existingPortfolio}
                showResumeImport={showResumeImport}
                setShowResumeImport={setShowResumeImport}
                resumeText={resumeText}
                setResumeText={setResumeText}
                resumeParsing={resumeParsing}
                handleResumeImport={handleResumeImport}
                setSelectedSkills={setSelectedSkills}
                setDetectedProjects={setDetectedProjects}
                setProfileImagePreview={setProfileImagePreview}
              />
            )}

            {currentStep === 2 && (
              <StepProfessional
                formData={formData}
                setFormData={setFormData}
                handleChange={handleChange}
                debouncedAnalyze={debouncedAnalyze}
                debouncedExtractSkills={debouncedExtractSkills}
                aiSuggestions={aiSuggestions}
                analyzingField={analyzingField}
                extractedSkills={extractedSkills}
                extractingSkills={extractingSkills}
                selectedSkills={selectedSkills}
                addExtractedSkill={addExtractedSkill}
                aiCallCount={aiCallCount}
                MAX_AI_CALLS={MAX_AI_CALLS}
              />
            )}

            {currentStep === 3 && (
              <StepSkillsLinks
                formData={formData}
                setFormData={setFormData}
                handleChange={handleChange}
                selectedSkills={selectedSkills}
                setSelectedSkills={setSelectedSkills}
                query={query}
                setQuery={setQuery}
                filteredSkills={filteredSkills}
                isAddingSkill={isAddingSkill}
                setIsAddingSkill={setIsAddingSkill}
                newSkill={newSkill}
                setNewSkill={setNewSkill}
                categories={categories}
                handleAddNewSkill={handleAddNewSkill}
                loading={loading}
                debouncedDetectProjects={debouncedDetectProjects}
                debouncedGenerateScreenshot={debouncedGenerateScreenshot}
                detectedProjects={detectedProjects}
                detectingProjects={detectingProjects}
                removeProject={removeProject}
              />
            )}

            {currentStep === 4 && (
              <StepReview
                formData={formData}
                selectedSkills={selectedSkills}
                detectedProjects={detectedProjects}
                existingPortfolio={existingPortfolio}
                loading={loading}
                goToStep={goToStep}
              />
            )}
          </form>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            className="px-5 py-2.5 text-sm font-medium text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Back
          </button>

          <div className="flex gap-3">
            {currentStep >= 2 && currentStep <= 3 && (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => Math.min(totalSteps, prev + 1))}
                className="px-5 py-2.5 text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                Skip
              </button>
            )}
            {currentStep < totalSteps && (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => Math.min(totalSteps, prev + 1))}
                className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
