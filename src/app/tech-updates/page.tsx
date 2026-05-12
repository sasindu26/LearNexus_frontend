"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Star, ThumbsUp, ThumbsDown, Loader2, Globe, Calendar, Search, X, Pin, PinOff, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

const MotionLink = motion.create(Link);

interface Article {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  url?: string;
  image?: string;
  source?: string;
  created_at?: string;
}

const ALL_CATEGORIES = [
  { id: 'all',           label: 'All',                  tags: [] },
  { id: 'ai',            label: 'AI & ML',              tags: ['ai', 'machinelearning', 'deeplearning', 'artificialintelligence', 'neuralnetworks'] },
  { id: 'software',      label: 'Software Engineering', tags: ['softwareengineering', 'programming', 'cleancode', 'architecture', 'refactoring', 'coding'] },
  { id: 'cybersecurity', label: 'Cybersecurity',        tags: ['cybersecurity', 'security', 'hacking', 'infosec', 'pentest', 'vulnerability'] },
  { id: 'devops',        label: 'DevOps',               tags: ['devops', 'cicd', 'infrastructure', 'gitops', 'sre', 'automation'] },
  { id: 'cloud',         label: 'Cloud',                tags: ['cloud', 'aws', 'azure', 'gcp', 'googlecloud', 'cloudrun', 'serverless'] },
  { id: 'docker',        label: 'Docker & K8s',         tags: ['docker', 'kubernetes', 'containers', 'k8s', 'helm', 'microservices'] },
  { id: 'python',        label: 'Python',               tags: ['python', 'django', 'fastapi', 'flask', 'asyncio', 'pandas'] },
  { id: 'web',           label: 'Web Dev',              tags: ['webdev', 'javascript', 'frontend', 'react', 'nextjs', 'css', 'typescript'] },
  { id: 'llm',           label: 'LLMs & Agents',        tags: ['llm', 'gpt', 'langchain', 'llms', 'openai', 'ollama', 'agents', 'rag'] },
  { id: 'datascience',   label: 'Data Science',         tags: ['datascience', 'dataanalytics', 'statistics', 'jupyter', 'pandas', 'mlops'] },
  { id: 'database',      label: 'Databases',            tags: ['database', 'sql', 'neo4j', 'postgres', 'mongodb', 'redis'] },
  { id: 'networking',    label: 'Networking',           tags: ['networking', 'tcp', 'dns', 'protocols', 'distributedsystems', 'network'] },
  { id: 'mobile',        label: 'Mobile Dev',           tags: ['android', 'ios', 'mobile', 'reactnative', 'flutter', 'swift', 'kotlin'] },
  { id: 'testing',       label: 'Testing & QA',         tags: ['testing', 'tdd', 'unittest', 'jest', 'qa', 'selenium'] },
  { id: 'opensource',    label: 'Open Source',          tags: ['opensource', 'github', 'contribution', 'oss', 'foss'] },
  { id: 'blockchain',    label: 'Blockchain',           tags: ['blockchain', 'web3', 'crypto', 'defi', 'smartcontracts'] },
  { id: 'career',        label: 'Career & Jobs',        tags: ['career', 'jobs', 'hiring', 'interview', 'resume'] },
];

