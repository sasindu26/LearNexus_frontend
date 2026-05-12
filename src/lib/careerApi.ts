import api from './api';

export interface Job {
  id: string;
  title: string;
  company: string;
  image_url: string;
  skills_required: string[];
  experience_level: string;
  location: string;
  salary: string;
  tags: string[];
  job_type: string;
  description: string;
  source_url: string;
  source: string;
  matching_skills?: string[];
  missing_skills?: string[];
  match_score?: number;
}

export interface Certificate {
  id: string;
  title: string;
  provider: string;
  image_url: string;
  category: string;
  description: string;
  skills_taught: string[];
  skills_you_know?: string[];
  skills_to_learn?: string[];
  difficulty: string;
  duration: string;
  career_relevance: string;
  url: string;
  relevance_score?: number;
}

export interface JobRole {
  title: string;
  seniority: string;
  matched_skills: string[];
  matched_modules?: string[];
  confidence: number;
  reason: string;
}

export interface CareerPath {
  id: string;
  name: string;
  description: string;
  required_skills: string[];
}

export interface SkillGap {
  current_skills: string[];
  required_skills: string[];
  gap_skills: string[];
  coverage_pct: number;
}

export interface DashboardData {
  skill_count: number;
  current_skills: string[];
  skill_gap: {
    gap_count: number;
    coverage_pct: number;
    gap_skills: string[];
  };
  top_jobs: Job[];
  top_certificates: Certificate[];
  total_jobs_available: number;
  total_certs_available: number;
  eligible_roles: JobRole[];
  future_roles: JobRole[];
}

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

// ── Career Dashboard ─────────────────────────────────────────────────
export async function getCareerDashboard(token: string): Promise<DashboardData> {
  const res = await api.get('/api/career/dashboard', { headers: authHeader(token) });
  return res.data;
}

// ── Skill Profile ─────────────────────────────────────────────────────
export async function getSkillProfile(token: string) {
  const res = await api.get('/api/career/skill-profile', { headers: authHeader(token) });
  return res.data;
}

// ── Skill Gaps ────────────────────────────────────────────────────────
export async function getSkillGaps(token: string, career?: string): Promise<SkillGap> {
  const params = career ? `?career=${encodeURIComponent(career)}` : '';
  const res = await api.get(`/api/career/skill-gaps${params}`, { headers: authHeader(token) });
  return res.data;
}

// ── Career Paths ──────────────────────────────────────────────────────
export async function getCareerPaths(): Promise<CareerPath[]> {
  const res = await api.get('/api/career/career-paths');
  return res.data.career_paths || [];
}

// ── Job Role Inference ────────────────────────────────────────────────
export async function getEligibleRoles(token: string): Promise<JobRole[]> {
  const res = await api.get('/api/recommendations/jobs/eligible-roles', {
    headers: authHeader(token),
  });
  return res.data.roles || [];
}

export async function getFutureRoles(token: string): Promise<JobRole[]> {
  const res = await api.get('/api/recommendations/jobs/future-roles', {
    headers: authHeader(token),
  });
  return res.data.roles || [];
}

// ── Job Recommendations ───────────────────────────────────────────────
export async function getJobRecommendations(
  token: string,
  page = 1,
  limit = 10,
  seniority?: string,
  jobType?: string
) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (seniority) params.set('seniority', seniority);
  if (jobType) params.set('type', jobType);
  const res = await api.get(`/api/recommendations/jobs/?${params}`, { headers: authHeader(token) });
  return res.data;
}

export async function getTrendingJobs(page = 1, limit = 10, seniority?: string, jobType?: string) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (seniority) params.set('seniority', seniority);
  if (jobType) params.set('type', jobType);
  const res = await api.get(`/api/recommendations/jobs/trending?${params}`);
  return res.data;
}

export async function getJobDetail(token: string, jobId: string) {
  const res = await api.get(`/api/recommendations/jobs/detail/${jobId}`, {
    headers: authHeader(token),
  });
  return res.data;
}

export async function rateJob(token: string, jobId: string, relevant: boolean) {
  await api.post('/api/recommendations/jobs/feedback',
    { job_id: jobId, relevant },
    { headers: authHeader(token) }
  );
}

// ── Certificate Recommendations ───────────────────────────────────────
export async function getCertRecommendations(
  token: string,
  page = 1,
  limit = 10,
  difficulty?: string
) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (difficulty) params.set('difficulty', difficulty);
  const res = await api.get(`/api/recommendations/certificates/?${params}`, {
    headers: authHeader(token),
  });
  return res.data;
}

export async function getPostCompletionCerts(token: string, page = 1, limit = 10) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  const res = await api.get(`/api/recommendations/certificates/post-completion?${params}`, {
    headers: authHeader(token),
  });
  return res.data;
}

export async function getAllCertificates(page = 1, limit = 12, difficulty?: string, category?: string) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (difficulty) params.set('difficulty', difficulty);
  if (category) params.set('category', category);
  const res = await api.get(`/api/recommendations/certificates/all?${params}`);
  return res.data;
}

export async function getCertsBySkillGap(token: string, page = 1, limit = 10) {
  const res = await api.get(`/api/recommendations/certificates/by-skill-gap?page=${page}&limit=${limit}`, {
    headers: authHeader(token),
  });
  return res.data;
}

export async function getCertsByCareer(career: string, page = 1, limit = 10) {
  const res = await api.get(
    `/api/recommendations/certificates/by-career?career=${encodeURIComponent(career)}&page=${page}&limit=${limit}`
  );
  return res.data;
}

export async function rateCert(token: string, certId: string, relevant: boolean) {
  await api.post('/api/recommendations/certificates/feedback',
    { cert_id: certId, relevant },
    { headers: authHeader(token) }
  );
}

// ── Explanation ───────────────────────────────────────────────────────
export async function getExplanation(
  token: string,
  type: 'job' | 'certificate',
  id: string
): Promise<string> {
  const res = await api.get(`/api/career/explanation/${type}/${id}`, {
    headers: authHeader(token),
  });
  return res.data.explanation || '';
}
