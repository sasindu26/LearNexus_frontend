"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Book, CheckCircle, Clock, PieChart as PieChartIcon, Lightbulb, Library, TrendingUp, Calendar, Zap, RefreshCw, PlayCircle, Award, Loader2, AlertCircle, ExternalLink, Newspaper } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { useSession } from '@/context/SessionContext';

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

interface Module {
  id: string;
  name: string;
  description: string;
  level: number;
  topicCount: number;
  progress: number;
  isCompleted: boolean;
}

interface ProgressData {
  total_modules: number;
  total_topics: number;
  completed_topics: number;
  progress_pct: number;
}

export default function DashboardPage() {
  const { user, token } = useSession();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'overview' | 'insights' | 'modules'>(
    (searchParams.get('tab') as 'overview' | 'insights' | 'modules') || 'overview'
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const [enrolledCourses, setEnrolledCourses] = useState<{ name: string; description: string }[]>([]);
  const [selectedCourseName, setSelectedCourseName] = useState<string>('');
  const [modules, setModules] = useState<Module[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [courseNews, setCourseNews] = useState<{ id: string; title: string; description?: string; url?: string; tags?: string[] }[]>([]);
  const [isNewsLoading, setIsNewsLoading] = useState(false);
  const [learningPatterns, setLearningPatterns] = useState<{
    has_data: boolean;
    peak_study_time?: string;
    most_active_days?: string;
    avg_session_length?: string;
    total_completions?: number;
  } | null>(null);

  // Step 1: fetch enrolled courses + progress data
  useEffect(() => {
    if (!token) { setIsLoading(false); return; }
    Promise.all([
      api.get('/api/auth/profile', { headers: { Authorization: `Bearer ${token}` } }),
      api.get('/api/auth/progress', { headers: { Authorization: `Bearer ${token}` } }),
    ]).then(([profileRes, progressRes]) => {
      const courses: { name: string; description: string }[] = profileRes.data?.user?.enrolled_courses || [];
      setEnrolledCourses(courses);
      if (courses.length > 0) setSelectedCourseName(courses[0].name);
      else setIsLoading(false);

      if (progressRes.data?.status === 'success' && progressRes.data.courses?.length > 0) {
        const c = progressRes.data.courses[0];
        setProgressData({
          total_modules: c.total_modules,
          total_topics: c.total_topics,
          completed_topics: c.completed_topics,
          progress_pct: c.progress_pct,
        });
      }
    }).catch((err) => {
      console.error('[Dashboard] Failed to load profile/progress:', err?.response?.status, err?.config?.url);
      setIsLoading(false);
    });
  }, [token]);

  // Fetch real learning patterns from topic completion timestamps
  useEffect(() => {
    if (!token) return;
    api.get('/api/auth/learning-patterns', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setLearningPatterns(res.data))
      .catch(() => {});
  }, [token]);

  // Fetch course-related news whenever selected course changes
  useEffect(() => {
    if (!selectedCourseName) return;
    setIsNewsLoading(true);

    const name = selectedCourseName.toLowerCase();
    const tagMap: [string, string[]][] = [
      ['data science',         ['datascience', 'machinelearning', 'python', 'dataanalytics', 'deeplearning', 'sql', 'mlops', 'analytics']],
      ['artificial intelligence', ['ai', 'machinelearning', 'deeplearning', 'llm', 'agents', 'python']],
      ['machine learning',     ['machinelearning', 'deeplearning', 'python', 'datascience', 'mlops', 'pytorch']],
      ['software engineering', ['softwareengineering', 'architecture', 'devops', 'testing', 'coding', 'cleancode']],
      ['computer science',     ['computerscience', 'algorithms', 'programming', 'python', 'softwareengineering']],
      ['web',                  ['webdev', 'javascript', 'frontend', 'css', 'django']],
      ['network',              ['networking', 'distributedsystems', 'security']],
      ['database',             ['database', 'sql', 'dataanalytics']],
      ['security',             ['security', 'networking', 'distributedsystems']],
      ['cloud',                ['googlecloud', 'devops', 'distributedsystems', 'cloudrun']],
    ];

    const matched = tagMap.find(([key]) => name.includes(key));
    const tags = matched ? matched[1] : ['programming', 'computerscience', 'algorithms', 'python', 'ai'];

    api.get(`/api/tech-recommendations/by-tags?tags=${tags.join(',')}`)
      .then(res => {
        const data: any[] = Array.isArray(res.data) ? res.data : [];
        if (data.length > 0) {
          setCourseNews(data.slice(0, 6));
          return null;
        }
        return api.get('/api/tech-recommendations/trending?limit=6');
      })
      .then(fallback => {
        if (fallback) {
          const data: any[] = Array.isArray(fallback.data) ? fallback.data : [];
          setCourseNews(data.slice(0, 6));
        }
      })
      .catch(() => {})
      .finally(() => setIsNewsLoading(false));
  }, [selectedCourseName]);

  // Step 2: fetch modules whenever selected course changes
  useEffect(() => {
    if (!selectedCourseName || !token) return;
    setIsLoading(true);
    setError(null);
    api.get(`/api/modules?course=${encodeURIComponent(selectedCourseName)}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (Array.isArray(res.data)) {
          const mods: Module[] = res.data.map((m: any, i: number) => ({
            id: `mod-${i}`,
            name: m.name,
            description: m.description || '',
            level: m.level || 1,
            topicCount: m.topicCount || 0,
            progress: m.progress || 0,
            isCompleted: m.isCompleted || false,
          }));
          setModules(mods);
          const uniqueYears = [...new Set(mods.map(m => m.level))].sort() as number[];
          setYears(uniqueYears);
          if (uniqueYears.length > 0) setSelectedYear(uniqueYears[0]);
        }
      })
      .catch(() => setError('Failed to load modules'))
      .finally(() => setIsLoading(false));
  }, [selectedCourseName, token]);

  const filteredModules = modules.filter(m => m.level === selectedYear || !m.level);

  const completionChartData = progressData ? [
    { name: 'Completed', value: progressData.completed_topics, color: '#00BFA5' },
    { name: 'Remaining', value: Math.max(0, progressData.total_topics - progressData.completed_topics), color: '#E2E8F0' },
  ] : [{ name: 'No data', value: 1, color: '#E2E8F0' }];

  const modulesByYearData = years.map(year => ({
    name: `Year ${year}`,
    modules: modules.filter((m: Module) => m.level === year).length,
  }));

  const modulesTopicData = modules.slice(0, 8).map((m: Module) => ({
    name: m.name.length > 15 ? m.name.substring(0, 13) + '..' : m.name,
    topics: m.topicCount,
  }));

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };


  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/80 backdrop-blur-xl border border-slate-100 p-6 rounded-3xl shadow-lg flex items-center gap-6 hover:-translate-y-1 transition-transform">
                <div className="w-16 h-16 rounded-2xl bg-brand-secondary/10 flex items-center justify-center text-brand-secondary">
                  <Book size={28} />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-800">{progressData?.total_modules ?? '—'}</h3>
                  <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Total Modules</p>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-xl border border-slate-100 p-6 rounded-3xl shadow-lg flex items-center gap-6 hover:-translate-y-1 transition-transform">
                <div className="w-16 h-16 rounded-2xl bg-brand-accent/10 flex items-center justify-center text-brand-accent">
                  <CheckCircle size={28} />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-800">{progressData?.completed_topics ?? '—'}</h3>
                  <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Topics Done</p>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-xl border border-slate-100 p-6 rounded-3xl shadow-lg flex items-center gap-6 hover:-translate-y-1 transition-transform">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
                  <Book size={28} />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-800">{progressData?.total_topics ?? '—'}</h3>
                  <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Total Topics</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><Award size={120} /></div>
                <h3 className="font-bold text-slate-800 uppercase tracking-widest mb-6">Overall Progress</h3>
                <div className="space-y-4 relative z-10">
                  <div className="flex justify-between items-end">
                    <span className="text-5xl font-black text-brand-secondary">{progressData?.progress_pct ?? 0}%</span>
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-2">Learning Journey</span>
                  </div>
                  <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${progressData?.progress_pct ?? 0}%` }} transition={{ duration: 1, delay: 0.2 }} className="h-full bg-gradient-to-r from-brand-secondary to-brand-accent shadow-lg" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg">
                <h3 className="font-bold text-slate-800 uppercase tracking-widest mb-6">Topic Progress</h3>
                <div className="h-48 relative">
                  {mounted && (
                  <ResponsiveContainer width="100%" height="100%" debounce={50}>
                    <PieChart>
                      <Pie data={completionChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {completionChartData.map((entry: { name: string; value: number; color: string }, index: number) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <RechartsTooltip formatter={(value, name) => [`${value} topics`, name]} />
                    </PieChart>
                  </ResponsiveContainer>
                  )}
                  {/* Center label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-black text-slate-800">{progressData?.progress_pct ?? 0}%</span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Complete</span>
                  </div>
                </div>
                {/* Legend */}
                <div className="flex items-center justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#00BFA5]" />
                    <span className="text-xs font-bold text-slate-500">Done ({progressData?.completed_topics ?? 0})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-200" />
                    <span className="text-xs font-bold text-slate-500">
                      Remaining ({progressData ? progressData.total_topics - progressData.completed_topics : 0})
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg lg:col-span-2">
                <h3 className="font-bold text-slate-800 uppercase tracking-widest mb-6">Modules by Year</h3>
                <div className="h-64">
                  {mounted && (
                  <ResponsiveContainer width="100%" height="100%" debounce={50}>
                    <BarChart data={modulesByYearData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
                      <RechartsTooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="modules" fill="#2979FF" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            {/* Career Insights CTA */}
            <Link
              href="/career"
              className="flex items-center gap-6 bg-gradient-to-r from-brand-secondary/90 to-brand-primary p-6 rounded-3xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all group"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <TrendingUp size={26} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-black text-white">Career Intelligence</h3>
                <p className="text-white/80 text-sm font-medium mt-0.5">
                  See personalized job matches and certificate recommendations based on your progress
                </p>
              </div>
              <div className="shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <TrendingUp size={18} className="text-white" />
              </div>
            </Link>
          </motion.div>
        );
      case 'insights':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg">
              <h3 className="font-bold text-slate-800 uppercase tracking-widest mb-6">Topics per Module</h3>
              <div className="h-64">
                {mounted && (
                <ResponsiveContainer width="100%" height="100%" debounce={50}>
                  <BarChart data={modulesTopicData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
                    <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="topics" fill="#2979FF" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Learning Patterns */}
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-800 uppercase tracking-widest">Learning Patterns</h3>
                  {learningPatterns?.total_completions != null && (
                    <span className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full">
                      {learningPatterns.total_completions} topics completed
                    </span>
                  )}
                </div>
                {!learningPatterns?.has_data ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400">
                    <Zap size={32} className="mb-3 opacity-20" />
                    <p className="font-bold">No patterns yet</p>
                    <p className="text-xs mt-1">Complete topics to see your study patterns here.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500"><Clock size={20} /></div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Peak Study Time</p>
                        <p className="font-bold text-slate-800">{learningPatterns.peak_study_time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500"><Calendar size={20} /></div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Most Active Days</p>
                        <p className="font-bold text-slate-800">{learningPatterns.most_active_days}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500"><Zap size={20} /></div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Session Length</p>
                        <p className="font-bold text-slate-800">{learningPatterns.avg_session_length}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Completion Rate */}
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg">
                <h3 className="font-bold text-slate-800 uppercase tracking-widest mb-6">Completion Rate</h3>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-500"><TrendingUp size={20} /></div>
                    <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Topic Completion Rate</p><p className="font-bold text-slate-800">{progressData && progressData.total_topics > 0 ? `${Math.round((progressData.completed_topics / progressData.total_topics) * 100)}%` : '0%'}</p></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Areas for Improvement */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg">
              <h3 className="font-bold text-slate-800 uppercase tracking-widest mb-6">Areas for Improvement</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {modules.filter((m: Module) => !m.isCompleted).sort((a: Module, b: Module) => a.progress - b.progress).slice(0, 3).map((module: Module, i: number) => (
                  <Link key={module.id} href={`/module/${encodeURIComponent(module.name)}`} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-brand-secondary/30 hover:shadow-md hover:-translate-y-0.5 transition-all group">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${i === 0 ? 'bg-red-50 text-red-500' : i === 1 ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-500'}`}>
                      <Book size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 truncate group-hover:text-brand-secondary transition-colors">{module.name}</p>
                      <p className="text-xs text-slate-400 font-bold">{module.progress}% complete</p>
                    </div>
                  </Link>
                ))}
                {modules.filter((m: Module) => !m.isCompleted).length === 0 && (
                  <p className="text-slate-400 text-sm col-span-3 text-center py-4">No improvement areas identified yet</p>
                )}
              </div>
            </div>
          </motion.div>
        );
      case 'modules':
        return (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">

            {/* Modules list (3/4 width) — LEFT */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="xl:col-span-3 order-1 space-y-6"
            >
              {/* Course Selector — shown only when enrolled in multiple degrees */}
              {enrolledCourses.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                  {enrolledCourses.map(c => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedCourseName(c.name)}
                      className={`px-5 py-2 rounded-xl font-bold text-sm transition-all border-2 ${
                        selectedCourseName === c.name
                          ? 'bg-brand-primary border-brand-primary text-white'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-brand-primary/40'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Year Tabs */}
              {years.length > 0 && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {years.map(year => (
                    <button
                      key={year}
                      onClick={() => setSelectedYear(year)}
                      className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap shadow-sm ${
                        selectedYear === year
                          ? 'bg-brand-secondary text-white shadow-brand-secondary/30'
                          : 'bg-white text-slate-600 border border-slate-100 hover:border-brand-secondary/30 hover:bg-slate-50'
                      }`}
                    >
                      Year {year}
                      <span className={`ml-2 px-2 py-0.5 rounded-lg text-xs ${
                        selectedYear === year ? 'bg-white/20' : 'bg-slate-100'
                      }`}>
                        {modules.filter((m: Module) => m.level === year).length}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {isLoading ? (
                <div className="bg-white p-16 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center">
                  <Loader2 size={32} className="text-brand-secondary animate-spin mb-4" />
                  <p className="text-slate-500 font-medium">Loading your modules...</p>
                </div>
              ) : error ? (
                <div className="bg-white p-16 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center">
                  <AlertCircle size={32} className="text-red-400 mb-4" />
                  <p className="text-slate-500 font-medium">{error}</p>
                </div>
              ) : enrolledCourses.length === 0 ? (
                <div className="bg-white p-16 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
                  <Book size={32} className="text-slate-300 mb-4" />
                  <p className="text-slate-700 font-bold mb-2">Not enrolled in any degree yet.</p>
                  <p className="text-slate-400 text-sm mb-6">Chat with Mento AI to get course recommendations and start learning.</p>
                  <Link href="/chat" className="inline-flex items-center gap-2 bg-brand-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-secondary transition-colors">
                    Chat with Mento AI
                  </Link>
                </div>
              ) : filteredModules.length === 0 ? (
                <div className="bg-white p-16 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center">
                  <Book size={32} className="text-slate-300 mb-4" />
                  <p className="text-slate-500 font-medium">No modules found for Year {selectedYear}.</p>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`year-${selectedYear}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    {filteredModules.map((module, index) => (
                      <Link key={module.id} href={`/module/${encodeURIComponent(module.name)}`}>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-md group hover:border-brand-secondary/30 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-start gap-4 flex-1 min-w-0">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${module.isCompleted ? 'bg-green-50 text-green-500' : 'bg-brand-primary/10 text-brand-primary'}`}>
                                {module.isCompleted ? <CheckCircle size={20} /> : <Book size={20} />}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex justify-between items-center mb-1">
                                  <h3 className="text-base font-black text-slate-800 group-hover:text-brand-secondary transition-colors truncate">{module.name}</h3>
                                  <span className="text-sm font-black text-brand-secondary ml-2 shrink-0">{module.progress}%</span>
                                </div>
                                {module.description && (
                                  <p className="text-slate-500 text-xs line-clamp-1 mb-2">{module.description}</p>
                                )}
                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
                                  <div className={`h-full ${module.isCompleted ? 'bg-brand-accent' : 'bg-brand-secondary'}`} style={{ width: `${module.progress}%` }} />
                                </div>
                                <div className="flex items-center gap-4">
                                  {module.topicCount > 0 && (
                                    <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1"><Book size={11} /> {module.topicCount} Topics</span>
                                  )}
                                  <span className="text-xs font-bold text-slate-400 uppercase">Year {module.level}</span>
                                </div>
                              </div>
                            </div>
                            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm shrink-0 border-2 ${
                              module.isCompleted
                                ? 'bg-green-50 border-green-200 text-green-600'
                                : module.progress > 0
                                  ? 'bg-brand-secondary border-brand-secondary text-white'
                                  : 'border-slate-200 text-slate-500 group-hover:border-brand-secondary group-hover:text-brand-secondary'
                            }`}>
                              {module.isCompleted ? <CheckCircle size={15} /> : <PlayCircle size={15} />}
                              <span>{module.isCompleted ? 'Completed' : module.progress > 0 ? 'Continue' : 'Start'}</span>
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    ))}
                  </motion.div>
                </AnimatePresence>
              )}
            </motion.div>

            {/* Right sidebar — Course News */}
            <div className="xl:col-span-1 order-2 space-y-4">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                  <Newspaper size={16} className="text-brand-secondary" />
                  <h3 className="font-black text-slate-800 text-sm">Course News</h3>
                </div>

                {isNewsLoading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 size={24} className="animate-spin text-brand-secondary" />
                  </div>
                ) : courseNews.length === 0 ? (
                  <div className="px-5 py-8 text-center text-slate-400 text-sm">No articles found.</div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {courseNews.map((article, i) => (
                      <a
                        key={article.id || i}
                        href={article.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex gap-3.5 px-5 py-4 hover:bg-gradient-to-r hover:from-slate-50 hover:to-white transition-all group"
                      >
                        {/* Thumbnail */}
                        {article.image && (
                          <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-100 shadow-sm group-hover:shadow-md transition-shadow">
                            <img
                              src={article.image}
                              alt=""
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={e => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }}
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          {article.tags && article.tags.length > 0 && (
                            <span className="inline-block text-[9px] font-extrabold uppercase tracking-widest text-white bg-gradient-to-r from-brand-secondary to-brand-primary px-2 py-0.5 rounded-full mb-1.5">
                              {article.tags[0]}
                            </span>
                          )}
                          <p className="text-[13px] font-bold text-slate-700 group-hover:text-brand-secondary transition-colors leading-snug line-clamp-2">
                            {article.title}
                          </p>
                          {article.description && (
                            <p className="text-[11px] text-slate-400 line-clamp-1 leading-relaxed mt-1">
                              {stripHtml(article.description)}
                            </p>
                          )}
                          <span className="flex items-center gap-1 text-[10px] font-bold text-brand-secondary/70 group-hover:text-brand-secondary mt-1.5 transition-colors">
                            Read article <ExternalLink size={9} />
                          </span>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>


          </div>
        );
    }
  };

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-br from-brand-primary to-[#283593] pt-16 pb-32 px-4 sm:px-8 xl:px-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="w-full relative z-10 flex justify-between items-end">
          <div>
            <span className="text-blue-300 font-bold uppercase tracking-widest text-sm mb-2 block">Your Learning</span>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              {selectedCourseName || 'Analytics Dashboard'}
            </h1>
            {selectedCourseName && (
              <span className="text-blue-200 text-base font-semibold mt-1 block">Analytics Dashboard</span>
            )}
          </div>
          <button onClick={handleRefresh} className={`p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 ${isRefreshing ? 'animate-spin' : ''}`}>
            <RefreshCw size={24} className="text-white" />
          </button>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-16 -mt-16 relative z-20">
        <div className="flex overflow-x-auto no-scrollbar gap-2 p-2 bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-100 shadow-lg w-max mb-10 max-w-full">
          <button onClick={() => setActiveTab('overview')} className={`flex shrink-0 items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'overview' ? 'bg-brand-primary text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>
            <PieChartIcon size={18} /> Overview
          </button>
          <button onClick={() => setActiveTab('insights')} className={`flex shrink-0 items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'insights' ? 'bg-brand-primary text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>
            <Lightbulb size={18} /> Insights
          </button>
          <button onClick={() => setActiveTab('modules')} className={`flex shrink-0 items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'modules' ? 'bg-brand-primary text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>
            <Library size={18} /> Degree Modules
          </button>
        </div>

        <AnimatePresence mode="wait">
          {renderTabContent()}
        </AnimatePresence>
      </div>
    </div>
  );
}
