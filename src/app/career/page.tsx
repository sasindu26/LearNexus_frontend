"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Briefcase, Award, TrendingUp, Zap, ArrowRight, BookOpen, Target, Sparkles
} from 'lucide-react';
import { useSession } from '@/context/SessionContext';
import { getCareerDashboard, type DashboardData } from '@/lib/careerApi';
import JobCard from '@/components/career/JobCard';
import CertificateCard from '@/components/career/CertificateCard';
import SkillBadge from '@/components/career/SkillBadge';

export default function CareerDashboardPage() {
  const { token, isLoggedIn } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    getCareerDashboard(token)
      .then(d => setData(d))
      .catch(() => setError('Failed to load career data. Make sure the backend is running.'))
      .finally(() => setLoading(false));
  }, [token]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <Briefcase size={48} className="text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-slate-700 mb-2">Career Intelligence</h2>
          <p className="text-slate-500 mb-6">Sign in to see personalized job and certificate recommendations.</p>
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-red-500 font-bold mb-2">{error}</p>
          <p className="text-slate-400 text-sm">Run the skill backfill script and restart the backend to populate data.</p>
        </div>
      </div>
    );
  }

  const skillGap = data?.skill_gap;
  const noData = !data?.skill_count;

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="w-full px-4 sm:px-8 xl:px-16 2xl:px-24 py-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-brand-secondary rounded-xl flex items-center justify-center shadow-lg shadow-brand-secondary/30">
              <TrendingUp size={20} className="text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Career Intelligence</h1>
          </div>
          <p className="text-slate-500 font-medium ml-13">
            Personalized job and certificate recommendations based on your learning progress
          </p>
        </motion.div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Skills Inferred', value: data?.skill_count ?? 0, icon: <Zap size={18} />, color: 'text-brand-secondary' },
            { label: 'Skill Gap', value: `${skillGap?.coverage_pct ?? 0}%`, sub: 'covered', icon: <Target size={18} />, color: 'text-blue-500' },
            { label: 'Jobs Available', value: data?.total_jobs_available ?? 0, icon: <Briefcase size={18} />, color: 'text-brand-primary' },
            { label: 'Certificates', value: data?.total_certs_available ?? 0, icon: <Award size={18} />, color: 'text-purple-500' },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5"
            >
              <div className={`mb-2 ${stat.color}`}>{stat.icon}</div>
              <p className="text-2xl font-black text-slate-800">{stat.value}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {noData && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8 flex gap-4 items-start">
            <BookOpen size={20} className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-700">Complete some modules to unlock recommendations</p>
              <p className="text-amber-600 text-sm mt-1">
                Finish topics in your enrolled course — we'll infer your skills and match you with relevant jobs and certifications.
              </p>
              <Link href="/dashboard" className="mt-3 inline-block text-sm font-bold text-amber-700 hover:underline">
                Go to Dashboard →
              </Link>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: skills + gap + quick links */}
          <div className="space-y-6">
            {/* Current skills */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-black text-slate-700">Your Skills</h2>
                <Link href="/career/skills" className="text-xs font-bold text-brand-secondary hover:underline flex items-center gap-1">
                  View all <ArrowRight size={12} />
                </Link>
              </div>
              {data?.current_skills?.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {data.current_skills.slice(0, 15).map(s => (
                    <SkillBadge key={s} skill={s} variant="match" />
                  ))}
                  {(data.skill_count > 15) && (
                    <span className="text-xs text-slate-400 font-medium self-center">
                      +{data.skill_count - 15} more
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-slate-400 text-sm">No skills inferred yet — complete topics to build your profile.</p>
              )}
            </div>

            {/* Skill gap */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-black text-slate-700">Skill Gaps</h2>
                <Link href="/career/skills" className="text-xs font-bold text-brand-secondary hover:underline flex items-center gap-1">
                  Analyze <ArrowRight size={12} />
                </Link>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                  <span>Course coverage</span>
                  <span>{skillGap?.coverage_pct ?? 0}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-secondary rounded-full transition-all duration-700"
                    style={{ width: `${skillGap?.coverage_pct ?? 0}%` }}
                  />
                </div>
              </div>
              {skillGap?.gap_skills?.length ? (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {skillGap.gap_skills.slice(0, 8).map(s => (
                    <SkillBadge key={s} skill={s} variant="missing" />
                  ))}
                </div>
              ) : null}
            </div>

            {/* Quick links */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-3">
              <h2 className="font-black text-slate-700 mb-2">Explore</h2>
              {[
                { href: '/career/course-jobs', label: 'Course Related Jobs', icon: <Sparkles size={15} /> },
                { href: '/career/jobs', label: 'Job Recommendations', icon: <Briefcase size={15} /> },
                { href: '/career/certificates', label: 'Certificate Pathways', icon: <Award size={15} /> },
                { href: '/career/skills', label: 'Skill Gap Analysis', icon: <Target size={15} /> },
              ].map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 hover:bg-brand-secondary/5 hover:border-brand-secondary/20 border border-transparent transition-colors group"
                >
                  <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
                    <span className="text-brand-secondary">{link.icon}</span>
                    {link.label}
                  </div>
                  <ArrowRight size={14} className="text-slate-300 group-hover:text-brand-secondary transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          {/* Right: top jobs + certs */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black text-slate-800">Top Job Matches</h2>
                <Link href="/career/jobs" className="text-sm font-bold text-brand-secondary hover:underline flex items-center gap-1">
                  See all <ArrowRight size={14} />
                </Link>
              </div>
              {data?.top_jobs?.length ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {data.top_jobs.map(job => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
                  <Briefcase size={32} className="text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-400 font-bold">No job matches yet</p>
                  <p className="text-slate-300 text-sm mt-1">Complete more topics to unlock matches</p>
                </div>
              )}
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black text-slate-800">Recommended Certificates</h2>
                <Link href="/career/certificates" className="text-sm font-bold text-brand-secondary hover:underline flex items-center gap-1">
                  See all <ArrowRight size={14} />
                </Link>
              </div>
              {data?.top_certificates?.length ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {data.top_certificates.map(cert => (
                    <CertificateCard key={cert.id} cert={cert} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
                  <Award size={32} className="text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-400 font-bold">No certificate matches yet</p>
                  <p className="text-slate-300 text-sm mt-1">We'll suggest certificates as you progress</p>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
