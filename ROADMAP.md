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
- [x] Codebase cleanup (removed dead search page, unused ScreenshotPreview component)

### AI Resume Intelligence
- [x] AI resume parser API — upload/paste resume, AI extracts structured data
- [x] Resume import UI on create-portfolio page (file upload + text paste)

---

## Priority 1 — Polish & Ship (Fix What's Built)

- [ ] **GitHub profile scoring** — Analyze repos, commit frequency, languages, stars → generate a developer credibility score. AI agent references it.
- [ ] **Suggested jobs on profile page** — Show top 3 matching jobs with AI scores when candidates view their own profile.
- [ ] **Privacy field enforcement** — Portfolio detail page hides private fields from non-owners. Currently saves to DB but doesn't filter on display.
- [ ] **Fix portfolio search** — Replace basic text matching with PostgreSQL full-text search.
- [ ] **Proper TypeScript types** — Replace `as unknown as` casts with shared type definitions.

## Priority 2 — Differentiators (What Nobody Else Has)

- [ ] **AI-to-AI matching** — When a recruiter posts a job, auto-score ALL candidates and surface top 10 matches. Recruiter sees a ranked list instantly.
- [ ] **"Don't Apply" honest signal** — On the jobs page, visually flag jobs where candidate scores below 30. Red badge: "Not a match — save your time."
- [ ] **Shareable fit assessment cards** — Generate a shareable image/link after assessment: "Luis scored 87% for Senior Frontend at Stripe." Candidates share on social = free distribution.
- [ ] **Recruiter dashboard** — Saved searches, candidate shortlists, bulk AI chat ("ask all 10 about distributed systems"), outreach tools.
- [ ] **Weekly AI career digest email** — "3 new jobs match your profile this week. Top match: Senior Dev at Acme (92%)."
- [ ] **AI interview question generator** — Based on job description + candidate gaps, generate personalized prep questions. Helps candidates prepare, shows recruiters you're serious.
- [ ] **In-app notifications** — Alert candidates when someone chats with their AI, views their profile, or a matching job is posted.

## Priority 3 — Moat Builders (Hard to Copy)

- [ ] **Voice/video AI agent** — Candidates record a 2-min intro video. AI references it in chat.
- [ ] **Skill verification challenges** — AI-generated coding/design challenges that add "Verified: React (Advanced)" badge.
- [ ] **Collaboration graph** — Visual network map of who worked with whom. Social proof that's hard to fake.
- [ ] **Portfolio SEO pages** — Dynamic meta tags, Open Graph images, structured data per profile. Google finds your candidates.
- [ ] **API for ATS integration** — Let companies pull candidate data into Workday/Greenhouse/Lever. Enterprise gateway.
- [ ] **User messaging** — Direct messages between candidates and recruiters within the platform.

## Priority 4 — Monetization

- [ ] **Free tier** — Profile + 5 AI chat messages/day + basic fit assessment + 3 job matches/week
- [ ] **Pro tier ($9/mo)** — Unlimited AI chat, vanity URL, analytics, weekly digest, priority in search
- [ ] **Recruiter tier ($49/mo)** — Dashboard, bulk AI chat, candidate shortlists, AI-to-AI matching, advanced filters
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
