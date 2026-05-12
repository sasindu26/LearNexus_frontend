"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, Target, Sparkles, ArrowRight, PlayCircle, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from '@/context/SessionContext';

export default function RecommendationsPage() {
  const router = useRouter();
  const { cachedCourses } = useSession();
  const [expandedCardIndex, setExpandedCardIndex] = useState<number | null>(null);

  const displayCourses = cachedCourses && cachedCourses.length > 0 ? cachedCourses : [
    { name: 'Cloud Architecture & DevOps', description: 'Master AWS, Docker, and CI/CD pipelines to build scalable cloud infrastructure.', modules: [] },
    { name: 'Machine Learning Engineering', description: 'Deep dive into neural networks, PyTorch, and deploying AI models to production.', modules: [] },
    { name: 'Full-Stack Next.js Development', description: 'Build enterprise-grade web applications with Next.js, React, and Tailwind CSS.', modules: [] },
  ];

  const handleCoursePress = async (_course: any) => {
    try {
      router.push(`/dashboard`);
    } catch (error) {
      console.error('Error in handleCoursePress:', error);
    }
  };

  const toggleDescription = (index: number) => {
    setExpandedCardIndex(expandedCardIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-brand-primary via-brand-secondary to-brand-accent pt-24 pb-32 px-4 sm:px-8 xl:px-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
        <div className="w-full relative z-10 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center mb-6 shadow-2xl border border-white/20">
            <Sparkles size={36} className="text-white" />
          </div>
          <h1 className="text-5xl lg:text-6xl font-black text-white tracking-tight mb-4">Recommended Courses</h1>
          <p className="text-blue-100 text-sm font-bold uppercase tracking-widest mb-2">Personalized for you</p>
          <p className="text-blue-100 text-lg max-w-2xl font-medium">
            Today&apos;s Recommendations — Based on your chat interactions and current skill profile.
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="w-full px-4 sm:px-8 xl:px-16 -mt-16 relative z-20">
        {displayCourses.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-16 text-center">
            <Book size={48} className="text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-black text-slate-800 mb-2">No Recommendations Yet</h3>
            <p className="text-slate-500 mb-6">Start chatting with Mento AI to get personalized course recommendations.</p>
            <Link href="/chat" className="inline-flex items-center gap-2 bg-brand-primary text-white px-8 py-4 rounded-2xl font-bold hover:bg-brand-secondary transition-colors">
              Chat with Mento AI <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {displayCourses.map((course, index) => {
                const isExpanded = expandedCardIndex === index;
                const description = isExpanded
                  ? course.description
                  : (course.description.length > 100 ? course.description.substring(0, 97) + '...' : course.description);

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden group flex flex-col hover:-translate-y-2 transition-transform duration-300"
                  >
                    <div className="p-8 pb-6 relative overflow-hidden flex-1">
                      <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-700 ease-out z-0"></div>
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                          <div className="w-12 h-12 rounded-2xl bg-brand-primary flex items-center justify-center text-white shadow-lg shadow-brand-primary/20">
                            <Book size={20} />
                          </div>
                          <div className="flex items-center gap-1 bg-brand-success/10 text-brand-success px-3 py-1 rounded-full text-xs font-black tracking-widest">
                            <Target size={12} /> {90 + Math.floor(Math.random() * 10)}% MATCH
                          </div>
                        </div>
                        <h3 className="text-xl font-black text-slate-800 leading-tight mb-3 group-hover:text-brand-secondary transition-colors">{course.name}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
                        {course.description.length > 100 && (
                          <button onClick={() => toggleDescription(index)} className="mt-2 flex items-center gap-1 text-brand-secondary font-bold text-sm hover:underline">
                            {isExpanded ? <>See Less <ChevronUp size={14} /></> : <>See More <ChevronDown size={14} /></>}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="p-6 relative z-10 bg-white border-t border-slate-100">
                      <button
                        onClick={() => handleCoursePress(course)}
                        className="w-full flex items-center justify-center gap-2 bg-white border-2 border-slate-200 text-slate-800 py-4 rounded-2xl font-bold group-hover:bg-brand-secondary group-hover:border-brand-secondary group-hover:text-white transition-all duration-300"
                      >
                        Start Degree <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* CTA Banner */}
        <div className="mt-16 bg-brand-primary rounded-[32px] p-6 sm:p-8 lg:p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl overflow-hidden relative">
          <div className="absolute -right-20 -bottom-40 w-80 h-80 bg-brand-secondary rounded-full blur-[80px] opacity-50"></div>
          <div className="relative z-10 max-w-xl">
            <h3 className="text-3xl font-black text-white mb-4">Want more precise recommendations?</h3>
            <p className="text-blue-200 text-lg">Continue chatting with Mento AI to refine your learning profile and uncover pathways perfectly tailored to your goals.</p>
          </div>
          <Link href="/chat" className="relative z-10 bg-brand-accent text-white px-8 py-4 rounded-full font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-lg shadow-teal-500/30 whitespace-nowrap flex items-center gap-2">
            Chat with Mento <PlayCircle size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
}
