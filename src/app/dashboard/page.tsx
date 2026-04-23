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
      <div className="flex min-h-screen items-center justify-center text-gray-400">
        Loading…
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 py-10">
        {/* Welcome */}
        <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-8 text-white">
          <p className="text-indigo-100 text-sm font-medium">Welcome back 👋</p>
          <h1 className="mt-1 text-3xl font-bold">{profile.name}</h1>
          {profile.targetCourse && (
            <p className="mt-2 text-indigo-100">
              Enrolled in <span className="font-semibold text-white">{profile.targetCourse}</span>
            </p>
          )}
        </div>

        {/* Progress + stats */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:col-span-2">
            <p className="text-sm font-medium text-gray-500">Course progress</p>
            {progress ? (
              <>
                <p className="mt-2 text-4xl font-bold text-indigo-600">
                  {progress.percentage}%
                </p>
                <div className="mt-3 h-2 w-full rounded-full bg-gray-100">
                  <div
                    className="h-2 rounded-full bg-indigo-500 transition-all"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  {progress.completedModules} / {progress.totalModules} modules completed
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm text-gray-400">Loading progress…</p>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Career goal</p>
              <p className="mt-1 text-base font-semibold text-gray-800">
                {profile.careerGoal || "Not set"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Engagement score</p>
              {engagement ? (
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-2xl font-bold text-indigo-600">{engagement.score}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    engagement.risk_tier === "high"
                      ? "bg-emerald-50 text-emerald-700"
                      : engagement.risk_tier === "medium"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-gray-100 text-gray-500"
                  }`}>
                    {engagement.risk_tier} activity
                  </span>
                </div>
              ) : (
                <p className="mt-1 text-sm text-gray-400">—</p>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Interests</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {(profile.interests ?? []).slice(0, 4).map((i) => (
                  <span key={i} className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600">
                    {i}
                  </span>
                ))}
                {profile.interests?.length === 0 && (
                  <span className="text-xs text-gray-400">None set</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <h2 className="mt-10 text-lg font-semibold text-gray-900">Quick actions</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {[
            {
              href: "/chat",
              icon: "💬",
              title: "AI Advisor",
              desc: "Ask about modules, careers, or study tips",
              color: "bg-indigo-50 hover:bg-indigo-100",
            },
            {
              href: "/modules",
              icon: "📚",
              title: "Browse Modules",
              desc: "Explore all course modules and topics",
              color: "bg-violet-50 hover:bg-violet-100",
            },
            {
              href: "/roadmap",
              icon: "🎯",
              title: "Career Roadmap",
              desc: "See job role matches and recommended modules",
              color: "bg-amber-50 hover:bg-amber-100",
            },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={`rounded-2xl border border-gray-200 p-6 transition-colors ${action.color}`}
            >
              <span className="text-3xl">{action.icon}</span>
              <p className="mt-3 font-semibold text-gray-900">{action.title}</p>
              <p className="mt-1 text-sm text-gray-500">{action.desc}</p>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
