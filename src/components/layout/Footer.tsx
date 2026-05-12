import Link from 'next/link';
import { MessageSquare, Activity, LayoutDashboard, Home, User, BookOpen, Globe, Share2, Briefcase } from 'lucide-react';

const navGroups = [
  {
    label: 'Platform',
    links: [
      { href: '/', label: 'Home', icon: <Home size={14} /> },
      { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={14} /> },
      { href: '/tech-updates', label: 'Tech Feed', icon: <Activity size={14} /> },
      { href: '/recommendations', label: 'Recommendations', icon: <BookOpen size={14} /> },
    ],
  },
  {
    label: 'AI Tools',
    links: [
      { href: '/chat', label: 'Mento AI Chat', icon: <MessageSquare size={14} /> },
    ],
  },
  {
    label: 'Account',
    links: [
      { href: '/profile', label: 'Profile', icon: <User size={14} /> },
      { href: '/login', label: 'Sign In', icon: null },
      { href: '/signup', label: 'Sign Up', icon: null },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#0f172a] text-slate-400 mt-16">
      <div className="px-4 sm:px-8 xl:px-16 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-brand-primary rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/30">
                <span className="text-white font-black text-lg">M</span>
              </div>
              <span className="text-xl font-black text-white tracking-tight">LearNexus</span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">
              Your AI-powered personalised degree pathfinder. Discover the right learning pathway and grow with Mento AI by your side.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <a href="#" aria-label="GitHub" className="w-9 h-9 rounded-full bg-white/5 hover:bg-brand-primary/20 hover:text-white flex items-center justify-center transition-colors">
                <Globe size={16} />
              </a>
              <a href="#" aria-label="Twitter" className="w-9 h-9 rounded-full bg-white/5 hover:bg-brand-primary/20 hover:text-white flex items-center justify-center transition-colors">
                <Share2 size={16} />
              </a>
              <a href="#" aria-label="LinkedIn" className="w-9 h-9 rounded-full bg-white/5 hover:bg-brand-primary/20 hover:text-white flex items-center justify-center transition-colors">
                <Briefcase size={16} />
              </a>
            </div>
          </div>

          {/* Nav Groups */}
          {navGroups.map((group) => (
            <div key={group.label}>
              <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-4">{group.label}</h4>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="flex items-center gap-2 text-sm hover:text-white transition-colors"
                    >
                      {link.icon && <span className="opacity-60">{link.icon}</span>}
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5 px-4 sm:px-8 xl:px-16 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        <span>&copy; {new Date().getFullYear()} LearNexus. All rights reserved.</span>
        <div className="flex items-center gap-6">
          <Link href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
          <Link href="#" className="hover:text-slate-400 transition-colors">Terms of Use</Link>
        </div>
      </div>
    </footer>
  );
}
