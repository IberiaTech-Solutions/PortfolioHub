import { NextRequest, NextResponse } from 'next/server';

// Multi-source job aggregator: Adzuna + RemoteOK + Arbeitnow + Findwork + Jobicy + The Muse
// All free APIs — no paid subscriptions required

// In-memory cache
const cache: { data: unknown; timestamp: number; query: string } = {
  data: null,
  timestamp: 0,
  query: '',
};
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

// Skill extraction from description
const SKILL_PATTERNS = [
  'react', 'angular', 'vue', 'next.js', 'node.js', 'python', 'java', 'go',
  'rust', 'typescript', 'javascript', 'swift', 'kotlin', 'ruby', 'php',
  'postgresql', 'mongodb', 'mysql', 'redis', 'elasticsearch',
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform',
  'figma', 'sketch', 'adobe', 'photoshop',
  'machine learning', 'deep learning', 'nlp', 'pytorch', 'tensorflow',
  'graphql', 'rest api', 'microservices', 'ci/cd', 'agile', 'scrum',
  'git', 'linux', 'sql', 'nosql', 'html', 'css', 'tailwind',
];

function extractSkills(text: string): string[] {
  const lower = text.toLowerCase();
  return SKILL_PATTERNS
    .filter((skill) => lower.includes(skill))
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .slice(0, 8);
}

function estimateLevelFromTitle(title: string): string {
  const t = title.toLowerCase();
  if (t.includes('lead') || t.includes('principal') || t.includes('staff') || t.includes('director') || t.includes('head of')) return 'lead';
  if (t.includes('senior') || t.includes('sr.') || t.includes('sr ')) return 'senior';
  if (t.includes('junior') || t.includes('jr.') || t.includes('jr ') || t.includes('entry') || t.includes('intern') || t.includes('graduate')) return 'junior';
  return 'mid';
}

// --- Adzuna ---
async function fetchAdzuna(query: string, location: string): Promise<Array<Record<string, unknown>>> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) return [];

  try {
    const country = 'us'; // Default to US
    const params = new URLSearchParams({
      app_id: appId,
      app_key: appKey,
      results_per_page: '20',
      what: query,
      content_type: 'application/json',
      max_days_old: '30',
    });
    if (location) params.set('where', location);

    const res = await fetch(`https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params}`);
    if (!res.ok) return [];

    const data = await res.json();
    return (data.results || []).map((job: {
      id: string;
      title: string;
      company?: { display_name: string };
      description: string;
      location?: { display_name: string; area?: string[] };
      redirect_url: string;
      contract_type?: string;
      contract_time?: string;
      salary_min?: number;
      salary_max?: number;
      created: string;
      category?: { label: string };
    }) => ({
      id: `adzuna-${job.id}`,
      title: job.title,
      company: job.company?.display_name || 'Unknown',
      company_logo: null,
      description: (job.description || '').slice(0, 500),
      location: job.location?.display_name || 'Not specified',
      work_type: job.contract_time === 'part_time' ? 'part-time' : 'full-time',
      remote_policy: (job.title + ' ' + job.description).toLowerCase().includes('remote') ? 'remote' : 'onsite',
      experience_level: estimateLevelFromTitle(job.title),
      salary_min: job.salary_min || null,
      salary_max: job.salary_max || null,
      salary_currency: 'USD',
      skills: extractSkills(job.title + ' ' + job.description),
      application_url: job.redirect_url,
      is_active: true,
      created_at: job.created || new Date().toISOString(),
      source: 'adzuna',
    }));
  } catch {
    return [];
  }
}

