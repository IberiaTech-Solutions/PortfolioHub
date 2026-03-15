# TalentAgent Roadmap

## Vision
AI-powered talent platform where candidates control their narrative and recruiters evaluate depth — not keywords. The platform where your AI agent represents you 24/7, jobs come to you with honest fit scores, and "show don't tell" replaces the broken resume game.

---

## Completed

### Core Platform
- [x] User authentication (Supabase email/password)
- [x] Portfolio creation & editing (full form with all fields)
- [x] Portfolio discovery & browsing (4-column grid, dynamic filters)
- [x] Collaboration system (invite, verify, track)
- [x] Responsive design (mobile-first)
- [x] Dark theme with glassmorphism design system

### AI Features
- [x] AI Chat on portfolio pages — ask questions about any candidate
- [x] Fit Assessment tool — paste job description, get honest 0-100 score
- [x] AI Job Match scoring — candidates see fit score per job
- [x] AI portfolio analysis & suggestions
- [x] AI skill extraction from descriptions
- [x] GitHub project auto-detection
- [x] AI resume parser (upload/paste → auto-fill portfolio in 30 seconds)

### Jobs Board
- [x] Jobs listing page with search + 5 filters (type, remote, level, country, currency)
- [x] Post a Job page for recruiters
- [x] External job aggregation via JSearch API (LinkedIn, Indeed, Glassdoor)
- [x] Source tabs (All / Posted / External)
- [x] Jobs table with RLS policies + migrations

### Profile & Identity
- [x] Verified by TalentAgent trust badge (component + DB)
- [x] Privacy controls per field (toggles on location, languages)
- [x] Profile view analytics dashboard (views, chats, assessments — last 30 days)
- [x] Vanity URLs (`talentagent.com/username`)
- [x] Username input with availability check in portfolio editor

### Branding & UX
- [x] TalentAgent rebrand (from PortfolioHub)
- [x] SVG logo system (LogoFull, LogoIcon, LogoFullDark)
- [x] Brand favicon (indigo T-network icon)
- [x] Updated meta/SEO + Open Graph/Twitter Cards
- [x] Homepage hero copy aligned with AI talent platform vision
- [x] "Powered by" partners section (OpenAI, Supabase, Vercel, LinkedIn Jobs, etc.)
- [x] Codebase cleanup (removed dead pages + unused components)

### Design Pass (Anti-AI-Slop)
- [x] Removed floating dots, network SVGs, animated gradient blobs from ALL interior pages
- [x] Replaced rainbow skill pill rotation with consistent neutral styling
- [x] Removed gradient icon boxes from section headers — simple text headers
- [x] Toned down cards: bg-white/5 border-white/10 (less heavy glassmorphism)
- [x] Body text is normal weight (removed 143 instances of unnecessary font-bold)
- [x] Simplified contact/info sections without gradient boxes per link
- [x] Removed sticky search bar — search stays in hero only
- [x] Rebuilt SearchBar component (clean, dark-themed, no sticky logic)

### User Roles
- [x] Candidate vs Recruiter role system (DB column + constraint)
- [x] Role selector on signup page (segmented control)
- [x] Role selector on create-portfolio page
- [x] Company name/logo fields for recruiter accounts
- [x] Role-based navigation (candidates: Jobs/Portfolio/Collabs, recruiters: Browse Talent/Post Job/My Jobs)
- [x] Resume import only shows for candidates
- [x] 5 recruiter accounts + 11 job postings seeded in DB

### Auth Security & UX
- [x] Password confirm field (signup + password reset)
- [x] Password strength validation (8+ chars, uppercase, lowercase, number, special char)
- [x] Real-time password check indicators
- [x] Show/hide password eye toggle on all password fields
- [x] Account enumeration fix (generic messages)
- [x] Rate limit error handling
- [x] Submit disabled until all requirements met

---

## Priority 0 — Premium UX ($50M Startup Look & Feel)

