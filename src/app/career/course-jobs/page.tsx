"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Sparkles, ArrowRight, Briefcase, ChevronLeft } from 'lucide-react';
import { useSession } from '@/context/SessionContext';
import { getEligibleRoles, getFutureRoles, type JobRole } from '@/lib/careerApi';
import RoleCard from '@/components/career/RoleCard';

export default function CourseJobsPage() {
  const { token, isLoggedIn } = useSession();
  const [eligibleRoles, setEligibleRoles] = useState<JobRole[]>([]);
  const [futureRoles, setFutureRoles] = useState<JobRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }

    Promise.all([
      getEligibleRoles(token),
      getFutureRoles(token),
    ])
      .then(([eligible, future]) => {
        setEligibleRoles(eligible);

        // Client-side dedup safety net: remove future roles whose title is in eligible
        const eligibleTitles = new Set(eligible.map(r => r.title.toLowerCase()));
        setFutureRoles(future.filter(r => !eligibleTitles.has(r.title.toLowerCase())));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <Briefcase size={48} className="text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-slate-700 mb-2">Course Related Jobs</h2>
          <p className="text-slate-500 mb-6">Sign in to see job roles based on your course progress.</p>
          <Link href="/login" className="bg-brand-primary text-white font-bold px-6 py-3 rounded-xl">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin" />
      </div>
    );
  }

  const noRoles = eligibleRoles.length === 0 && futureRoles.length === 0;

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10">
        {/* Back link */}
        <Link
          href="/career"
          className="inline-flex items-center gap-1 text-sm font-bold text-slate-400 hover:text-brand-secondary mb-6 transition-colors"
        >
          <ChevronLeft size={16} /> Back to Career Dashboard
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-secondary to-brand-accent rounded-xl flex items-center justify-center shadow-lg shadow-brand-secondary/30">
              <Sparkles size={20} className="text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Course Related Jobs</h1>
          </div>
          <p className="text-slate-500 font-medium ml-13">
            Job roles derived from your course modules and skills — not scraped postings
          </p>
        </motion.div>

        {noRoles ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
            <Briefcase size={40} className="text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-bold text-lg">No role suggestions yet</p>
            <p className="text-slate-300 text-sm mt-2">
              Complete topics in your enrolled course to unlock job role recommendations.
            </p>
            <Link
              href="/dashboard"
              className="mt-6 inline-flex items-center gap-2 bg-brand-secondary text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-primary transition-colors"
            >
              Go to Dashboard <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-10">
            {/* Eligible Right Now */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-800">Eligible Right Now</h2>
                  <p className="text-sm text-slate-400 mt-0.5">Based on skills you&apos;ve already learned</p>
                </div>
                <Link href="/career/jobs" className="text-xs font-bold text-brand-secondary hover:underline flex items-center gap-1">
                  See jobs <ArrowRight size={12} />
                </Link>
              </div>

              {eligibleRoles.length > 0 ? (
                <div className="space-y-3">
                  {eligibleRoles.map((role, i) => (
                    <RoleCard key={`eligible-${role.title}-${i}`} role={role} variant="eligible" />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
                  <p className="text-slate-400 text-sm font-medium">Complete more topics to unlock role suggestions</p>
                </div>
              )}
            </motion.div>

            {/* After Course Completion */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-800">After Course Completion</h2>
                  <p className="text-sm text-slate-400 mt-0.5">Roles you&apos;ll qualify for once finished</p>
                </div>
                <Link href="/career/jobs" className="text-xs font-bold text-purple-500 hover:underline flex items-center gap-1">
                  See jobs <ArrowRight size={12} />
                </Link>
              </div>

              {futureRoles.length > 0 ? (
                <div className="space-y-3">
                  {futureRoles.map((role, i) => (
                    <RoleCard key={`future-${role.title}-${i}`} role={role} variant="future" />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
                  <p className="text-slate-400 text-sm font-medium">Enroll in a course to see future role projections</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
