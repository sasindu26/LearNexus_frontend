"use client";

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { useSession } from '@/context/SessionContext';
import { getJobRecommendations, getTrendingJobs, type Job } from '@/lib/careerApi';
import JobCard from '@/components/career/JobCard';

const SENIORITY_TABS = [
  { value: '', label: 'All' },
  { value: 'intern', label: 'Intern' },
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid-Level' },
  { value: 'senior', label: 'Senior' },
];

const TYPE_OPTIONS = ['', 'remote', 'hybrid', 'onsite'];

export default function JobRecommendationsPage() {
  const { token, isLoggedIn } = useSession();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [seniority, setSeniority] = useState('');
  const [jobType, setJobType] = useState('');

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      let res;
      if (token) {
        res = await getJobRecommendations(token, page, 10, seniority || undefined, jobType || undefined);
      } else {
        res = await getTrendingJobs(page, 10, seniority || undefined, jobType || undefined);
      }
      setJobs(res.jobs || []);
      setTotal(res.total || 0);
      setPages(res.pages || 1);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [token, page, seniority, jobType]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="w-full px-4 sm:px-8 xl:px-16 2xl:px-24 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/30">
              <Briefcase size={20} className="text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-800">
              {isLoggedIn ? 'Your Job Matches' : 'Trending Jobs'}
            </h1>
          </div>
          <p className="text-slate-500 font-medium">
            {isLoggedIn
              ? 'Jobs matched to your skills from completed modules'
              : 'Sign in to get personalized job recommendations'}
          </p>
        </div>

        {/* Seniority tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {SENIORITY_TABS.map(tab => (
            <button
              key={tab.value || 'all'}
              onClick={() => { setSeniority(tab.value); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                seniority === tab.value
                  ? 'bg-brand-primary text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Type filter */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-6 flex flex-wrap gap-3 items-center">
          <SlidersHorizontal size={16} className="text-slate-400" />
          <span className="text-sm font-bold text-slate-600">Job Type:</span>
          <select
            value={jobType}
            onChange={e => { setJobType(e.target.value); setPage(1); }}
            className="text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-secondary/30"
          >
            <option value="">All Types</option>
            {TYPE_OPTIONS.filter(Boolean).map(o => (
              <option key={o} value={o} className="capitalize">{o.charAt(0).toUpperCase() + o.slice(1)}</option>
            ))}
          </select>
          {total > 0 && (
            <span className="ml-auto text-sm text-slate-400 font-medium">{total} jobs found</span>
          )}
        </div>

        {/* Job grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 h-48 animate-pulse" />
            ))}
          </div>
        ) : jobs.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {jobs.map(job => <JobCard key={job.id} job={job} />)}
          </motion.div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
            <Briefcase size={40} className="text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-bold text-lg">No jobs found</p>
            <p className="text-slate-300 text-sm mt-2">
              {isLoggedIn
                ? 'Complete more modules to build your skill profile and unlock matches.'
                : 'Sign in to get personalized recommendations.'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold text-sm hover:border-brand-secondary/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <span className="text-sm font-bold text-slate-600">{page} / {pages}</span>
            <button
              onClick={() => setPage(p => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold text-sm hover:border-brand-secondary/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
