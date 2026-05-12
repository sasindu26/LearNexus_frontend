import Link from 'next/link';
import { Home, LayoutDashboard, MessageSquare, Activity } from 'lucide-react';

export default function MobileFooter() {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 pb-safe z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center h-20 px-4">
        <MobileNavLink href="/" icon={<Home size={24} />} label="Home" />
        <MobileNavLink href="/dashboard" icon={<LayoutDashboard size={24} />} label="Dash" />
        
        {/* Prominent Chat Button */}
        <Link href="/chat" className="relative -top-6 flex flex-col items-center group">
          <div className="w-16 h-16 bg-brand-primary rounded-full flex items-center justify-center text-white shadow-xl shadow-brand-primary/40 group-hover:scale-105 transition-transform duration-300 border-4 border-white">
            <MessageSquare size={28} />
          </div>
        </Link>
        
        <MobileNavLink href="/tech-updates" icon={<Activity size={24} />} label="Feed" />
      </div>
    </div>
  );
}

function MobileNavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-1 text-slate-400 hover:text-brand-primary transition-colors w-16">
      {icon}
      <span className="text-[10px] font-bold">{label}</span>
    </Link>
  );
}
