# TalentAgent

**AI career tool for job seekers.** Paste any job → know if you should apply in 10 seconds.

## What it does

- **Check My Fit** — Paste a job description from LinkedIn, Indeed, or anywhere. AI gives you a fit score (0-100), strengths, gaps, and honest "Don't Apply" signals.
- **Smart Job Browse** — Jobs from Adzuna, RemoteOK, and Arbeitnow with ghost job detection, eligibility badges, competition scores, and timing signals.
- **AI Portfolio Agent** — Import your resume (PDF, DOCX, text) or GitHub profile. Your AI agent answers questions about your experience in depth.
- **Interview Prep** — AI generates role-specific questions with tips based on your fit assessment.
- **Chrome Extension** — Check fit scores directly on LinkedIn/Indeed/Glassdoor job pages.

## Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Supabase (PostgreSQL)
- **AI:** OpenAI GPT-4o-mini
- **Jobs:** Adzuna API, RemoteOK API, Arbeitnow API
- **Auth:** Supabase Auth
- **Payments:** Stripe (ready, not live)
- **Deployment:** Vercel

## Getting Started

```bash
git clone <repo-url>
cd PortfolioHub
npm install
cp .env.example .env.local  # Add your API keys
npm run dev
```

### Required Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
ADZUNA_APP_ID=
ADZUNA_APP_KEY=
```

### Optional

```
JSEARCH_API_KEY=        # Legacy job source
STRIPE_SECRET_KEY=      # For payments
STRIPE_WEBHOOK_SECRET=  # For Stripe webhooks
ATS_API_KEY=            # For v1 API auth
```

## Strategy

See [docs/strategy/ROADMAP.md](docs/strategy/ROADMAP.md) for the product roadmap and [docs/strategy/nate-b-jones-transcript.md](docs/strategy/nate-b-jones-transcript.md) for the research that shaped our tool-first approach.