### Toast Notifications
- [x] Toast notification system (success/error/info with glassmorphism + slide-in animation)
- [x] Replaced ALL `alert()` calls with toast() across entire app (zero remaining)
- [x] ToastProvider wrapping entire app
- [x] Auth page uses toasts (no inline error/success boxes)
- [x] CollaborationManager uses toasts

### Landing Page Upgrade
- [x] **"How it Works" section** — 3-step visual: Import Resume → AI Agent Goes Live → Get Matched
- [x] **Feature showcase** — 6 feature cards (AI Chat, Fit Scores, Job Matching, Resume Import, Analytics, Shareable Profile)
- [x] **CTA section** — Gradient banner with "Get Started Free" + "Browse Jobs First" dual CTAs
- [x] **Discover Talent section** — Updated copy to reflect AI platform positioning
- [x] **Social proof section** — 3-column stats (Portfolios Created, Jobs Matched, AI Chats This Week) with count-up animation, real Supabase counts
- [x] **Hero animation** — Animated gradient text on subtitle, simplified hero background to single subtle gradient orb

### Onboarding Wizard
- [x] 5-step wizard replacing massive single-page form: (1) Role & Resume (2) Personal Info (3) Professional (4) Skills & Links (5) Review & Publish
- [x] Gradient progress bar with step X of 5 label and clickable step indicators
- [x] Next/Back/Skip navigation (Skip available on steps 2-4 for optional fields)
- [x] Edit mode loads existing portfolio data and starts at Step 5 (Review)
- [x] Review step shows summary of all fields with per-section Edit buttons
- [x] All form state + AI handlers remain in parent, passed as props to step components
- [x] Sidebar removed (progress bar replaces it)

### Micro-interactions & Polish
- [x] Skeleton loaders on portfolio detail, profile, and jobs pages
- [x] Empty states cleaned up (collaborations, jobs — simpler icons, actionable text)
- [x] Page transition animations (fade on route change via PageTransition component wrapping layout children)
- [x] Element entrance animations (FadeIn component with Intersection Observer — stagger on How it Works, Features, CTA, Social Proof sections)

### Design System Consistency
- [x] Consistent card styles across portfolio detail, profile, jobs, collaborations
- [x] Removed hover:scale-105 from non-CTA elements
- [x] Consistent skill/tag styling across all pages
- [x] Global typography scale reference in globals.css (Display/Section/Card/Body/Label/Badge sizes)
- [x] Consistent button variants (primary/secondary/ghost/danger) as shared `Button.tsx` component with sm/md/lg sizes, href→Link support, loading/disabled states
- [x] Dark/light section alternation pattern on landing page (Hero→dark, Partners→dark, How it Works→white, Features→dark, CTA→gradient, Social Proof→white, Discover→gray-50)

---

## Priority 1 — Core Features

- [x] **GitHub profile scoring** — Analyzes repos, stars, forks, languages, activity → 0-100 score with level (Beginner/Growing/Intermediate/Advanced/Expert). Displayed on portfolio sidebar.
- [x] **Suggested jobs on profile page** — "Jobs For You" section with skill-matched link.
- [x] **Privacy field enforcement** — Private fields hidden from non-owners, visible to owner.
- [x] **Fix portfolio search** — Server-side Supabase `ilike` search on title, description, job_title, name columns (replaces client-side filtering). Skills/job title filters remain client-side for JSONB arrays.
- [x] **Proper TypeScript types** — Shared `src/types/index.ts` with Portfolio, PortfolioData, Job, JobMatch, Collaboration, Project, Skill, FitAssessment, InterviewQuestion, Analytics, ChatMessage, GitHubRepo, GitHubUser types. Replaced local type definitions in 8+ files.

## Priority 2 — Smart Job Intelligence (Stop Wasting Time)

