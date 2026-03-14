# PortfolioHub Roadmap

## Vision
AI-powered talent platform where candidates control their narrative and recruiters evaluate depth — not keywords. Inspired by the broken hiring pipeline (0.4% success rate) and the need for a centralized hub that solves distribution, trust, and matching.

---

## Priority 1 — Ship Now (High Impact, Foundation Exists)

- [ ] **Verified by PortfolioHub trust badge** — AI only uses verified portfolio data, not candidate-controlled prompts. Badge displayed on profiles.
- [ ] **Privacy controls per field** — Users mark fields as public/private. NDA-safe mode for sensitive work history.
- [ ] **Profile view analytics** — Track views, AI chats, and fit assessments per profile. Dashboard for candidates.
- [ ] **Vanity URLs** — `portfoliohub.com/luis` instead of `/portfolio/uuid`. Shareable in emails, LinkedIn bios, resumes.
- [ ] **Suggested jobs on profile page** — When candidates view their own profile, show top matching jobs with AI scores.

## Priority 2 — Differentiators (What Nobody Else Has)

- [ ] **AI-to-AI matching** — Recruiter posts a job, system auto-scores all candidates and surfaces top 10 matches.
- [ ] **"Don't Apply" honest signal** — Visually flag jobs where candidate scores below 30. Builds trust through honesty.
- [ ] **Shareable fit assessment cards** — Generate shareable image/link after fit assessment for social media distribution.
- [ ] **Recruiter dashboard** — Saved searches, candidate shortlists, bulk AI chat, outreach tools.
- [ ] **Weekly AI career digest email** — "3 new jobs match your profile this week. Top match: Senior Dev at Acme (92%)."

## Priority 3 — Moat Builders (Hard to Copy)

- [ ] **Voice/video AI agent** — Candidate intro videos referenced by AI in chat conversations.
- [ ] **Skill verification challenges** — AI-generated coding/design challenges that add verified skill badges.
- [ ] **Collaboration graph** — Visual network of verified collaborations. Social proof that's hard to fake.
- [ ] **Portfolio SEO pages** — Meta tags, Open Graph images, structured data per profile for Google ranking.
- [ ] **API for ATS integration** — Let companies pull candidate data into Workday/Greenhouse/Lever.

## Priority 4 — Monetization

- [ ] **Free tier** — Profile + 5 AI chat messages/day + basic fit assessment
- [ ] **Pro tier ($9/mo)** — Unlimited AI chat, vanity URL, analytics, weekly digest, priority in search
- [ ] **Recruiter tier ($49/mo)** — Dashboard, bulk AI chat, candidate shortlists, AI-to-AI matching
- [ ] **Featured profiles** — Pay to appear at top of search results for specific skills

---

## Completed

- [x] AI Chat on portfolio pages (`/components/PortfolioChat.tsx`)
- [x] Fit Assessment tool (candidate-facing, paste job description)
- [x] Jobs listing page with filters (`/app/jobs/page.tsx`)
- [x] AI Job Match scoring per job (`/api/jobMatch`)
- [x] Post a Job page (`/app/jobs/post/page.tsx`)
- [x] Jobs table migration with RLS policies
- [x] Navigation updated with Jobs link
