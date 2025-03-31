# PortfolioHub

A platform for developers, designers, and other professionals to showcase their portfolios and be discovered by potential employers or clients.

## Features

- User authentication (sign up, sign in)
- Create and edit your portfolio
- Showcase your skills and projects
- Search for professionals by skills or job titles
- Browse through portfolios of talented individuals

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Supabase (Authentication & Database)
- Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project

### Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd portfoliohub
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file in the root directory with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Set up your Supabase database schema:

   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor
   - Copy the contents of `supabase/schema.sql`
   - Run the SQL to create the necessary tables and policies

5. Start the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Database Structure

The application uses a single main table:

### portfolios

- `id`: UUID - Primary key
- `user_id`: UUID - Foreign key to Supabase auth.users
- `title`: Text - Portfolio headline
- `name`: Text - User's full name
- `job_title`: Text - Current job title
- `description`: Text - About section
- `website_url`: Text - Link to personal website
- `skills`: Text Array - List of skills
- `created_at`: Timestamp
- `updated_at`: Timestamp

## Deployment

This project can be easily deployed on Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2Fportfoliohub)

Make sure to add your environment variables in the Vercel project settings.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