// --- RemoteOK ---
async function fetchRemoteOK(): Promise<Array<Record<string, unknown>>> {
  try {
    const res = await fetch('https://remoteok.com/api', {
      headers: { 'User-Agent': 'TalentAgent/1.0' },
    });
    if (!res.ok) return [];

    const data = await res.json();
    // First element is metadata, skip it
    const jobs = Array.isArray(data) ? data.slice(1) : [];

    return jobs.slice(0, 20).map((job: {
      id: string;
      position: string;
      company: string;
      company_logo: string;
      description: string;
      location: string;
      tags: string[];
      url: string;
      salary_min?: number;
      salary_max?: number;
      date: string;
    }) => ({
      id: `remoteok-${job.id}`,
      title: job.position || 'Untitled',
      company: job.company || 'Unknown',
      company_logo: job.company_logo || null,
      description: (job.description || '').replace(/<[^>]+>/g, '').slice(0, 500),
      location: job.location || 'Remote',
      work_type: 'full-time',
      remote_policy: 'remote',
      experience_level: estimateLevelFromTitle(job.position || ''),
      salary_min: job.salary_min || null,
      salary_max: job.salary_max || null,
      salary_currency: 'USD',
      skills: (job.tags || []).slice(0, 8).map((t: string) => t.charAt(0).toUpperCase() + t.slice(1)),
      application_url: job.url,
      is_active: true,
      created_at: job.date || new Date().toISOString(),
      source: 'remoteok',
    }));
  } catch {
    return [];
  }
}

// --- Arbeitnow ---
async function fetchArbeitnow(): Promise<Array<Record<string, unknown>>> {
  try {
    const res = await fetch('https://www.arbeitnow.com/api/job-board-api');
    if (!res.ok) return [];

    const data = await res.json();
    const jobs = data.data || [];

    return jobs.slice(0, 20).map((job: {
      slug: string;
      title: string;
      company_name: string;
      description: string;
      location: string;
      remote: boolean;
      tags: string[];
      url: string;
      created_at: number;
    }) => ({
      id: `arbeitnow-${job.slug}`,
      title: job.title,
      company: job.company_name || 'Unknown',
      company_logo: null,
      description: (job.description || '').replace(/<[^>]+>/g, '').slice(0, 500),
      location: job.location || (job.remote ? 'Remote' : 'Not specified'),
      work_type: 'full-time',
      remote_policy: job.remote ? 'remote' : 'onsite',
      experience_level: estimateLevelFromTitle(job.title),
      salary_min: null,
      salary_max: null,
      salary_currency: 'USD',
      skills: (job.tags || []).slice(0, 8),
      application_url: job.url,
      is_active: true,
      created_at: job.created_at ? new Date(job.created_at * 1000).toISOString() : new Date().toISOString(),
      source: 'arbeitnow',
    }));
  } catch {
    return [];
  }
}

// --- JSearch (legacy, if API key still works) ---
async function fetchJSearch(query: string, location: string, remote: string): Promise<Array<Record<string, unknown>>> {
  const apiKey = process.env.JSEARCH_API_KEY;
  if (!apiKey) return [];

  try {
    const apiHost = process.env.JSEARCH_API_HOST || 'jsearch27.p.rapidapi.com';
    const params = new URLSearchParams({
      query: location ? `${query} in ${location}` : query,
      page: '1',
      num_pages: '1',
      date_posted: 'month',
    });
    if (remote === 'true') params.set('remote_jobs_only', 'true');

    const res = await fetch(`https://${apiHost}/search?${params}`, {
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': apiHost,
      },
    });
    if (!res.ok) return [];

    const data = await res.json();
    return (data.data || []).map((job: {
      job_id: string; job_title: string; employer_name: string; employer_logo: string | null;
      job_description: string; job_city: string; job_state: string; job_country: string;
      job_apply_link: string; job_employment_type: string; job_is_remote: boolean;
      job_min_salary: number | null; job_max_salary: number | null; job_salary_currency: string | null;
      job_required_skills: string[] | null; job_posted_at_datetime_utc: string;
    }) => ({
      id: `jsearch-${job.job_id}`,
      title: job.job_title,
      company: job.employer_name,
      company_logo: job.employer_logo,
      description: (job.job_description || '').slice(0, 500),
      location: [job.job_city, job.job_state, job.job_country].filter(Boolean).join(', ') || 'Not specified',
      work_type: 'full-time',
      remote_policy: job.job_is_remote ? 'remote' : 'onsite',
      experience_level: estimateLevelFromTitle(job.job_title),
      salary_min: job.job_min_salary,
      salary_max: job.job_max_salary,
      salary_currency: job.job_salary_currency || 'USD',
      skills: job.job_required_skills?.slice(0, 8) || extractSkills(job.job_title + ' ' + job.job_description),
      application_url: job.job_apply_link,
      is_active: true,
      created_at: job.job_posted_at_datetime_utc || new Date().toISOString(),
      source: 'jsearch',
    }));
  } catch {
    return [];
  }
}

