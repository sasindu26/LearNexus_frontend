"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import Navbar from "@/components/Navbar";

interface JobRole {
  role: string;
  match_score: number;
  required_modules: string[];
  completed_modules: string[];
  missing_modules: string[];
}

interface Recommendations {
  profile_text: string;
  target_course: string | null;
  recommended_modules: string[];
  scores: Record<string, number>;
}

const ROLE_ICONS: Record<string, string> = {
  "Software Engineer": "💻",
  "Data Scientist": "📊",
  "Network Engineer": "🌐",
  "Cybersecurity Analyst": "🔒",
  "Full Stack Developer": "🛠️",
  "Mobile App Developer": "📱",
  "Cloud Engineer": "☁️",
  "AI / ML Engineer": "🤖",
  "Database Administrator": "🗄️",
  "IT Project Manager": "📋",
};

function scoreColor(score: number) {
  if (score >= 40) return { bar: "#10b981", badge: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
  if (score >= 25) return { bar: "#f59e0b", badge: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
  return { bar: "#6366f1", badge: "text-indigo-300 bg-indigo-500/10 border-indigo-500/20" };
}

export default function RoadmapPage() {
  const { profile, loading } = useAuth();
  const router = useRouter();
  const [roles, setRoles] = useState<JobRole[]>([]);
  const [recs, setRecs] = useState<Recommendations | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !profile) router.replace("/login");
  }, [loading, profile, router]);

  useEffect(() => {
    if (!profile) return;
    Promise.all([
      api.get<{ roles: JobRole[] }>("/api/job-roles"),
      api.get<Recommendations>("/api/recommendations"),
    ])
      .then(([j, r]) => {
        setRoles(j.roles);
        setRecs(r);
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [profile]);

  if (loading || !profile) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="mesh-bg" />
        <div className="relative z-10 text-slate-400 text-sm">Loading…</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <div className="mesh-bg" />
      <div className="relative z-10">
        <Navbar />
        <main className="mx-auto max-w-5xl px-6 py-10">

          <div className="fade-up">
            <span className="tag">Career Matching</span>
            <h1 className="mt-4 text-3xl font-bold text-white">Your Career Roadmap</h1>
            <p className="mt-2 text-slate-400 text-sm">
              Personalised job role matches and module recommendations based on your profile.
            </p>
          </div>

          {fetching ? (
            <div className="mt-16 text-center text-slate-500 text-sm">Calculating your matches…</div>
          ) : (
            <>
              {/* Recommended modules */}
              {recs && recs.recommended_modules.length > 0 && (
                <section className="mt-10">
                  <div className="flex items-center gap-2 mb-5">
                    <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">
                      Recommended Next Modules
                    </h2>
                    {recs.target_course && (
                      <span className="tag">{recs.target_course}</span>
                    )}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {recs.recommended_modules.map((m, i) => (
                      <Link
                        key={m}
                        href={`/modules/${encodeURIComponent(m.trim())}`}
                        className="glass rounded-xl px-5 py-4 flex items-center gap-4 transition-all duration-200 hover:border-indigo-500/30 hover:-translate-y-0.5"
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-300 border border-indigo-500/20">
                          {i + 1}
                        </span>
                        <span className="text-sm font-medium text-white flex-1">{m.trim()}</span>
                        <span className="shrink-0 text-xs text-slate-500">
                          {Math.round((recs.scores[m] ?? 0) * 100)}% match
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Job role cards */}
              <section className="mt-12">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500 mb-5">
                  Best-fit Job Roles
                </h2>
                <div className="space-y-3">
                  {roles.map((r) => {
                    const { bar, badge } = scoreColor(r.match_score);
                    const isOpen = expanded === r.role;
                    return (
                      <div key={r.role} className="glass rounded-2xl overflow-hidden">
                        <button
                          onClick={() => setExpanded(isOpen ? null : r.role)}
                          className="flex w-full items-center gap-4 px-6 py-5 text-left hover:bg-white/[0.02] transition-colors"
                        >
                          <span className="text-2xl">{ROLE_ICONS[r.role] ?? "◉"}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-white text-sm">{r.role}</p>
                            <div className="mt-2 flex items-center gap-3">
                              <div className="progress-bar flex-1 max-w-[120px]">
                                <div
                                  className="progress-fill"
                                  style={{ width: `${Math.min(r.match_score * 2, 100)}%`, background: bar }}
                                />
                              </div>
                              <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${badge}`}>
                                {r.match_score}% match
                              </span>
                            </div>
                          </div>
                          <span
                            className="shrink-0 text-slate-500 text-xs transition-transform duration-300"
                            style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0)" }}
                          >
                            ▼
                          </span>
                        </button>

                        {isOpen && (
                          <div className="border-t border-white/[0.06] px-6 py-5 space-y-4">
                            {r.completed_modules.length > 0 && (
                              <div>
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                                  ✓ Completed ({r.completed_modules.length})
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {r.completed_modules.map((m) => (
                                    <span key={m}
                                      className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                                      {m}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {r.missing_modules.length > 0 && (
                              <div>
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
                                  ○ Still needed ({r.missing_modules.length})
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {r.missing_modules.map((m) => (
                                    <Link
                                      key={m}
                                      href={`/modules/${encodeURIComponent(m.trim())}`}
                                      className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400 hover:bg-amber-500/20 transition-colors"
                                    >
                                      {m}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
