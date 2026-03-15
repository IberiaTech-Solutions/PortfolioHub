# TalentAgent Roadmap

## Vision
AI-powered talent platform where candidates control their narrative and recruiters evaluate depth — not keywords. The platform where your AI agent represents you 24/7, jobs come to you with honest fit scores, and "show don't tell" replaces the broken resume game.

---

## Why TalentAgent Exists — The System is Broken

### The Problem (with data)

The hiring market in 2025-2026 is in an **"AI doom loop"** where trust has collapsed on both sides:

**For Job Seekers:**
- **250 applicants per job posting** on average — entry-level sees 400+. You're competing blind against hundreds of strangers.
- **27% of all job listings are ghost jobs** — companies post fake roles to look like they're growing (43%), make employees feel replaceable (62%), or farm talent pools (26%). 93% of HR professionals admit to this.
- **Only 0.1–2% of applications result in offers.** You need ~42 applications to land *one* interview. Most of your effort is wasted.
- **Location restrictions are silent killers** — "Remote" jobs on LinkedIn are often US-only or EU-only, but nobody tells you upfront. International candidates waste hours on jobs they're automatically disqualified from.
- **$298 million lost to job scams** in just the first half of 2025. AI bots now create entire fake listings to harvest personal data.

**For Recruiters:**
- **71% of recruiters encounter fake/misleading candidate info.** AI-generated resumes and synthetic identities are flooding pipelines.
- **34% of recruiters spend half their week** just filtering spam and junk applications.
- **15% of hiring professionals** have seen deepfake face-swapping in video interviews.
- The ATS keyword game has devolved into a race to the bottom — candidates stuff keywords, AI writes generic resumes, and real signal is buried in noise.

**The Root Cause:**
LinkedIn and traditional job boards treat hiring as a **volume game**: more applications, more postings, more keywords. This creates perverse incentives where candidates spray-and-pray, companies post ghost jobs, and AI makes the noise worse on both sides. **Nobody is optimizing for match quality or trust.**

### How TalentAgent Solves It

| Broken System Problem | TalentAgent Solution | Status |
|----------------------|---------------------|--------|
| **250 blind applications** — No signal on who should apply | **AI Fit Scoring** — Honest 0-100 score per job. "Don't Apply" signal when match < 30. You only apply where you actually fit. | Shipped |
| **27% ghost jobs** — Fake listings waste everyone's time | **Ghost Job Detection** — Flags stale postings (30+ days, no salary, vague descriptions). "May be inactive" badge protects your time. | Shipped |
| **6-second resume scans** — Resumes can't show depth | **AI Portfolio Agent** — Recruiters chat with your AI to understand your experience in depth. No more keyword bingo. | Shipped |
| **Silent location restrictions** — "Remote (US only)" isn't labeled | **Eligibility Badges** — Green/Yellow/Red per job. Detects US-only, EU-only restrictions. Visa sponsorship detection. "Hires Globally" filter. | Shipped |
| **Fake candidates flooding pipelines** — AI-generated resumes everywhere | **Verified Profiles** — GitHub scoring (real commit history), collaboration verification (third-party endorsements), "Verified by TalentAgent" badge. Depth that's hard to fake. | Shipped |
| **No idea how competitive a job is** — "100+ applicants" tells you nothing | **Competition Score** — Estimated applicant count + your percentile rank ("Top 15%") + timing signal ("Apply now — just posted"). | Shipped |
| **Application black hole** — Apply and never hear back | **In-App Notifications** — Real-time alerts when someone views your profile, chats with your AI, or a matching job is posted. | Shipped |
| **ATS keyword game** — Resumes optimized for robots, not humans | **AI Resume Parser + Skills Extraction** — Import your resume in 30 seconds. AI extracts real skills, not keyword-stuffed fluff. | Shipped |

### Our Thesis: Precision Beats Volume

> **LinkedIn treats job search as volume. TalentAgent treats it as precision.**

Every feature we build reinforces one principle: **apply less, match better, waste zero time.** We're building the anti-LinkedIn — a platform where:
- Fewer, higher-quality applications replace spray-and-pray
- Honest signals ("Don't Apply") build trust instead of false hope
- AI agents demonstrate depth that resumes can't capture
- Verified profiles and real collaboration proof replace keyword games
- Ghost job detection and eligibility filters protect everyone's time

### Market Opportunity