### Job Eligibility & Transparency
- [x] **"Can You Apply?" eligibility badges** — Green (eligible), Yellow (restricted), Red (unlikely) per job based on user location vs job requirements. Detects US-only, EU-only remote restrictions. Shows reason on hover.
- [x] **Ghost job detection** — Flags stale listings (30+ days old, no salary, vague/short descriptions). Badges: "May be inactive" / "Possibly stale" with reasons on hover.
- [x] **Apply timing signal** — Hot/Warm/Neutral/Cold badges based on post age. "Apply now — first-batch applicants get 4x more interviews." Orange pulse animation for fresh posts.
- [ ] **Competition score per job** — Show estimated applicant count + user's percentile: "You're in the top 15% of applicants for this role."

### Smart Apply System
- [ ] **Quality-over-quantity mode** — Optional daily limit (e.g., 5 apps/day). Each application auto-attaches AI agent summary + fit score. Recruiter sees depth, not another resume in a pile of 400.

### Cross-Border & Remote Intelligence
- [ ] **Visa/sponsorship filter** — Tag jobs that sponsor visas or hire via EOR (Deel, Remote.com, etc.). Filter: "Hires internationally."
- [ ] **Truly global remote filter** — Distinguish "remote (US only)" from "remote (anywhere)". Show which companies are known global-remote employers.

### Existing Differentiators
- [x] **AI-to-AI matching** — API auto-scores all candidates against a job, returns ranked top 10 matches with skills analysis.
- [x] **"Don't Apply" honest signal** — Red "Skip" badge + icon on job cards where match score < 30.
- [x] **AI interview question generator** — Generates 5 role-specific prep questions (2 strength, 2 gap, 1 behavioral) with tips. Integrated into fit assessment results.
- [ ] **Shareable fit assessment cards** — Shareable image/link: "Luis scored 87% for Senior Frontend at Stripe." Free social distribution.
- [ ] **In-app notifications** — Alerts when someone chats with your AI, views your profile, or a matching job is posted.

## Priority 3 — Moat Builders (Hard to Copy)

- [ ] **Voice/video AI agent** — Candidate records 2-min intro video. AI references it in chat conversations.
- [ ] **Skill verification challenges** — AI-generated coding/design challenges → "Verified: React (Advanced)" badge.
- [ ] **Collaboration graph** — Visual network map of verified collaborations. Social proof that's hard to fake.
- [x] **Portfolio SEO pages** — Dynamic page title and meta description per portfolio profile.
- [ ] **API for ATS integration** — Let companies pull candidate data into Workday/Greenhouse/Lever.
- [ ] **User messaging** — Direct messages between candidates and recruiters within the platform.
- [ ] **Recruiter dashboard** — Saved searches, candidate shortlists, bulk AI chat, outreach tools.
- [ ] **Weekly AI career digest email** — "3 new jobs match your profile this week. Top match: Senior Dev at Acme (92%)."

## Priority 4 — Monetization

- [ ] **Free tier** — Profile + 5 AI chat messages/day + basic fit assessment + 3 job matches/week
- [ ] **Pro tier ($9/mo)** — Unlimited AI chat, vanity URL, analytics, weekly digest, priority in search
- [ ] **Recruiter tier ($49/mo)** — Dashboard, bulk AI chat, candidate shortlists, AI-to-AI matching
- [ ] **Featured profiles** — Pay to appear at top of search results for specific skills

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS |
| Backend | Next.js API Routes, Supabase (PostgreSQL) |
| AI | OpenAI GPT-4o-mini |
| Auth | Supabase Auth |
| Jobs API | JSearch (RapidAPI) — LinkedIn, Indeed, Glassdoor |
| Design | Custom SVG logo, Inter/Roboto/Poppins fonts |
| Deployment | Vercel |

## Database Tables

| Table | Purpose |
|-------|---------|
| `portfolios` | User profiles with skills, projects, privacy settings |
| `jobs` | Job listings (internal) |
| `collaborations` | Project collaboration invitations & verification |
| `portfolio_analytics` | View/chat/assessment tracking |
| `predefined_skills` | 70+ categorized skills for selection |