// --- Findwork.dev ---
async function fetchFindwork(query: string): Promise<Array<Record<string, unknown>>> {
  try {
    const params = new URLSearchParams({ search: query, order_by: '-date_posted' });
    const res = await fetch(`https://findwork.dev/api/jobs/?${params}`, {
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) return [];

    const data = await res.json();
    return (data.results || []).slice(0, 20).map((job: {
      id: number;
      role: string;
      company_name: string;
      company_logo: string | null;
      text: string;
      location: string;
      remote: boolean;
      url: string;
      keywords: string[];
      date_posted: string;
    }) => ({
      id: `findwork-${job.id}`,
      title: job.role || 'Untitled',
      company: job.company_name || 'Unknown',
      company_logo: job.company_logo || null,
      description: (job.text || '').replace(/<[^>]+>/g, '').slice(0, 500),
      location: job.location || (job.remote ? 'Remote' : 'Not specified'),
      work_type: 'full-time',
      remote_policy: job.remote ? 'remote' : 'onsite',
      experience_level: estimateLevelFromTitle(job.role || ''),
      salary_min: null,
      salary_max: null,
      salary_currency: 'USD',
      skills: (job.keywords || []).slice(0, 8).map((k: string) => k.charAt(0).toUpperCase() + k.slice(1)),
      application_url: job.url,
      is_active: true,
      created_at: job.date_posted || new Date().toISOString(),
      source: 'findwork',
    }));
  } catch {
    return [];
  }
}

// --- Jobicy ---
async function fetchJobicy(query: string): Promise<Array<Record<string, unknown>>> {
  try {
    const params = new URLSearchParams({
      count: '20',
      tag: query,
    });
    const res = await fetch(`https://jobicy.com/api/v2/remote-jobs?${params}`);
    if (!res.ok) return [];

    const data = await res.json();
    return (data.jobs || []).map((job: {
      id: number;
      jobTitle: string;
      companyName: string;
      companyLogo: string | null;
      jobDescription: string;
      jobGeo: string;
      url: string;
      jobType: string[];
      annualSalaryMin: number | null;
      annualSalaryMax: number | null;
      salaryCurrency: string | null;
      pubDate: string;
    }) => ({
      id: `jobicy-${job.id}`,
      title: job.jobTitle || 'Untitled',
      company: job.companyName || 'Unknown',
      company_logo: job.companyLogo || null,
      description: (job.jobDescription || '').replace(/<[^>]+>/g, '').slice(0, 500),
      location: job.jobGeo || 'Remote',
      work_type: (job.jobType || []).includes('part-time') ? 'part-time' : 'full-time',
      remote_policy: 'remote',
      experience_level: estimateLevelFromTitle(job.jobTitle || ''),
      salary_min: job.annualSalaryMin || null,
      salary_max: job.annualSalaryMax || null,
      salary_currency: job.salaryCurrency || 'USD',
      skills: extractSkills(job.jobTitle + ' ' + job.jobDescription),
      application_url: job.url,
      is_active: true,
      created_at: job.pubDate || new Date().toISOString(),
      source: 'jobicy',
    }));
  } catch {
    return [];
  }
}

// --- The Muse ---
async function fetchTheMuse(query: string): Promise<Array<Record<string, unknown>>> {
  const apiKey = process.env.THEMUSE_API_KEY;
  if (!apiKey) return [];

  try {
    const params = new URLSearchParams({
      api_key: apiKey,
      page: '0',
      descending: 'true',
    });
    if (query) params.set('category', query);

    const res = await fetch(`https://www.themuse.com/api/public/jobs?${params}`);
    if (!res.ok) return [];

    const data = await res.json();
    return (data.results || []).slice(0, 20).map((job: {
      id: number;
      name: string;
      company: { name: string; id: number };
      contents: string;
      locations: Array<{ name: string }>;
      refs: { landing_page: string };
      levels: Array<{ name: string; short_name: string }>;
      categories: Array<{ name: string }>;
      publication_date: string;
    }) => {
      const locationStr = (job.locations || []).map((l) => l.name).join(', ') || 'Not specified';
      const isRemote = locationStr.toLowerCase().includes('remote') || locationStr.toLowerCase().includes('flexible');
      const level = (job.levels || [])[0]?.short_name || '';
      let expLevel = 'mid';
      if (level === 'entry' || level === 'internship') expLevel = 'junior';
      else if (level === 'senior' || level === 'management') expLevel = 'senior';

      return {
        id: `muse-${job.id}`,
        title: job.name || 'Untitled',
        company: job.company?.name || 'Unknown',
        company_logo: null,
        description: (job.contents || '').replace(/<[^>]+>/g, '').slice(0, 500),
        location: locationStr,
        work_type: 'full-time',
        remote_policy: isRemote ? 'remote' : 'onsite',
        experience_level: expLevel,
        salary_min: null,
        salary_max: null,
        salary_currency: 'USD',
        skills: extractSkills(job.name + ' ' + job.contents),
        application_url: job.refs?.landing_page || '',
        is_active: true,
        created_at: job.publication_date || new Date().toISOString(),
        source: 'themuse',
      };
    });
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || 'software developer';
    const location = searchParams.get('location') || '';
    const remote = searchParams.get('remote_only') || 'false';

    const cacheKey = `${query}-${location}-${remote}`;

    // Check cache
    if (cache.data && cache.query === cacheKey && Date.now() - cache.timestamp < CACHE_TTL) {
      return NextResponse.json(cache.data);
    }

    // Fetch from ALL sources in parallel
    const [adzunaJobs, remoteOKJobs, arbeitnowJobs, jsearchJobs, findworkJobs, jobicyJobs, museJobs] = await Promise.all([
      fetchAdzuna(query, location),
      fetchRemoteOK(),
      fetchArbeitnow(),
      fetchJSearch(query, location, remote),
      fetchFindwork(query),
      fetchJobicy(query),
      fetchTheMuse(query),
    ]);

    // Combine and deduplicate (by title + company)
    const seen = new Set<string>();
    const allJobs: Array<Record<string, unknown>> = [];

    for (const job of [...adzunaJobs, ...jsearchJobs, ...remoteOKJobs, ...arbeitnowJobs, ...findworkJobs, ...jobicyJobs, ...museJobs]) {
      const key = `${(job.title as string).toLowerCase()}-${(job.company as string).toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        allJobs.push(job);
      }
    }

    const result = {
      jobs: allJobs,
      total: allJobs.length,
      sources: {
        adzuna: adzunaJobs.length,
        remoteok: remoteOKJobs.length,
        arbeitnow: arbeitnowJobs.length,
        jsearch: jsearchJobs.length,
        findwork: findworkJobs.length,
        jobicy: jobicyJobs.length,
        themuse: museJobs.length,
      },
    };

    // Cache
    cache.data = result;
    cache.timestamp = Date.now();
    cache.query = cacheKey;

    return NextResponse.json(result);
  } catch (error) {
    console.error('Fetch jobs error:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs', jobs: [], sources: {} });
  }
}
