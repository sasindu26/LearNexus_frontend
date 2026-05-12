"use client";

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Award, ChevronLeft, ChevronRight, Sparkles, LayoutGrid } from 'lucide-react';
import { useSession } from '@/context/SessionContext';
import {
  getPostCompletionCerts, getAllCertificates, type Certificate
} from '@/lib/careerApi';
import CertificateCard from '@/components/career/CertificateCard';
import Link from 'next/link';

const DIFFICULTY_OPTIONS = ['', 'beginner', 'intermediate', 'advanced'];

type ActiveTab = 'recommended' | 'all';

export default function CertificatesPage() {
  const { token, isLoggedIn } = useSession();
  const [activeTab, setActiveTab] = useState<ActiveTab>('recommended');

  // ── Recommended (post-completion) state ──
  const [recCerts, setRecCerts] = useState<Certificate[]>([]);
  const [recTotal, setRecTotal] = useState(0);
  const [recPages, setRecPages] = useState(1);
  const [recPage, setRecPage] = useState(1);
  const [recLoading, setRecLoading] = useState(true);

  // ── All certificates state ──
  const [allCerts, setAllCerts] = useState<Certificate[]>([]);
  const [allTotal, setAllTotal] = useState(0);
  const [allPages, setAllPages] = useState(1);
  const [allPage, setAllPage] = useState(1);
  const [allLoading, setAllLoading] = useState(false);
  const [difficulty, setDifficulty] = useState('');

  // Fetch recommended certs
  const fetchRecommended = useCallback(async () => {
    if (!token) { setRecLoading(false); return; }
    setRecLoading(true);
    try {
      const res = await getPostCompletionCerts(token, recPage, 12);
      setRecCerts(res.certificates || []);
      setRecTotal(res.total || 0);
      setRecPages(res.pages || 1);
    } catch {
      setRecCerts([]);
    } finally {
      setRecLoading(false);
    }
  }, [token, recPage]);

  // Fetch all certs (lazy — only when tab is active)
  const fetchAll = useCallback(async () => {
    setAllLoading(true);
    try {
      const res = await getAllCertificates(allPage, 12, difficulty || undefined);
      setAllCerts(res.certificates || []);
      setAllTotal(res.total || 0);
      setAllPages(res.pages || 1);
    } catch {
      setAllCerts([]);
    } finally {
      setAllLoading(false);
    }
  }, [allPage, difficulty]);

  useEffect(() => { fetchRecommended(); }, [fetchRecommended]);

  useEffect(() => {
    if (activeTab === 'all') fetchAll();
  }, [activeTab, fetchAll]);

  if (!isLoggedIn && activeTab === 'recommended') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <Award size={48} className="text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-slate-700 mb-2">Certificate Recommendations</h2>
          <p className="text-slate-500 mb-6">Sign in to get personalized certificate suggestions based on your course progress.</p>
          <Link href="/login" className="bg-brand-primary text-white font-bold px-6 py-3 rounded-xl">Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="w-full px-4 sm:px-8 xl:px-16 2xl:px-24 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Award size={20} className="text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-800">Certificate Pathways</h1>
          </div>
          <p className="text-slate-500 font-medium">
            Certifications matched to your course goals and career trajectory
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab('recommended')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
              activeTab === 'recommended'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Sparkles size={15} />
            Recommended
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
              activeTab === 'all'
                ? 'bg-slate-700 text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <LayoutGrid size={15} />
            All Certificates
          </button>
        </div>

        {/* ── Recommended tab ── */}
        {activeTab === 'recommended' && (
          <>
            <div className="mb-6">
              <p className="text-sm text-slate-500">
                These certificates target skills you'll gain after completing all course modules — ideal for your next career step.
              </p>
            </div>

            {!isLoggedIn ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
                <Award size={40} className="text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-bold">Sign in for personalized recommendations</p>
              </div>
            ) : recLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-100 h-56 animate-pulse" />
                ))}
              </div>
            ) : recCerts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
                <Award size={40} className="text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-bold text-lg">No recommendations yet</p>
                <p className="text-slate-300 text-sm mt-2">Enroll in a course and complete some topics to unlock suggestions.</p>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recCerts.map(cert => <CertificateCard key={cert.id} cert={cert} />)}
              </motion.div>
            )}

            {recPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <button onClick={() => setRecPage(p => Math.max(1, p - 1))} disabled={recPage === 1}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold text-sm hover:border-brand-secondary/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <ChevronLeft size={16} /> Prev
                </button>
                <span className="text-sm font-bold text-slate-600">{recPage} / {recPages}</span>
                <button onClick={() => setRecPage(p => Math.min(recPages, p + 1))} disabled={recPage === recPages}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold text-sm hover:border-brand-secondary/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}

        {/* ── All Certificates tab ── */}
        {activeTab === 'all' && (
          <>
            {/* Difficulty filter */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-6 flex flex-wrap gap-3 items-center">
              <span className="text-sm font-bold text-slate-600">Difficulty:</span>
              {DIFFICULTY_OPTIONS.map(d => (
                <button
                  key={d || 'all'}
                  onClick={() => { setDifficulty(d); setAllPage(1); }}
                  className={`px-4 py-1.5 rounded-xl text-sm font-bold transition-colors ${
                    difficulty === d
                      ? 'bg-brand-secondary text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {d ? d.charAt(0).toUpperCase() + d.slice(1) : 'All'}
                </button>
              ))}
              {allTotal > 0 && (
                <span className="ml-auto text-sm text-slate-400 font-medium">{allTotal} certificates</span>
              )}
            </div>

            {allLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-100 h-56 animate-pulse" />
                ))}
              </div>
            ) : allCerts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
                <Award size={40} className="text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-bold text-lg">No certificates found</p>
                <p className="text-slate-300 text-sm mt-2">Try changing the difficulty filter or wait for data to populate.</p>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {allCerts.map(cert => <CertificateCard key={cert.id} cert={cert} showScore={false} />)}
              </motion.div>
            )}

            {allPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <button onClick={() => setAllPage(p => Math.max(1, p - 1))} disabled={allPage === 1}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold text-sm hover:border-brand-secondary/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <ChevronLeft size={16} /> Prev
                </button>
                <span className="text-sm font-bold text-slate-600">{allPage} / {allPages}</span>
                <button onClick={() => setAllPage(p => Math.min(allPages, p + 1))} disabled={allPage === allPages}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold text-sm hover:border-brand-secondary/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
