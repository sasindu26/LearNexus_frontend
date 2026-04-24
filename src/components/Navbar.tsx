"use client";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { profile, logout, loading } = useAuth();
  const path = usePathname();

  const link = (href: string, label: string) => (
    <Link
      href={href}
      className={`text-sm font-medium transition-colors ${
        path === href ? "text-indigo-400" : "text-slate-400 hover:text-slate-100"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#080c14]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <span className="text-xs font-bold text-white">LN</span>
          </div>
          <span className="font-bold text-white tracking-tight">LearNexus</span>
        </Link>

        <div className="flex items-center gap-6">
          {link("/modules", "Modules")}
          {!loading && (
            <>
              {profile ? (
                <>
                  {link("/chat", "AI Chat")}
                  {link("/roadmap", "Roadmap")}
                  {link("/dashboard", "Dashboard")}
                  <button
                    onClick={logout}
                    className="text-sm font-medium text-slate-400 hover:text-slate-100 transition-colors"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  {link("/login", "Log in")}
                  <Link href="/register" className="btn-primary text-sm py-2 px-5">
                    Get started
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