- **OpenAI is building a competing jobs platform** (announced Sept 2025) — validates the thesis that LinkedIn is vulnerable
- **43% of organizations** use AI for HR/recruiting in 2025, up from 26% in 2024 — 80%+ expected by 2027
- **Only 8% of job seekers** believe AI screening makes hiring fairer — massive trust gap = massive opportunity
- California and Ontario passing anti-ghost-job legislation — regulatory tailwind for transparency-first platforms

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
- [x] GitHub profile import — "Import from GitHub" button in onboarding wizard. Fetches name, bio, avatar, location, top languages as skills, top 5 repos as projects. `/api/importGithub` route.

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
- [x] **"The Problem" stats section** — 4-column grid with industry pain-point stats (250 applicants/job, 27% ghost jobs, 71% fake candidates, 0.1% offer rate) each tied to a TalentAgent solution. FadeIn stagger animation.

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
- [x] **Competition score per job** — Estimated applicant count based on job age/remote/level + user percentile rank ("Top X%") based on skill match. Color-coded Low/Moderate/Competitive/Very competitive labels.

### Paste-and-Check Fit
- [x] **"Check My Fit" page** (`/check-fit`) — Paste text OR paste URL (LinkedIn, Indeed, etc.). URL mode uses `/api/scrapeJob` to extract job description from any page. Falls back to text paste if scraping fails. AI returns fit score, strengths, gaps, advice, should-apply signal, and interview prep. Auto-detects URLs from clipboard. Added to nav for candidates (desktop + mobile).

### Smart Apply System
- [x] **Quality-over-quantity mode** — "Quality Mode" toggle on jobs page. Limits to 5 applications per day. Shows remaining count. Apply button disabled when limit reached. Encourages focus on best matches.
- [x] **Browser extension** — Chrome Manifest V3 extension in `/extension/` directory. Popup with fit score display, content script injects "Check Fit" button on LinkedIn/Indeed/Glassdoor job pages. Extracts job description from page DOM, calls TalentAgent API. Ready for Chrome Web Store submission.

### Cross-Border & Remote Intelligence
- [x] **"Hires Globally" filter** — Toggle that filters to truly global remote jobs, excluding US-only/EU-only restricted remote postings.
- [x] **"Eligible for Me" filter** — Toggle that hides jobs where user's location doesn't match requirements.
- [x] **"Hide Ghost Jobs" filter** — Toggle that removes stale/suspicious listings from results.
- [x] **Visa/sponsorship tagging** — Scans job descriptions for visa sponsorship signals (H1B, "will sponsor") and no-sponsorship signals. Detects EOR companies (Deel, Remote.com, Oyster, etc.). "Hires globally" / "Sponsors visa" / "No sponsorship" badges on job cards.

### Existing Differentiators
- [x] **AI-to-AI matching** — API auto-scores all candidates against a job, returns ranked top 10 matches with skills analysis.
- [x] **"Don't Apply" honest signal** — Red "Skip" badge + icon on job cards where match score < 30.
- [x] **AI interview question generator** — Generates 5 role-specific prep questions (2 strength, 2 gap, 1 behavioral) with tips. Integrated into fit assessment results.
- [x] **Shareable fit assessment cards** — Share button on fit results using Web Share API (with clipboard fallback). Shares score, verdict, and portfolio URL.
- [x] **In-app notifications** — NotificationBell component in nav with real-time Supabase subscriptions. Shows profile views, AI chats, job matches, assessments, collaborations. Unread badge count, mark all read, click-through links. Requires `notifications` table in Supabase.

## Priority 3 — Trust & Verification (Anti-Fraud)

- [x] **Verified by TalentAgent badge** — Trust badge component + DB flag for verified profiles.
- [x] **GitHub profile scoring** — Analyzes real commit history, repos, stars → proof of work that's hard to fake.
- [x] **Collaboration verification** — Third-party endorsements with email verification.
- [x] **Ghost job detection** — Flags stale/suspicious job listings with reasons.
- [x] **Verified employer badges** — VerifiedEmployerBadge component for job postings. Blue checkmark badge with "Verified Employer" label.
- [x] **Report suspicious listings** — Flag icon on every job card. Users can report ghost jobs or scam postings. Client-side tracking with future API backend hook.
- [x] **Activity-based trust score** — TrustScore utility computes 0-100 score from profile completeness, GitHub activity, projects, verified collaborations, platform activity, LinkedIn connection. TrustBadge component with expandable signal breakdown on portfolio pages.
- [x] **AI resume fraud detection** — `fraudDetection.ts` utility scores profiles 0-100 for suspicious signals: no GitHub, no projects, no collaborations, short/buzzword-heavy descriptions, skills/description mismatch, no LinkedIn, no photo, very new accounts. Returns risk level (none/low/medium/high) with detailed signal breakdown.

## Priority 4 — Moat Builders (Hard to Copy)

