"use client";
import Link from "next/link";
import { useAuth } from "@/lib/auth";

export default function Navbar() {
  const { profile, logout, loading } = useAuth();

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-indigo-600">LearNexus</span>
        </Link>

        <div className="flex items-center gap-6 text-sm font-medium">
          <Link href="/modules" className="text-gray-600 hover:text-indigo-600 transition-colors">
            Modules
          </Link>

          {!loading && (
            <>
              {profile ? (
                <>
                  <Link href="/chat" className="text-gray-600 hover:text-indigo-600 transition-colors">
                    AI Chat
                  </Link>
                  <Link href="/roadmap" className="text-gray-600 hover:text-indigo-600 transition-colors">
                    Roadmap
                  </Link>
                  <Link href="/dashboard" className="text-gray-600 hover:text-indigo-600 transition-colors">
                    Dashboard
                  </Link>
                  <button
                    onClick={logout}
                    className="rounded-full bg-gray-100 px-4 py-1.5 text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-gray-600 hover:text-indigo-600 transition-colors">
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-full bg-indigo-600 px-4 py-1.5 text-white hover:bg-indigo-700 transition-colors"
                  >
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
