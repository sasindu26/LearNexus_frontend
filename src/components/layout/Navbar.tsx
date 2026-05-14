"use client";

import Link from 'next/link';
import { Home, LayoutDashboard, MessageSquare, Activity, User, LogIn, Bell, X, CheckCheck, TrendingUp } from 'lucide-react';
import { useSession } from '@/context/SessionContext';
import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';

interface NotifArticle {
  id: string;
  title: string;
  source?: string;
  tags?: string[];
  image?: string;
}

const SEEN_KEY = 'tech_seen_notif_ids';

function getSeenIds(): string[] {
  try { return JSON.parse(localStorage.getItem(SEEN_KEY) || '[]'); } catch { return []; }
}
function addSeenId(id: string) {
  const seen = getSeenIds();
  if (!seen.includes(id)) {
    localStorage.setItem(SEEN_KEY, JSON.stringify([...seen, id]));
  }
}
function markAllSeen(ids: string[]) {
  const seen = getSeenIds();
  const merged = [...new Set([...seen, ...ids])];
  localStorage.setItem(SEEN_KEY, JSON.stringify(merged));
}

export default function Navbar() {
  const { isLoggedIn, user } = useSession();
  const [allNotifs, setAllNotifs] = useState<NotifArticle[]>([]);
  const [unreadNotifs, setUnreadNotifs] = useState<NotifArticle[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch course-relevant articles for notifications
  useEffect(() => {
    if (!isLoggedIn || !user?.enrolled_courses?.[0]) return;
    const course = (user.enrolled_courses[0] as any).name || '';
    if (!course) return;

    api.get(`/api/tech-recommendations/for-course?course=${encodeURIComponent(course)}&limit=10`)
      .then(res => {
        if (!Array.isArray(res.data)) return;
        // Filter: only articles with images
        const withImage = res.data.filter((a: NotifArticle) => a.image);
        setAllNotifs(withImage);
        // Filter out already-seen IDs
        const seen = getSeenIds();
        setUnreadNotifs(withImage.filter((a: NotifArticle) => !seen.includes(a.id)));
      })
      .catch(() => {});
  }, [isLoggedIn, user]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleBellClick = () => setShowNotifs(prev => !prev);

  const handleNotifClick = (article: NotifArticle) => {
    // Mark as read and remove from unread list
    addSeenId(article.id);
    setUnreadNotifs(prev => prev.filter(a => a.id !== article.id));
    setShowNotifs(false);
    // Navigate to internal article page
    window.location.href = `/tech-updates/${encodeURIComponent(article.id)}`;
  };

  const handleMarkAllRead = () => {
    markAllSeen(allNotifs.map(a => a.id));
    setUnreadNotifs([]);
    setShowNotifs(false);
  };

  return (
    <nav className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-100 shadow-sm">
      <div className="flex justify-between items-center w-full px-4 sm:px-8 xl:px-16 h-20">
        <div className="flex items-center gap-12">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/30">
              <span className="text-white font-black text-xl">M</span>
            </div>
            <span className="text-2xl font-black text-brand-primary tracking-tight">LearNexus</span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            <NavLink href="/" icon={<Home size={18} />} label="Home" />
            <NavLink href="/dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" />
            <NavLink href="/chat" icon={<MessageSquare size={18} />} label="LearNexus AI" />
            <NavLink href="/tech-updates" icon={<Activity size={18} />} label="Tech Feed" />
            <NavLink href="/career" icon={<TrendingUp size={18} />} label="Career" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          {isLoggedIn && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={handleBellClick}
                className="relative w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-brand-secondary/10 hover:text-brand-secondary hover:border-brand-secondary/30 transition-colors"
                title="Course notifications"
              >
                <Bell size={18} />
                {unreadNotifs.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                    {unreadNotifs.length}
                  </span>
                )}
              </button>

              {showNotifs && (
                <div className="absolute right-0 top-14 w-80 bg-white rounded-2xl border border-slate-100 shadow-2xl overflow-hidden z-50">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
                    <div>
                      <p className="font-black text-slate-800 text-sm">Course News</p>
                      <p className="text-xs text-slate-400 font-medium">
                        Articles for{' '}
                        <span className="font-bold text-brand-secondary">
                          {(user?.enrolled_courses?.[0] as any)?.name || 'your course'}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {unreadNotifs.length > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          title="Mark all as read"
                          className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-brand-secondary transition-colors px-2 py-1 rounded-lg hover:bg-slate-100"
                        >
                          <CheckCheck size={13} /> All read
                        </button>
                      )}
                      <button onClick={() => setShowNotifs(false)} className="text-slate-400 hover:text-slate-600">
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Articles list */}
                  {unreadNotifs.length === 0 ? (
                    <div className="px-4 py-10 text-center">
                      <CheckCheck size={28} className="text-slate-200 mx-auto mb-2" />
                      <p className="text-slate-400 text-sm font-bold">All caught up!</p>
                      <p className="text-slate-300 text-xs mt-1">No new articles for your course</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
                      {unreadNotifs.map((article, i) => (
                        <button
                          key={article.id || i}
                          onClick={() => handleNotifClick(article)}
                          className="w-full text-left flex gap-3 px-4 py-3 hover:bg-slate-50 transition-colors group"
                        >
                          {/* Thumbnail */}
                          {article.image && (
                            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                              <img
                                src={article.image}
                                alt=""
                                className="w-full h-full object-cover"
                                onError={e => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }}
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            {article.tags?.[0] && (
                              <span className="text-[10px] font-bold text-brand-secondary uppercase tracking-widest block mb-0.5">
                                {article.tags[0]}
                              </span>
                            )}
                            <p className="text-sm font-bold text-slate-700 group-hover:text-brand-secondary transition-colors leading-snug line-clamp-2">
                              {article.title}
                            </p>
                            {article.source && (
                              <p className="text-xs text-slate-400 mt-0.5">{article.source}</p>
                            )}
                          </div>
                          {/* Unread dot */}
                          <div className="w-2 h-2 rounded-full bg-brand-secondary shrink-0 mt-1.5" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
                    <Link
                      href="/tech-updates"
                      onClick={() => setShowNotifs(false)}
                      className="flex items-center justify-center gap-1.5 text-sm font-bold text-brand-primary hover:text-brand-secondary transition-colors"
                    >
                      View all articles
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Profile / Sign In */}
          {isLoggedIn ? (
            <Link
              href="/profile"
              className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center text-white font-bold hover:bg-brand-primary/90 transition-colors shadow-md"
              title={user?.name || 'Profile'}
            >
              {user?.name?.charAt(0).toUpperCase() || <User size={18} />}
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white font-bold px-5 py-2.5 rounded-xl transition-colors shadow-md"
            >
              <LogIn size={16} />
              <span className="hidden sm:inline">Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 text-slate-500 font-bold hover:text-brand-secondary transition-colors duration-200 group"
    >
      <span className="group-hover:scale-110 transition-transform duration-200">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
