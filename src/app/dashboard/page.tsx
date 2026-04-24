"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import Navbar from "@/components/Navbar";

interface Progress {
  course: string | null;
  completedModules: number;
  totalModules: number;
  percentage: number;
}

interface Engagement {
  score: number;
  risk_tier: string;
  total_events: number;
}

const TIER_COLORS: Record<string, string> = {
  high: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  low: "text-slate-400 bg-white/05 border-white/10",
};

export default function DashboardPage() {
  const { profile, loading } = useAuth();
  const router = useRouter();
  const [progress, setProgress] = useState<Progress | null>(null);
  const [engagement, setEngagement] = useState<Engagement | null>(null);

  useEffect(() => {
    if (!loading && !profile) router.replace("/login");
  }, [loading, profile, router]);

  useEffect(() => {
    if (!profile) return;
    api.get<{ progress: Progress }>("/student/progress")
      .then((r) => setProgress(r.progress))
      .catch(() => {});
    api.get<{ score: number; risk_tier: string; total_events: number }>("/engagement/score")
      .then((r) => setEngagement({ score: r.score, risk_tier: r.risk_tier, total_events: r.total_events }))
      .catch(() => {});
  }, [profile]);

  if (loading || !profile) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="mesh-bg" />
        <div className="relative z-10 text-slate-400 text-sm">Loading…</div>
      </div>
    );
  }

  const tierClass = TIER_COLORS[engagement?.risk_tier ?? "low"] ?? TIER_COLORS.low;

  return (
    <div className="relative min-h-screen">
      <div className="mesh-bg" />
      <div className="relative z-10">
        <Navbar />
        <main className="mx-auto max-w-5xl px-6 py-10">

          {/* Welcome banner */}
          <div className="fade-up relative overflow-hidden rounded-2xl p-8"
            style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(139,92,246,0.2) 100%)", border: "1px solid rgba(99,102,241,0.3)" }}>
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse 60% 80% at 90% 50%, rgba(139,92,246,0.15) 0%, transparent 70%)" }} />
            <p className="text-indigo-300 text-sm font-medium">Welcome back</p>
            <h1 className="mt-1 text-3xl font-bold text-white">{profile.name}</h1>
            {profile.targetCourse && (
              <p className="mt-2 text-indigo-200 text-sm">
                Enrolled in <span className="font-semibold text-white">{profile.targetCourse}</span>
              </p>
            )}
          </div>

          {/* Stats row */}
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {/* Progress card */}
            <div className="glass rounded-2xl p-6 sm:col-span-2">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Course Progress</p>
              {progress ? (
                <>
                  <p className="mt-3 text-4xl font-bold grad-text">{progress.percentage}%</p>
                  <div className="progress-bar mt-4">
                    <div className="progress-fill" style={{ width: `${progress.percentage}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    {progress.completedModules} / {progress.totalModules} modules completed
                  </p>
                </>
              ) : (
                <p className="mt-3 text-sm text-slate-500">Loading progress…</p>
              )}
            </div>

            {/* Engagement card */}
            <div className="glass rounded-2xl p-6 space-y-5">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Career Goal</p>
                <p className="mt-2 text-sm font-semibold text-white">{profile.careerGoal || "Not set"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Engagement</p>
                {engagement ? (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-2xl font-bold grad-text">{engagement.score}</span>
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${tierClass}`}>
                      {engagement.risk_tier} activity
                    </span>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">—</p>
                )}
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Interests</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {(profile.interests ?? []).slice(0, 4).map((i) => (
                    <span key={i} className="tag">{i}</span>
                  ))}
                  {(profile.interests?.length ?? 0) === 0 && (
                    <span className="text-xs text-slate-500">None set</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <h2 className="mt-10 text-xs font-semibold uppercase tracking-widest text-slate-500">Quick Actions</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {[
              {
                href: "/chat",
                icon: "◈",
                title: "AI Advisor",
                desc: "Ask about modules, careers, or study tips",
                glow: "rgba(99,102,241,0.15)",
              },
              {
                href: "/modules",
                icon: "⬡",
                title: "Browse Modules",
                desc: "Explore all course modules and topics",
                glow: "rgba(139,92,246,0.15)",
              },
              {
                href: "/roadmap",
                icon: "◉",
                title: "Career Roadmap",
                desc: "See job role matches and required modules",
                glow: "rgba(59,130,246,0.15)",
              },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="glass rounded-2xl p-6 transition-all duration-300 hover:border-indigo-500/30 hover:-translate-y-1"
                style={{ boxShadow: `inset 0 0 30px ${action.glow}` }}
              >
                <span className="text-2xl font-bold grad-text">{action.icon}</span>
                <p className="mt-4 font-semibold text-white">{action.title}</p>
                <p className="mt-1 text-sm text-slate-400 leading-relaxed">{action.desc}</p>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
