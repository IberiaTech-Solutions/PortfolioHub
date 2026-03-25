// Shared type definitions for TalentAgent

export type Project = {
  title: string;
  description: string;
  url: string;
  techStack: string[];
  stars?: number;
  forks?: number;
  language?: string;
  lastUpdated?: string;
};

export type Portfolio = {
  id: string;
  user_id: string;
  title: string;
  name: string;
  username?: string;
  job_title: string;
  description: string;
  website_url: string;
  website_screenshot?: string;
  profile_image?: string;
  hero_image?: string;
  github_url: string;
  linkedin_url: string;
  location?: string;
  experience_level?: string;
  preferred_work_type?: string[];
  languages?: string;
  is_verified?: boolean;
  private_fields?: string[];
  company_name?: string;
  company_logo?: string;
  additional_links?: Array<{ label: string; url: string }>;
  skills: string[];
  projects?: Project[];
  created_at: string;
  updated_at?: string;
  plan_tier?: "free" | "pro";
  user_role?: "candidate" | "admin";
  is_featured?: boolean;
  featured_skills?: string[];
  video_intro_url?: string;
};

export type PortfolioData = {
  name: string;
  job_title: string;
  title: string;
  description: string;
  skills: string[];
  projects?: Array<{
    title: string;
    description: string;
    url?: string;
    techStack: string[];
  }>;
  location?: string;
  experience_level?: string;
  preferred_work_type?: string[];
  languages?: string;
  website_url?: string;
  github_url?: string;
  linkedin_url?: string;
};

export type Skill = {
  id: string;
  name: string;
  category: string;
};

export type Job = {
  id: string;
  posted_by: string;
  title: string;
  company: string;
  company_logo?: string;
  description: string;
  requirements?: string;
  location?: string;
  work_type: string;
  remote_policy: string;
  experience_level?: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
  skills: string[];
  application_url?: string;
  application_email?: string;
  is_active: boolean;
  created_at: string;
};

export type JobMatch = {
  score: number;
  verdict: string;
  summary: string;
  matchingSkills: string[];
  missingSkills: string[];
  shouldApply: boolean;
  tip: string;
};

export type FitAssessment = {
  score: number;
  verdict: string;
  summary: string;
  strengths: string[];
  gaps: string[];
  advice: string;
  shouldApply: boolean;
};

export type InterviewQuestion = {
  question: string;
  type: "strength" | "gap" | "behavioral";
  tip: string;
};

export type Analytics = {
  views: number;
  chats: number;
  assessments: number;
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type JobApplication = {
  id: string;
  user_id: string;
  job_id: string;
  job_title: string;
  job_company: string;
  status: "applied" | "viewed" | "interviewing" | "offered" | "rejected" | "withdrawn";
  fit_score?: number;
  notes?: string;
  applied_at: string;
  updated_at?: string;
  applicant_name?: string;
  applicant_job_title?: string;
  applicant_profile_image?: string;
  applicant_portfolio_id?: string;
};

export type GitHubRepo = {
  name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  updated_at: string;
  fork: boolean;
  archived: boolean;
  size: number;
};

export type GitHubUser = {
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  bio: string | null;
};