const PINNED_KEY = 'tech_pinned_categories';
const PER_PAGE = 20;

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function formatDate(raw?: string) {
  if (!raw) return null;
  try { return new Date(raw).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  catch { return null; }
}

function Pagination({ page, total, onPage }: { page: number; total: number; onPage: (p: number) => void }) {
  const pages = Math.ceil(total / PER_PAGE);
  if (pages <= 1) return null;

  const getPageNums = () => {
    if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, '...', pages];
    if (page >= pages - 3) return [1, '...', pages - 4, pages - 3, pages - 2, pages - 1, pages];
    return [1, '...', page - 1, page, page + 1, '...', pages];
  };

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <button
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        suppressHydrationWarning
        className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={18} />
      </button>
      {getPageNums().map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className="w-9 h-9 flex items-center justify-center text-slate-400 text-sm">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onPage(p as number)}
            suppressHydrationWarning
            className={`w-9 h-9 rounded-xl text-sm font-bold transition-colors ${
              page === p ? 'bg-brand-secondary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onPage(page + 1)}
        disabled={page === pages}
        suppressHydrationWarning
        className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

export default function TechUpdatesPage() {
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [rated, setRated] = useState<Record<string, 'effective' | 'not_effective'>>({});
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string[]>([]);
  const highlightRef = useRef<HTMLAnchorElement | null>(null);
  const feedTopRef = useRef<HTMLDivElement | null>(null);

  const fetchArticles = useCallback(async (categoryId: string) => {
    setLoading(true);
    try {
      const cat = ALL_CATEGORIES.find(c => c.id === categoryId);
      let res;
      if (!cat || cat.tags.length === 0) {
        res = await api.get('/api/tech-recommendations/trending?limit=200');
      } else {
        res = await api.get(`/api/tech-recommendations/by-tags?tags=${cat.tags.join(',')}&limit=200`);
      }
      setAllArticles(Array.isArray(res.data) ? res.data : []);
    } catch {
      setAllArticles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load pinned + read URL params (category/highlight) + initial fetch
  useEffect(() => {
    try { setPinned(JSON.parse(localStorage.getItem(PINNED_KEY) || '[]')); } catch { /* */ }
    const params = new URLSearchParams(window.location.search);
    const h = params.get('highlight');
    if (h) setHighlightId(decodeURIComponent(h));
    const cat = params.get('category');
    if (cat && ALL_CATEGORIES.some(c => c.id === cat)) {
      setActiveCategory(cat);
      fetchArticles(cat);
    } else {
      fetchArticles('all');
    }
  }, [fetchArticles]);

  const sortedCategories = [
    ...ALL_CATEGORIES.filter(c => pinned.includes(c.id)),
    ...ALL_CATEGORIES.filter(c => !pinned.includes(c.id)),
  ];

  const togglePin = (id: string) => {
    setPinned(prev => {
      const next = prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id];
      localStorage.setItem(PINNED_KEY, JSON.stringify(next));
      return next;
    });
  };

  // Re-fetch when category changes
  const handleCategoryChange = (catId: string) => {
    setActiveCategory(catId);
    setHighlightId(null);
    setSearch('');
    setPage(1);
    fetchArticles(catId);
    const url = catId === 'all' ? '/tech-updates' : `/tech-updates?category=${catId}`;
    window.history.replaceState({}, '', url);
  };

  // Scroll to highlighted article after load
  useEffect(() => {
    if (!highlightId || loading) return;
    const timer = setTimeout(() => highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 500);
    return () => clearTimeout(timer);
  }, [highlightId, loading, allArticles]);

  const handleRating = async (e: React.MouseEvent, articleId: string, rating: 'effective' | 'not_effective') => {
    e.preventDefault(); e.stopPropagation();
    if (rated[articleId]) return;
    setRated(prev => ({ ...prev, [articleId]: rating }));
    try { await api.post('/api/tech-recommendations/rating', { recommendation_id: articleId, rating }); } catch { /* */ }
  };

  // Build filtered + search list
  const filtered = search.trim()
    ? allArticles.filter(a =>
        a.title?.toLowerCase().includes(search.toLowerCase()) ||
        a.description?.toLowerCase().includes(search.toLowerCase()) ||
        a.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
      )
    : allArticles;

  // If highlight exists, put it at the top
  const displayed = highlightId
    ? (() => {
        const idx = filtered.findIndex(a => a.id === highlightId);
        if (idx > 0) return [filtered[idx], ...filtered.filter((_, i) => i !== idx)];
        return filtered;
      })()
    : filtered;

  const totalPages = Math.ceil(displayed.length / PER_PAGE);
  const pageItems = displayed.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const goToPage = (p: number) => {
    setPage(p);
    feedTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-brand-bg pb-24">
      {/* Hero */}
      <div className="bg-[#111827] pt-24 pb-32 px-4 sm:px-8 xl:px-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-secondary opacity-20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="w-full relative z-10 text-center">
          <div className="w-20 h-20 bg-brand-secondary/20 rounded-3xl flex items-center justify-center mb-6 mx-auto border border-brand-secondary/30">
            <Activity size={36} className="text-brand-secondary" />
          </div>
          <h1 className="text-5xl lg:text-6xl font-black text-white tracking-tight mb-4">Tech Radar</h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium">
            Trending articles and tools curated for your learning pathway.
          </p>
        </div>
      </div>

      <div className="w-full px-4 sm:px-8 xl:px-16 -mt-16 relative z-20">
        <div className="flex flex-col xl:flex-row gap-8 items-start">

          {/* ── Main Feed ── */}
          <div className="flex-1 min-w-0" ref={feedTopRef}>
            {/* Search */}
            <div className="relative mb-5">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search articles, tags..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                suppressHydrationWarning
                className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-10 py-3.5 text-slate-700 font-medium placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary/30 focus:border-brand-secondary"
              />
              {search && (
                <button onClick={() => setSearch('')} suppressHydrationWarning className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Count */}
            {!loading && (
              <p className="text-xs text-slate-400 font-medium mb-4 pl-1">
                {displayed.length} articles · page {page} of {totalPages || 1}
              </p>
            )}

            {loading ? (
              <div className="flex justify-center items-center h-64 bg-white rounded-3xl shadow-xl">
                <Loader2 className="animate-spin text-brand-secondary" size={32} />
              </div>
            ) : pageItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 bg-white rounded-3xl shadow-xl text-slate-400">
                <Star size={40} className="mb-4 opacity-30" />
                <p className="font-bold">No articles found</p>
                <p className="text-sm mt-1">Try a different category or search term</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-5">
                  <AnimatePresence>
                    {pageItems.map((article, i) => {
                      const isHighlighted = article.id === highlightId;
                      const internalUrl = `/tech-updates/${encodeURIComponent(article.id)}`;
                      return (
                        <MotionLink
                          key={article.id || `a-${i}`}
                          href={internalUrl}
                          ref={isHighlighted ? highlightRef : null}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: Math.min(i * 0.04, 0.4) }}
                          className={`bg-white rounded-2xl border shadow-md overflow-hidden group flex flex-col transition-all duration-200 cursor-pointer hover:shadow-xl hover:-translate-y-1 ${
                            isHighlighted
                              ? 'border-brand-secondary ring-2 ring-brand-secondary/30'
                              : 'border-slate-100 hover:border-slate-200'
                          }`}
                        >
                          {/* Cover image */}
                          <div className="relative w-full h-44 overflow-hidden bg-slate-100 shrink-0">
                            {article.image ? (
                              <img
                                src={article.image}
                                alt={article.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                onError={e => {
                                  const el = e.target as HTMLImageElement;
                                  el.style.display = 'none';
                                  el.parentElement!.classList.add('no-img');
                                }}
                              />
                            ) : null}
                            <div className={`w-full h-full items-center justify-center bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 ${article.image ? 'hidden no-img:flex' : 'flex'}`}>
                              <Star size={36} className="text-brand-primary/20" />
                            </div>
                            {isHighlighted && (
                              <span className="absolute top-2 left-2 bg-brand-secondary text-white text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest">
                                New for you
                              </span>
                            )}
                          </div>

                          {/* Body */}
                          <div className="p-4 flex flex-col justify-between flex-1">
                            <div>
                              {/* Tags */}
                              {article.tags && article.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {article.tags.slice(0, 2).map((tag, ti) => (
                                    <span key={`${tag}-${ti}`} className="text-[9px] font-bold text-brand-secondary bg-brand-secondary/10 px-2 py-0.5 rounded-full uppercase tracking-widest">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                              <h3 className="text-sm font-black text-slate-800 mb-1.5 group-hover:text-brand-secondary transition-colors leading-snug line-clamp-2">
                                {article.title}
                              </h3>
                              {article.description && (
                                <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">
                                  {stripHtml(article.description)}
                                </p>
                              )}
                            </div>

                            <div className="mt-3 pt-3 border-t border-slate-100">
                              <div className="flex items-center gap-x-3 text-[11px] text-slate-400 mb-2">
                                {article.source && <span className="flex items-center gap-1"><Globe size={10} />{article.source}</span>}
                                {formatDate(article.created_at) && <span className="flex items-center gap-1 truncate"><Calendar size={10} />{formatDate(article.created_at)}</span>}
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex gap-1.5">
                                  <button
                                    onClick={e => handleRating(e, article.id, 'effective')}
                                    disabled={!!rated[article.id]}
                                    suppressHydrationWarning
                                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${rated[article.id] === 'effective' ? 'bg-green-100 text-green-600' : 'bg-slate-50 text-slate-400 hover:bg-green-50 hover:text-green-500'}`}
                                    title="Helpful"
                                  >
                                    <ThumbsUp size={11} />
                                  </button>
                                  <button
                                    onClick={e => handleRating(e, article.id, 'not_effective')}
                                    disabled={!!rated[article.id]}
                                    suppressHydrationWarning
                                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${rated[article.id] === 'not_effective' ? 'bg-red-100 text-red-500' : 'bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-400'}`}
                                    title="Not helpful"
                                  >
                                    <ThumbsDown size={11} />
                                  </button>
                                </div>
                                <span className="text-xs font-bold text-brand-primary group-hover:text-brand-secondary transition-colors">
                                  Read →
                                </span>
                              </div>
                            </div>
                          </div>
                        </MotionLink>
                      );
                    })}
                  </AnimatePresence>
                </div>

                {/* Pagination */}
                <Pagination page={page} total={displayed.length} onPage={goToPage} />
              </>
            )}
          </div>

          {/* ── Categories Sidebar ── */}
          <div className="xl:w-64 w-full shrink-0">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden sticky top-24">
              <div className="px-5 py-4 border-b border-slate-100">
                <p className="font-black text-slate-800 text-xs uppercase tracking-widest">Categories</p>
                {pinned.length > 0 && (
                  <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{pinned.length} pinned · hover to pin/unpin</p>
                )}
                {pinned.length === 0 && (
                  <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Hover a category to pin it</p>
                )}
              </div>
              <div className="p-3 space-y-0.5 max-h-[75vh] overflow-y-auto">
                {sortedCategories.map(cat => {
                  const isPinned = pinned.includes(cat.id);
                  const isActive = activeCategory === cat.id && !highlightId;
                  return (
                    <div key={cat.id} className="flex items-center gap-1 group/item">
                      <button
                        onClick={() => handleCategoryChange(cat.id)}
                        suppressHydrationWarning
                        className={`flex-1 text-left px-3 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                          isActive
                            ? 'bg-brand-secondary text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-brand-secondary'
                        }`}
                      >
                        {isPinned && <Pin size={9} className={isActive ? 'text-white/70' : 'text-brand-secondary/60'} />}
                        {cat.label}
                      </button>
                      <button
                        onClick={() => togglePin(cat.id)}
                        title={isPinned ? 'Unpin' : 'Pin to top'}
                        suppressHydrationWarning
                        className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                          isPinned
                            ? 'text-brand-secondary bg-brand-secondary/10 opacity-100'
                            : 'text-slate-300 hover:text-brand-secondary hover:bg-slate-100 opacity-0 group-hover/item:opacity-100'
                        }`}
                      >
                        {isPinned ? <PinOff size={12} /> : <Pin size={12} />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