- [x] **Voice/video AI agent** — VideoIntro component for uploading 2-min intro videos. Playback on portfolio pages. File upload with preview. Ready for Supabase Storage integration.
- [x] **Skill verification challenges** — AI-generated challenges via `/api/skillChallenge` (GPT-4o-mini). SkillChallenge component: generates question → user answers → AI evaluates → pass/fail with score and level badge. Integrated into portfolio sidebar for profile owners.
- [x] **Collaboration graph** — SVG radial network visualization of verified collaborations. Owner in center, collaborators arranged radially with verified checkmarks. Shows on portfolio detail pages when collaborations exist.
- [x] **Portfolio SEO pages** — Dynamic page title and meta description per portfolio profile.
- [x] **API for ATS integration** — REST API at `/api/v1/` with API key auth. Endpoints: `GET /candidates` (search/filter/paginate), `GET /candidates/:id` (full profile), `GET /jobs` (list), `POST /jobs` (create). Ready for Workday/Greenhouse/Lever integration.
- [x] **User messaging** — MessageButton component on portfolio pages. Modal with textarea, creates/finds conversations, sends messages via Supabase. Requires `conversations` + `messages` tables. Shows on non-owner portfolio views.
- [x] **Recruiter dashboard** (`/recruiter`) — Stats cards (active jobs, views, chats, assessments), job posting list, candidate search with server-side ilike, saved recent searches, applicants table per job with fit scores. Role-gated to recruiter accounts. Added "Dashboard" to recruiter nav.
- [x] **Application tracking** — `job_applications` table type + tracking. Apply button records application with fit score. "Applied" badge replaces Apply button for tracked jobs. `/applications` page for candidates: stats bar (total/applied/interviewing/offered/rejected), filterable list, status update dropdown. Recruiter dashboard shows applicants table with fit scores.
- [x] **Weekly AI career digest** — `/api/weeklyDigest` route generates personalized digests for all candidates. Matches new jobs to skills, uses GPT-4o-mini for summary, delivers via notifications table. Vercel Cron configured for Monday 9am (`vercel.json`).

## Priority 5 — Monetization

- [x] **Pricing page** (`/pricing`) — 3-tier pricing cards (Free/Pro $9/mo/Recruiter $49/mo) with annual toggle (20% discount), feature comparison, Featured Profile add-on ($19/week), FAQ section. Pricing link in nav for non-logged-in users.
- [x] **Tier gating system** — `tierGating.ts` utility with per-tier limits (AI chats/day, fit assessments, job matches/week, vanity URL, analytics, API access, etc.). `canPerformAction()` helper returns allowed/denied with upgrade prompt.
- [x] **Featured profiles** — `is_featured` + `featured_skills` fields on Portfolio type. Search results sort featured profiles to top. Featured Profile add-on card on pricing page.
- [x] **Stripe integration** — Full Stripe setup: `/api/stripe/checkout` (creates checkout sessions), `/api/stripe/webhook` (handles subscription events, plan upgrades/downgrades, featured profile activation), `/api/stripe/portal` (customer billing portal). Pricing page wired to checkout. Webhook updates plan_tier in DB and sends notifications. `stripe` npm package installed.

---

## Priority 6 — Admin & Operations

- [x] **Admin role** — `admin` user_role type. Admin check utility (`adminAuth.ts`). Navigation shows "Admin" link in red for admin users.
- [x] **Admin dashboard** (`/admin`) — Platform stats (total users, candidates, recruiters, admins, active jobs, 7-day signups). Quick links to user/job/report management.
- [x] **User management** (`/admin/users`) — Full user table with search, role filter (candidate/recruiter/admin). Change user roles via dropdown. Toggle verified badge. View portfolio link.
- [x] **Job moderation** (`/admin/jobs`) — All jobs with ghost risk score, active/inactive toggle, delete. Sorted by newest.
- [x] **Reported content** (`/admin/reports`) — Review queue for flagged jobs/profiles/messages. Mark as reviewed or dismiss. Requires `reports` table in Supabase.
- [x] **Subscription management** — Plan distribution (Free/Pro/Recruiter counts) + MRR calculation on admin dashboard.
- [x] **AI usage monitoring** — AI chats + fit assessments counts (7-day) + estimated OpenAI cost on admin dashboard. `/api/admin/aiUsage` endpoint with admin auth.
- [x] **Audit log** — `auditLog.ts` utility logs role changes, verified toggles, job deactivations/deletions, report reviews. Recent actions displayed on admin dashboard. Requires `audit_log` table in Supabase.

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
| `notifications` | In-app notification feed (profile views, AI chats, job matches) |
| `conversations` | DM conversation threads between two users |
| `messages` | Individual messages within conversations |
| `job_applications` | Application tracking (user, job, status, fit score, dates) |
| `reports` | User-flagged content (jobs, profiles, messages) for admin review |
| `audit_log` | Admin action history (role changes, verifications, deletions) |
