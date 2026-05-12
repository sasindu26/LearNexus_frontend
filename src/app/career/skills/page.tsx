"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Target, CheckCircle2, AlertCircle, BookOpen } from 'lucide-react';
import { useSession } from '@/context/SessionContext';
import { getSkillGaps, getSkillProfile, getCareerPaths, type SkillGap, type CareerPath } from '@/lib/careerApi';
import SkillBadge from '@/components/career/SkillBadge';
import Link from 'next/link';

export default function SkillGapPage() {
  const { token, isLoggedIn } = useSession();
  const [gaps, setGaps] = useState<SkillGap | null>(null);
  const [profile, setProfile] = useState<{ skills: string[]; by_category: Record<string, string[]> } | null>(null);
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [selectedPath, setSelectedPath] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }

    Promise.all([
      getSkillProfile(token),
      getSkillGaps(token),
      getCareerPaths(),
    ]).then(([p, g, paths]) => {
      setProfile(p);
      setGaps(g);
      setCareerPaths(paths);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [token]);

  const handleCareerChange = async (career: string) => {
    setSelectedPath(career);
    if (!token) return;
    try {
      const g = await getSkillGaps(token, career || undefined);
      setGaps(g);
    } catch {}
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <Target size={48} className="text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-slate-700 mb-2">Skill Gap Analysis</h2>
          <p className="text-slate-500 mb-6">Sign in to see your skill profile and gaps.</p>
          <Link href="/login" className="bg-brand-primary text-white font-bold px-6 py-3 rounded-xl">Sign In</Link>
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

  const coveragePct = gaps?.coverage_pct ?? 0;

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="w-full px-4 sm:px-8 xl:px-16 2xl:px-24 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Target size={20} className="text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-800">Skill Gap Analysis</h1>
          </div>
          <p className="text-slate-500 font-medium">
            Compare your current skills to what your career path requires
          </p>
        </div>

        {/* Career path selector */}
        {careerPaths.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6">
            <label className="block text-sm font-black text-slate-600 mb-2">Target Career Path</label>
            <select
              value={selectedPath}
              onChange={e => handleCareerChange(e.target.value)}
              className="w-full sm:w-72 text-sm font-semibold text-slate-700 border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-secondary/30 focus:border-brand-secondary"
            >
              <option value="">Your enrolled course (default)</option>
              {careerPaths.map(cp => (
                <option key={cp.id} value={cp.name}>{cp.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Coverage bar */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
          <div className="flex justify-between items-end mb-3">
            <div>
              <h2 className="font-black text-slate-700 text-lg">Skill Coverage</h2>
              <p className="text-slate-400 text-sm">How much of the required skills you already know</p>
            </div>
            <span className="text-3xl font-black text-brand-secondary">{coveragePct}%</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${coveragePct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-brand-secondary rounded-full"
            />
          </div>
          <div className="flex justify-between text-xs font-bold text-slate-400 mt-1.5">
            <span>{gaps?.current_skills?.length ?? 0} skills you have</span>
            <span>{gaps?.required_skills?.length ?? 0} total required</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Current skills */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 size={18} className="text-green-500" />
              <h2 className="font-black text-slate-700">Skills You Have</h2>
              <span className="ml-auto text-sm font-bold text-slate-400">
                {gaps?.current_skills?.length ?? 0}
              </span>
            </div>
            {gaps?.current_skills?.length ? (
              <div className="flex flex-wrap gap-1.5 max-h-64 overflow-y-auto">
                {gaps.current_skills.map(s => (
                  <SkillBadge key={s} skill={s} variant="match" />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen size={28} className="text-slate-200 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">Complete topics to build your skill profile</p>
              </div>
            )}
          </div>

          {/* Gap skills */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle size={18} className="text-orange-400" />
              <h2 className="font-black text-slate-700">Skills to Develop</h2>
              <span className="ml-auto text-sm font-bold text-slate-400">
                {gaps?.gap_skills?.length ?? 0}
              </span>
            </div>
            {gaps?.gap_skills?.length ? (
              <div className="flex flex-wrap gap-1.5 max-h-64 overflow-y-auto">
                {gaps.gap_skills.map(s => (
                  <SkillBadge key={s} skill={s} variant="missing" />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle2 size={28} className="text-green-200 mx-auto mb-2" />
                <p className="text-slate-400 text-sm font-bold">No gaps detected!</p>
                <p className="text-slate-300 text-xs mt-1">You have all required skills for this path</p>
              </div>
            )}
          </div>
        </div>

        {/* Skills by category */}
        {profile?.by_category && Object.keys(profile.by_category).length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mt-6">
            <h2 className="font-black text-slate-700 mb-4">Skills by Category</h2>
            <div className="space-y-4">
              {Object.entries(profile.by_category).map(([cat, skills]) => (
                <div key={cat}>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2 capitalize">
                    {cat}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {(skills as string[]).map(s => <SkillBadge key={s} skill={s} variant="match" />)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action links */}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/career/certificates"
            className="flex items-center gap-2 bg-brand-secondary text-white font-bold px-5 py-2.5 rounded-xl hover:bg-brand-secondary/90 transition-colors shadow-md"
          >
            Find Certificates to Fill Gaps
          </Link>
          <Link
            href="/career/jobs"
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-xl hover:border-brand-secondary/50 transition-colors"
          >
            View Matching Jobs
          </Link>
        </div>
      </div>
    </div>
  );
}
