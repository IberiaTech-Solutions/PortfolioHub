import { NextRequest, NextResponse } from 'next/server';

type JSearchJob = {
  job_id: string;
  employer_name: string;
  employer_logo: string | null;
  job_title: string;
  job_description: string;
  job_city: string;
  job_state: string;
  job_country: string;
  job_apply_link: string;
  job_employment_type: string;
  job_is_remote: boolean;
  job_min_salary: number | null;
  job_max_salary: number | null;
  job_salary_currency: string | null;
  job_salary_period: string | null;
  job_required_skills: string[] | null;
  job_required_experience: {
    no_experience_required: boolean;
    required_experience_in_months: number | null;
    experience_mentioned: boolean;
  } | null;
  job_posted_at_datetime_utc: string;
};

// Simple in-memory cache to avoid burning API limits
const cache: { data: unknown; timestamp: number; query: string } = {
  data: null,
  timestamp: 0,
  query: '',
};
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

function mapEmploymentType(type: string): string {
  const map: Record<string, string> = {
    FULLTIME: 'full-time',
    PARTTIME: 'part-time',
    CONTRACTOR: 'contract',
    INTERN: 'internship',
    FREELANCE: 'freelance',
  };
  return map[type] || 'full-time';
}

function estimateLevel(job: JSearchJob): string {
  const title = job.job_title.toLowerCase();
  const desc = job.job_description?.toLowerCase() || '';
  const months = job.job_required_experience?.required_experience_in_months || 0;

  if (title.includes('lead') || title.includes('principal') || title.includes('staff') || title.includes('director')) return 'lead';
  if (title.includes('senior') || title.includes('sr.') || title.includes('sr ') || months >= 60) return 'senior';
  if (title.includes('junior') || title.includes('jr.') || title.includes('jr ') || title.includes('entry') || job.job_required_experience?.no_experience_required) return 'junior';
  if (months > 0 && months < 36) return 'junior';
  if (desc.includes('5+ years') || desc.includes('7+ years') || desc.includes('8+ years')) return 'senior';
  return 'mid';
}

function extractSkills(job: JSearchJob): string[] {
  if (job.job_required_skills && job.job_required_skills.length > 0) {
    return job.job_required_skills.slice(0, 10);
  }

  // Fallback: extract common skills from description
  const desc = job.job_description?.toLowerCase() || '';
  const title = job.job_title?.toLowerCase() || '';
  const combined = `${title} ${desc}`;

  const skillPatterns = [
    'react', 'angular', 'vue', 'next.js', 'node.js', 'python', 'java', 'go',
    'rust', 'typescript', 'javascript', 'swift', 'kotlin', 'ruby', 'php',
    'postgresql', 'mongodb', 'mysql', 'redis', 'elasticsearch',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform',
    'figma', 'sketch', 'adobe', 'photoshop',
    'machine learning', 'deep learning', 'nlp', 'pytorch', 'tensorflow',
    'graphql', 'rest api', 'microservices', 'ci/cd', 'agile', 'scrum',
    'git', 'linux', 'sql', 'nosql', 'html', 'css', 'tailwind',
  ];

  return skillPatterns
    .filter((skill) => combined.includes(skill))
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .slice(0, 8);
}

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.JSEARCH_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Job search API not configured', jobs: [] },
        { status: 200 } // Return 200 with empty jobs so UI doesn't break
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || 'software developer';
    const page = searchParams.get('page') || '1';
    const remote = searchParams.get('remote_only') || 'false';
    const location = searchParams.get('location') || '';
    const employment = searchParams.get('employment_type') || '';

    // Build cache key
    const cacheKey = `${query}-${page}-${remote}-${location}-${employment}`;

    // Check cache
    if (cache.data && cache.query === cacheKey && Date.now() - cache.timestamp < CACHE_TTL) {
      return NextResponse.json(cache.data);
    }

    // Build JSearch query params
    const params = new URLSearchParams({
      query: location ? `${query} in ${location}` : query,
      page,
      num_pages: '1',
      date_posted: 'month',
    });

    if (remote === 'true') {
      params.set('remote_jobs_only', 'true');
    }

    if (employment) {
      params.set('employment_types', employment.toUpperCase());
    }

    const response = await fetch(
      `https://jsearch.p.rapidapi.com/search?${params.toString()}`,
      {
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
        },
      }
    );

    if (!response.ok) {
      console.error('JSearch API error:', response.status, await response.text());
      return NextResponse.json({ error: 'Failed to fetch jobs', jobs: [] });
    }

    const data = await response.json();
    const jsearchJobs: JSearchJob[] = data.data || [];

    // Transform to our job format
    const jobs = jsearchJobs.map((job) => {
      const locationStr = [job.job_city, job.job_state, job.job_country]
        .filter(Boolean)
        .join(', ');

      return {
        id: job.job_id,
        title: job.job_title,
        company: job.employer_name,
        company_logo: job.employer_logo,
        description: job.job_description?.slice(0, 500) + (job.job_description?.length > 500 ? '...' : ''),
        location: locationStr || (job.job_is_remote ? 'Remote' : 'Not specified'),
        work_type: mapEmploymentType(job.job_employment_type),
        remote_policy: job.job_is_remote ? 'remote' : 'onsite',
        experience_level: estimateLevel(job),
        salary_min: job.job_min_salary,
        salary_max: job.job_max_salary,
        salary_currency: job.job_salary_currency || 'USD',
        skills: extractSkills(job),
        application_url: job.job_apply_link,
        is_active: true,
        created_at: job.job_posted_at_datetime_utc || new Date().toISOString(),
        source: 'external',
      };
    });

    const result = { jobs, total: data.total || jobs.length };

    // Update cache
    cache.data = result;
    cache.timestamp = Date.now();
    cache.query = cacheKey;

    return NextResponse.json(result);
  } catch (error) {
    console.error('Fetch jobs error:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs', jobs: [] });
  }
}
