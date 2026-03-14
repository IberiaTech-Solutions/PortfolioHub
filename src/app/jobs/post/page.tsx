"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import { User } from "@supabase/supabase-js";
import {
  BriefcaseIcon,
  PlusIcon,
  XMarkIcon,
  CheckIcon,
  SparklesIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

const WORK_TYPES = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "freelance", label: "Freelance" },
];

const REMOTE_POLICIES = [
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "On-site" },
];

const EXPERIENCE_LEVELS = [
  { value: "junior", label: "Junior" },
  { value: "mid", label: "Mid-level" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead" },
];

const POPULAR_SKILLS = [
  "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Python",
  "Java", "Go", "Rust", "PostgreSQL", "MongoDB", "AWS", "Docker",
  "Kubernetes", "GraphQL", "REST API", "Figma", "UI/UX Design",
  "Tailwind CSS", "Vue.js", "Angular", "Swift", "Kotlin", "Flutter",
  "React Native", "DevOps", "CI/CD", "Machine Learning", "AI/ML",
];

export default function PostJobPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);

  const [form, setForm] = useState({
    title: "",
    company: "",
    description: "",
    requirements: "",
    location: "",
    work_type: "full-time",
    remote_policy: "remote",
    experience_level: "",
    salary_min: "",
    salary_max: "",
    salary_currency: "USD",
    skills: [] as string[],
    application_url: "",
    application_email: "",
  });

  useEffect(() => {
    const getUser = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);

      if (!user) {
        router.push("/auth?mode=signin");
      }
    };
    getUser();
  }, [router]);

  const updateForm = (field: string, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !form.skills.includes(trimmed)) {
      updateForm("skills", [...form.skills, trimmed]);
    }
    setSkillInput("");
    setShowSkillSuggestions(false);
  };

  const removeSkill = (skill: string) => {
    updateForm("skills", form.skills.filter((s) => s !== skill));
  };

  const filteredSuggestions = POPULAR_SKILLS.filter(
    (s) =>
      s.toLowerCase().includes(skillInput.toLowerCase()) &&
      !form.skills.includes(s)
  ).slice(0, 8);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !supabase || submitting) return;

    if (!form.title || !form.company || !form.description) return;

    setSubmitting(true);

    const jobData = {
      posted_by: user.id,
      title: form.title,
      company: form.company,
      description: form.description,
      requirements: form.requirements || null,
      location: form.location || null,
      work_type: form.work_type,
      remote_policy: form.remote_policy,
      experience_level: form.experience_level || null,
      salary_min: form.salary_min ? parseInt(form.salary_min) : null,
      salary_max: form.salary_max ? parseInt(form.salary_max) : null,
      salary_currency: form.salary_currency,
      skills: form.skills,
      application_url: form.application_url || null,
      application_email: form.application_email || null,
      is_active: true,
    };

    const { error } = await supabase.from("jobs").insert(jobData);

    if (error) {
      console.error("Error posting job:", error);
      setSubmitting(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/jobs"), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce"></div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <CheckIcon className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-display font-bold text-white mb-3">
            Job Posted!
          </h2>
          <p className="text-gray-300 mb-2">
            Your job listing is now live and visible to all candidates.
          </p>
          <p className="text-gray-500 text-sm">Redirecting to jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-brand-400/20 to-emerald-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-brand-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }}></div>
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Back link */}
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm font-medium mb-8 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Jobs
        </Link>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-sm font-bold mb-6 shadow-lg">
            <BriefcaseIcon className="w-4 h-4 mr-2" />
            Post a Job
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mb-3">
            Find Your Next Hire
          </h1>
          <p className="text-gray-400 max-w-lg mx-auto">
            Post a job and let AI match you with the best candidates on PortfolioHub.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Title */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-gradient-to-br from-brand-600 to-brand-700 rounded-xl flex items-center justify-center shadow-lg">
                <BriefcaseIcon className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-heading font-bold text-white">
                Job Details
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => updateForm("title", e.target.value)}
                  placeholder="e.g. Senior Frontend Developer"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  Company *
                </label>
                <input
                  type="text"
                  value={form.company}
                  onChange={(e) => updateForm("company", e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => updateForm("description", e.target.value)}
                  placeholder="Describe the role, responsibilities, and what a typical day looks like..."
                  rows={5}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-sm resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  Requirements
                </label>
                <textarea
                  value={form.requirements}
                  onChange={(e) => updateForm("requirements", e.target.value)}
                  placeholder="Must-have qualifications, nice-to-haves, etc..."
                  rows={3}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-sm resize-none"
                />
              </div>
            </div>
          </div>

          {/* Work Details */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <SparklesIcon className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-heading font-bold text-white">
                Work Details
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  Work Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {WORK_TYPES.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => updateForm("work_type", value)}
                      className={`px-3 py-2 rounded-xl text-sm font-bold transition-all duration-300 border ${
                        form.work_type === value
                          ? "bg-gradient-to-r from-brand-500 to-brand-600 text-white border-brand-500 shadow-lg"
                          : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  Remote Policy
                </label>
                <div className="flex flex-wrap gap-2">
                  {REMOTE_POLICIES.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => updateForm("remote_policy", value)}
                      className={`px-3 py-2 rounded-xl text-sm font-bold transition-all duration-300 border ${
                        form.remote_policy === value
                          ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-emerald-500 shadow-lg"
                          : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  Experience Level
                </label>
                <div className="flex flex-wrap gap-2">
                  {EXPERIENCE_LEVELS.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        updateForm(
                          "experience_level",
                          form.experience_level === value ? "" : value
                        )
                      }
                      className={`px-3 py-2 rounded-xl text-sm font-bold transition-all duration-300 border ${
                        form.experience_level === value
                          ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-500 shadow-lg"
                          : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => updateForm("location", e.target.value)}
                  placeholder="e.g. San Francisco, CA"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-sm"
                />
              </div>
            </div>
          </div>

          {/* Salary */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-heading font-bold text-white">
                Compensation
              </h2>
              <span className="text-gray-500 text-xs">(Optional)</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  Min Salary
                </label>
                <input
                  type="number"
                  value={form.salary_min}
                  onChange={(e) => updateForm("salary_min", e.target.value)}
                  placeholder="60000"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  Max Salary
                </label>
                <input
                  type="number"
                  value={form.salary_max}
                  onChange={(e) => updateForm("salary_max", e.target.value)}
                  placeholder="120000"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-sm"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  Currency
                </label>
                <select
                  value={form.salary_currency}
                  onChange={(e) => updateForm("salary_currency", e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none cursor-pointer text-sm"
                >
                  <option value="USD" className="bg-slate-800">USD</option>
                  <option value="EUR" className="bg-slate-800">EUR</option>
                  <option value="GBP" className="bg-slate-800">GBP</option>
                  <option value="CAD" className="bg-slate-800">CAD</option>
                  <option value="AUD" className="bg-slate-800">AUD</option>
                  <option value="MXN" className="bg-slate-800">MXN</option>
                </select>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h2 className="text-lg font-heading font-bold text-white">
                Required Skills
              </h2>
            </div>

            {/* Selected Skills */}
            {form.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {form.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-xl text-sm font-bold border border-brand-500 shadow-md"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                    >
                      <XMarkIcon className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Skill Input */}
            <div className="relative">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => {
                  setSkillInput(e.target.value);
                  setShowSkillSuggestions(true);
                }}
                onFocus={() => setShowSkillSuggestions(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (skillInput.trim()) addSkill(skillInput);
                  }
                }}
                placeholder="Type a skill and press Enter..."
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-sm"
              />

              {/* Suggestions Dropdown */}
              {showSkillSuggestions && skillInput && filteredSuggestions.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
                  {filteredSuggestions.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => addSkill(skill)}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center gap-2"
                    >
                      <PlusIcon className="w-3.5 h-3.5 text-brand-400" />
                      {skill}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Application */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-lg font-heading font-bold text-white">
                How to Apply
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  Application URL
                </label>
                <input
                  type="url"
                  value={form.application_url}
                  onChange={(e) => updateForm("application_url", e.target.value)}
                  placeholder="https://yourcompany.com/careers/apply"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  Or Application Email
                </label>
                <input
                  type="email"
                  value={form.application_email}
                  onChange={(e) => updateForm("application_email", e.target.value)}
                  placeholder="hiring@yourcompany.com"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-sm"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || !form.title || !form.company || !form.description}
            className="w-full py-4 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed text-white rounded-2xl font-heading font-bold text-lg transition-all duration-300 shadow-2xl hover:shadow-brand-500/25 hover:scale-[1.02] flex items-center justify-center gap-3"
          >
            {submitting ? (
              <>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                </div>
                Posting...
              </>
            ) : (
              <>
                <BriefcaseIcon className="w-5 h-5" />
                Post Job
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
