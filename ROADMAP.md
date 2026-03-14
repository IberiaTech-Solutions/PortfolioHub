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

---

## Priority 0 — Premium UX ($50M Startup Look & Feel)

### Toast Notifications
- [x] Toast notification system (success/error/info with glassmorphism + slide-in animation)
- [x] Replaced all `alert()` calls with toast() across create-portfolio page
- [x] ToastProvider wrapping entire app

### Landing Page Upgrade
- [x] **"How it Works" section** — 3-step visual: Import Resume → AI Agent Goes Live → Get Matched
- [x] **Feature showcase** — 6 feature cards (AI Chat, Fit Scores, Job Matching, Resume Import, Analytics, Shareable Profile)
- [x] **CTA section** — Gradient banner with "Get Started Free" + "Browse Jobs First" dual CTAs
- [x] **Discover Talent section** — Updated copy to reflect AI platform positioning
- [ ] **Social proof section** — User count, testimonials, "X jobs matched this week" live counter
- [ ] **Hero animation** — Animated gradient text, floating UI mockup preview

### Onboarding Wizard
- [ ] Step-by-step flow replacing the massive form: (1) Import resume or start fresh (2) Review extracted data (3) Add skills (4) Upload photo (5) Your AI agent is live
- [ ] Progress bar showing completion percentage
- [ ] Skip options for non-essential fields

### Micro-interactions & Polish
- [ ] Page transition animations (fade/slide between routes)
- [ ] Skeleton loaders on all data-fetching pages (replace spinners)
- [ ] Element entrance animations (stagger cards, fade-in sections on scroll)
- [ ] Hover micro-animations on all interactive elements
- [ ] Empty state illustrations with actionable CTAs

### Design System Consistency
- [ ] Global typography scale (display/h1/h2/h3/body/caption with consistent sizes)
- [ ] 8px spacing grid enforced across all pages
- [ ] Consistent card styles (one shared component for all card patterns)
- [ ] Consistent button variants (primary/secondary/ghost/danger)
- [ ] Dark/light section alternation pattern on landing page

---

## Priority 1 — Core Features

- [ ] **GitHub profile scoring** — Analyze repos, commit frequency, languages, stars → developer credibility score. AI agent references it in chat.
- [ ] **Suggested jobs on profile page** — Show top 3 matching jobs with AI scores on candidate's own profile.
- [ ] **Privacy field enforcement** — Hide private fields from non-owners on portfolio detail page.
- [ ] **Fix portfolio search** — PostgreSQL full-text search replacing basic text matching.
- [ ] **Proper TypeScript types** — Shared type definitions replacing `as unknown as` casts.

## Priority 2 — Differentiators (What Nobody Else Has)

- [ ] **AI-to-AI matching** — Recruiter posts a job → system auto-scores ALL candidates → surfaces top 10 matches instantly.
- [ ] **"Don't Apply" honest signal** — Red badge on jobs where candidate scores below 30: "Not a match — save your time."
- [ ] **Shareable fit assessment cards** — Shareable image/link: "Luis scored 87% for Senior Frontend at Stripe." Free social distribution.
- [ ] **Recruiter dashboard** — Saved searches, candidate shortlists, bulk AI chat, outreach tools.
- [ ] **Weekly AI career digest email** — "3 new jobs match your profile this week. Top match: Senior Dev at Acme (92%)."
- [ ] **AI interview question generator** — Role-specific prep questions based on job + candidate gap analysis.
- [ ] **In-app notifications** — Alerts when someone chats with your AI, views your profile, or a matching job is posted.

## Priority 3 — Moat Builders (Hard to Copy)

- [ ] **Voice/video AI agent** — Candidate records 2-min intro video. AI references it in chat conversations.
- [ ] **Skill verification challenges** — AI-generated coding/design challenges → "Verified: React (Advanced)" badge.
- [ ] **Collaboration graph** — Visual network map of verified collaborations. Social proof that's hard to fake.
- [ ] **Portfolio SEO pages** — Dynamic meta tags, Open Graph images, structured data per profile.
- [ ] **API for ATS integration** — Let companies pull candidate data into Workday/Greenhouse/Lever.
- [ ] **User messaging** — Direct messages between candidates and recruiters within the platform.

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
