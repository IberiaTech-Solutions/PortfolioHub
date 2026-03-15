# TalentAgent Roadmap

## Vision
**TalentAgent is an AI career tool for job seekers.** Not a job board. Not a LinkedIn competitor. A tool you use *alongside* LinkedIn, Indeed, and Glassdoor to make smarter career decisions.

**One-liner:** Paste any job → know if you should apply in 10 seconds.

**What we are:** AI career copilot — fit scoring, ghost job detection, resume analysis, interview prep.
**What we're NOT:** A platform that needs recruiters, job postings, or network effects to work.

---

## Why Tool, Not Platform

- LinkedIn has 1B users + 20 years of network effects. Every LinkedIn competitor has failed.
- Tools work for 1 user on day 1. No chicken-and-egg problem.
- Teal ($29/mo), Jobscan ($24/mo), Careerflow ($19/mo) prove the model — $750M market growing to $1.2B.
- Our edge: honest fit scores + "Don't Apply" signals + ghost detection + AI agent. Nobody else does this.

**Inspired by:** Nate B Jones — "Stop Competing With 400 Applicants" (156K views)
**Full transcript:** [nate-b-jones-transcript.md](nate-b-jones-transcript.md)

**Two-product strategy:**
1. **Check My Fit** (top of funnel) — Free tool. Paste a job → get a score. Growth engine.
2. **AI Portfolio Agent** (depth) — Import resume → AI represents you. Monetization ($9/mo Pro).

---

## What's Shipped

### Core Tool
- [x] **Check My Fit** (`/check-fit`) — Paste text or URL from any job board → AI fit score, strengths, gaps, advice, interview prep
- [x] **AI Portfolio Agent** — Import resume (PDF, DOCX, text) or GitHub → AI chat that represents you to anyone who asks
- [x] **Smart Job Browse** (`/jobs`) — Jobs from Adzuna, RemoteOK, Arbeitnow with fit scores, ghost detection, eligibility badges, competition scores, timing signals, visa/sponsorship detection
- [x] **Ghost Job Detection** — Flags stale/suspicious listings (30+ days, no salary, vague descriptions)
- [x] **Apply Confirmation** — "Did you apply?" flow so we only track real applications
- [x] **Interview Prep** — AI generates role-specific questions (2 strength, 2 gap, 1 behavioral) with tips
- [x] **Chrome Extension** — Manifest V3, injects "Check Fit" button on LinkedIn/Indeed/Glassdoor pages
- [x] **Resume Import** — PDF (pdf-parse), Word DOCX (mammoth), text, GitHub profile import
- [x] **5-Step Onboarding Wizard** — Role detection from signup, progress bar, skip optional steps

### Infrastructure
- [x] Multi-source job aggregation (Adzuna + RemoteOK + Arbeitnow + JSearch fallback)
- [x] Auth (Supabase email/password, admin via app_metadata)
- [x] Shared TypeScript types across 15+ files
- [x] Server-side search (Supabase ilike)
- [x] Security headers, SSRF protection, auth cookie checks on AI routes
- [x] SEO (sitemap, robots.txt, per-page metadata, OG images)
- [x] Error/404/Loading pages
- [x] Stripe integration (checkout, webhook, portal — ready for when we go live)
- [x] Admin panel (dashboard, user management, job moderation)
- [x] DB migration scripts with RLS policies + indexes

---

## NOW: What We're Focused On

### Phase 1: Make the Tool Perfect (Current Sprint)

**Check My Fit (Lead Gen):**
- [ ] **Check My Fit without signup** — Let anyone paste a job and get a basic score. Signup unlocks full results + interview prep. This is the growth hook.
- [x] **Landing page as the tool** — Homepage IS the paste box. 237 lines. Hero + How it Works + Problem Stats + Chrome Extension + CTA. No platform marketing.
- [ ] **Share fit results** — "I scored 87% for Senior Frontend at Stripe" shareable cards for Twitter/LinkedIn. Free distribution.

