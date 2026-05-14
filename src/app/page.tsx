"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlayCircle, Target, TrendingUp, BookOpen, MessageSquare, Activity, Calendar, Award, Briefcase, LogIn } from 'lucide-react';
import Link from 'next/link';
import { useSession } from '@/context/SessionContext';
import api from '@/lib/api';

interface TechArticle {
  id: string;
  title: string;
  tags?: string[];
  url?: string;
  source?: string;
}

const fadeUpVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: custom * 0.1, duration: 0.5, ease: "easeOut" as const }
  })
};

interface ProgressData {
  course_name: string;
  description: string;
  total_modules: number;
  total_topics: number;
  completed_topics: number;
  progress_pct: number;
}

export default function HomePage() {
  const { isLoggedIn, user, token, logout } = useSession();
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [techArticles, setTechArticles] = useState<TechArticle[]>([]);
  const [recommendedModules, setRecommendedModules] = useState<{ name: string; description: string; progress: number; topicCount: number }[]>([]);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!isLoggedIn || !token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/api/auth/progress', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.status === 'success' && res.data.courses.length > 0) {
          setProgress(res.data.courses[0]);
        }
      } catch (error: any) {
        if (error?.response?.status === 401) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, [isLoggedIn, token]);

  useEffect(() => {
    if (!progress?.course_name || !token) return;
    api.get(`/api/modules?course=${encodeURIComponent(progress.course_name)}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      if (Array.isArray(res.data)) {
        const incomplete = res.data
          .filter((m: { progress: number }) => m.progress < 100)
          .slice(0, 3);
        setRecommendedModules(incomplete);
      }
    }).catch(() => {});
  }, [progress, token]);

  useEffect(() => {
    const fetchTech = async () => {
      try {
        const res = await api.get('/api/world-trending?limit=5');
        setTechArticles(Array.isArray(res.data) ? res.data.slice(0, 5) : []);
      } catch {
        setTechArticles([]);
      }
    };
    fetchTech();
    const interval = setInterval(fetchTech, 60 * 60 * 1000); // re-fetch every hour
    return () => clearInterval(interval);
  }, []);

  const displayName = isLoggedIn ? user?.name : 'Student';
  const courseName = progress?.course_name || 'No course enrolled';
  const progressPct = progress?.progress_pct || 0;
  const completedTopics = progress?.completed_topics || 0;
  const totalTopics = progress?.total_topics || 0;
  const totalModules = progress?.total_modules || 0;

  return (
    <div className="min-h-screen pt-8 px-4 sm:px-8 xl:px-16 space-y-8">
      {/* Header Section */}
      <motion.div 
        custom={0} initial="hidden" animate="visible" variants={fadeUpVariant}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-gradient-to-br from-brand-primary to-[#283593] p-8 rounded-3xl shadow-xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="relative z-10">
          <p className="text-blue-200 font-medium tracking-wide mb-1">Welcome back,</p>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">{displayName}</h1>
        </div>
        
        <div className="flex gap-4 relative z-10">
          {isLoggedIn ? (
            <>
              <Link href="/dashboard" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md px-5 py-3 rounded-xl text-white font-bold transition-colors border border-white/10 shadow-lg">
                <TrendingUp size={18} /> Progress
              </Link>
              <Link href="/chat" className="flex items-center gap-2 bg-brand-accent hover:bg-brand-accent/90 px-5 py-3 rounded-xl text-white font-bold transition-all shadow-lg shadow-teal-500/30 hover:scale-105 active:scale-95">
                <MessageSquare size={18} /> Ask AI
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md px-5 py-3 rounded-xl text-white font-bold transition-colors border border-white/10 shadow-lg">
                <LogIn size={18} /> Sign In
              </Link>
              <Link href="/signup" className="flex items-center gap-2 bg-brand-accent hover:bg-brand-accent/90 px-5 py-3 rounded-xl text-white font-bold transition-all shadow-lg shadow-teal-500/30 hover:scale-105 active:scale-95">
                <MessageSquare size={18} /> Get Started
              </Link>
            </>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Progress Card (Hero) - Real Data */}
          <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUpVariant} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
              <Target size={120} />
            </div>
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div>
                <h3 className="font-bold text-brand-primary uppercase tracking-widest text-sm mb-2">
                  {progress ? 'Current Course' : 'Your Journey'}
                </h3>
                <h2 className="text-2xl font-black text-slate-800">{courseName}</h2>
              </div>
              <span className="text-4xl font-black text-brand-secondary">{progressPct}%</span>
            </div>
            
            <div className="relative z-10 mb-8">
              <div className="flex justify-between text-sm font-bold text-slate-400 mb-2">
                <span>{progress ? `${totalModules} modules • ${totalTopics} topics` : 'Modules'}</span>
                <span>{completedTopics}/{totalTopics}</span>
              </div>
              <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }} animate={{ width: `${progressPct}%` }} transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-brand-secondary to-[#68fadd] shadow-[0_0_10px_rgba(41,121,255,0.5)] rounded-full"
                />
              </div>
            </div>

            {progress ? (
              <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 w-full bg-slate-50 hover:bg-brand-secondary hover:text-white text-brand-primary font-bold py-4 rounded-xl transition-colors border border-slate-100">
                <PlayCircle size={20} /> Continue Learning
              </Link>
            ) : (
              <Link href="/chat" className="inline-flex items-center justify-center gap-2 w-full bg-slate-50 hover:bg-brand-primary hover:text-white text-brand-primary font-bold py-4 rounded-xl transition-colors border border-slate-100">
                <MessageSquare size={20} /> Find Your Degree with LearNexus AI
              </Link>
            )}
          </motion.div>

          {/* Quick Start Menu */}
          <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUpVariant} className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {[
               { icon: <BookOpen size={24} />, label: 'Dashboard', href: '/dashboard', color: 'text-blue-500', bg: 'bg-blue-50' },
               { icon: <Activity size={24} />, label: 'Tech Feed', href: '/tech-updates', color: 'text-teal-500', bg: 'bg-teal-50' },
               { icon: <Award size={24} />, label: 'Certificates', href: '/career/certificates', color: 'text-amber-500', bg: 'bg-amber-50' },
               { icon: <Briefcase size={24} />, label: 'Job Fields', href: '/career', color: 'text-purple-500', bg: 'bg-purple-50' },
             ].map((item, i) => (
               <Link key={i} href={item.href} className="flex flex-col items-center justify-center gap-3 p-6 bg-white rounded-2xl border border-slate-100 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all group">
                 <div className={`w-14 h-14 rounded-full ${item.bg} flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                   {item.icon}
                 </div>
                 <span className="font-bold text-slate-700 text-sm">{item.label}</span>
               </Link>
             ))}
          </motion.div>

          {/* Recommended Modules */}
          {isLoggedIn && (
            <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUpVariant} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-brand-primary">Recommended For You</h3>
                <Link href="/dashboard" className="text-brand-secondary font-bold hover:underline text-sm">View All</Link>
              </div>

              {recommendedModules.length === 0 ? (
                <div className="text-center py-6 text-slate-400">
                  <BookOpen size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="font-bold text-sm">
                    {progress ? 'All modules completed!' : 'Enroll in a course to see recommendations'}
                  </p>
                </div>
              ) : (
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
                  {recommendedModules.map((mod) => (
                    <Link key={mod.name} href={`/module/${encodeURIComponent(mod.name)}`}
                      className="min-w-[260px] p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-brand-secondary/30 transition-colors cursor-pointer group flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                          <BookOpen size={18} />
                        </div>
                        <span className="text-xs font-bold text-brand-secondary bg-brand-secondary/10 px-2 py-1 rounded-md">
                          {mod.progress > 0 ? `${mod.progress}% done` : 'Not started'}
                        </span>
                      </div>
                      <h4 className="font-black text-slate-800 text-sm mb-2 group-hover:text-brand-secondary transition-colors line-clamp-2">{mod.name}</h4>
                      {mod.description && (
                        <p className="text-slate-500 text-xs line-clamp-2 flex-1">{mod.description}</p>
                      )}
                      {mod.topicCount > 0 && (
                        <p className="text-xs font-bold text-slate-400 mt-3">{mod.topicCount} topics</p>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          )}

        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Upcoming Tasks */}
          <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUpVariant} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-slate-800 text-lg">Upcoming</h3>
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                <Calendar size={16} />
              </div>
            </div>
            
            <div className="space-y-4">
              {progress ? (
                <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-3 h-3 rounded-full mt-1.5 bg-blue-500" />
                  <div>
                    <h4 className="font-bold text-slate-700">Continue {progress.course_name}</h4>
                    <p className="text-xs text-slate-400 font-medium mt-1">{progress.total_topics - progress.completed_topics} topics remaining</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-slate-400 text-sm">Enroll in a course to see tasks</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Tech Recommendations Widget */}
          <motion.div custom={5} initial="hidden" animate="visible" variants={fadeUpVariant} className="bg-gradient-to-br from-[#111827] to-[#1F2937] p-8 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-secondary opacity-20 rounded-full blur-2xl"></div>
            <div className="flex justify-between items-center mb-6 relative z-10">
              <h3 className="font-black text-white text-lg flex items-center gap-2"><Activity size={18} className="text-brand-accent"/> Tech Radar</h3>
              <Link href="/tech-updates" className="text-xs font-bold text-brand-secondary hover:underline">View All →</Link>
            </div>

            <div className="space-y-3 relative z-10">
              {techArticles.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-4">Loading articles...</p>
              ) : techArticles.map(article => (
                <a
                  key={article.id}
                  href={article.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  {article.tags && article.tags.length > 0 && (
                    <span className="text-[10px] font-bold text-brand-secondary uppercase tracking-widest">
                      {article.tags[0]}
                    </span>
                  )}
                  <h4 className="font-bold text-white text-sm mt-1 line-clamp-2">{article.title}</h4>
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