**AI Portfolio (Conversion — from transcript):**
- [ ] **"View AI Context" per experience** — Each work experience bullet has an expandable "View the full story" section. AI generates the real narrative behind each claim. Like Nate's demo: "He inherited a $4M/yr AWS spend → built cost transparency → rightsized instances." Shows depth that resumes can't.
- [ ] **Skills: Strong / Moderate / Gaps** — Three-column skill display on the portfolio page. Publishing your gaps signals confidence and self-awareness. "Platform architecture = strong, consumer product = weak." Hiring managers find this refreshing.
- [ ] **Two-way fit assessment on profile** — Employer visits your profile → pastes THEIR job description → your AI honestly tells them if you're a fit or not. This is the power move from the transcript: "Let's figure out together whether this makes sense."
- [ ] **Early-career mode** — Detect thin profiles (< 2 years experience, few projects) and suggest a different layout: stories of learning, projects undertaken, things built. Per transcript: "An AI trained on two internships won't sustain deep interrogation — you need a portfolio that shows you can ramp."

**Distribution:**
- [ ] **Chrome extension → Chrome Web Store** — Polish, test on real LinkedIn/Indeed pages, publish. #1 growth channel.
- [ ] **Mobile responsive polish** — Test every page on phone, fix layout issues

### Phase 2: Growth & Retention
- [ ] **Usage analytics** — Track fit checks per user, conversion to signup, most-checked companies
- [ ] **Email capture on free fit check** — "Want the full breakdown? Enter your email."
- [ ] **Weekly email digest** — "3 jobs matched you this week. Top: Senior Dev at Acme (92%)" — needs email provider (Resend/SendGrid)
- [ ] **Social proof on landing** — Real fit check count: "12,847 fit checks this week"
- [ ] **SEO content** — Blog posts: "Is [Company] hiring? AI fit analysis" — programmatic SEO
- [ ] **"AI Context" for all experience items** — Auto-generate the full story behind each bullet point when user creates profile. This is the depth Nate talks about: "the situation, the approach, the lesson learned."
- [ ] **Shareable profile as vanity URL** — talentagent.com/username becomes the "personal site of your dreams" that Nate describes. The profile IS the interface employers land on.

### Phase 3: Monetization
- [ ] **Free tier** — 3 fit checks/day, basic job browse, ghost detection
- [ ] **Pro tier ($9/mo)** — Unlimited fit checks, AI portfolio agent, interview prep, competition scores, weekly digest
- [ ] **Stripe go-live** — Create products/prices in Stripe Dashboard, connect webhooks
- [ ] **Usage gating** — Enforce free tier limits, show upgrade prompts

### Phase 4: Scale
- [ ] **Mobile app** — React Native wrapper for Check My Fit + Jobs
- [ ] **Browser extension for Firefox/Safari**
- [ ] **API for partners** — Let career coaches, bootcamps, universities embed fit checks
- [ ] **Internationalization** — Multi-language support, region-specific job sources

---

## Removed (Platform Features)
These were built but removed in the tool-first pivot. Code exists in git history if needed:
- Recruiter dashboard, job posting page
- User messaging system
- Collaboration system (invite, verify, track)
- Application tracking page
- ATS API (v1/candidates, v1/jobs)
- Notification bell + real-time subscriptions
- Skill verification challenges
- Trust score + fraud detection
- Verified badges, privacy toggles
- Weekly digest cron job

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS |
| Backend | Next.js API Routes, Supabase (PostgreSQL) |
| AI | OpenAI GPT-4o-mini |
| Auth | Supabase Auth (admin role via app_metadata) |
| Jobs | Adzuna API, RemoteOK API, Arbeitnow API |
| Payments | Stripe (ready, not live) |
| Deployment | Vercel |

## Database Tables

| Table | Purpose |
|-------|---------|
| `portfolios` | User profiles — skills, projects, experience, AI chat context |
| `jobs` | Internal job listings (most jobs come from Adzuna/RemoteOK APIs) |
| `portfolio_analytics` | Tracks views, AI chats, fit assessments per portfolio |
| `predefined_skills` | 70+ categorized skills for onboarding combobox |
| `job_applications` | Tracks confirmed applications ("Did you apply?" flow) |

5 tables. Everything else was dropped in the tool-first pivot.
