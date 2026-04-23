"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import Navbar from "@/components/Navbar";
import clsx from "clsx";

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
    return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading…</div>;
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-900">Your Career Roadmap</h1>
        <p className="mt-2 text-gray-500">
          Personalised job role matches and module recommendations based on your profile.
        </p>

        {fetching ? (
          <div className="mt-16 text-center text-gray-400">Calculating your matches…</div>
        ) : (
          <>
            {/* Recommended modules */}
            {recs && recs.recommended_modules.length > 0 && (
              <section className="mt-10">
                <h2 className="text-lg font-semibold text-gray-900">
                  Recommended next modules
                  {recs.target_course && (
                    <span className="ml-2 text-sm font-normal text-indigo-500">
                      — {recs.target_course}
                    </span>
                  )}
                </h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {recs.recommended_modules.map((m, i) => (
                    <Link
                      key={m}
                      href={`/modules/${encodeURIComponent(m.trim())}`}
                      className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-5 py-3.5 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                        {i + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{m.trim()}</span>
                      <span className="ml-auto shrink-0 text-xs text-gray-400">
                        {Math.round((recs.scores[m] ?? 0) * 100)}% match
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Job role cards */}
            <section className="mt-12">
              <h2 className="text-lg font-semibold text-gray-900">Best-fit job roles</h2>
              <div className="mt-4 space-y-3">
                {roles.map((r) => (
                  <div
                    key={r.role}
                    className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden"
                  >
                    <button
                      onClick={() => setExpanded(expanded === r.role ? null : r.role)}
                      className="flex w-full items-center gap-4 px-6 py-5 text-left"
                    >
                      <span className="text-2xl">{ROLE_ICONS[r.role] ?? "🎯"}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{r.role}</p>
                        <div className="mt-1.5 flex items-center gap-3">
                          <div className="h-1.5 w-32 overflow-hidden rounded-full bg-gray-100">
                            <div
                              className={clsx(
                                "h-full rounded-full",
                                r.match_score >= 40
                                  ? "bg-emerald-500"
                                  : r.match_score >= 25
                                  ? "bg-amber-400"
                                  : "bg-gray-300"
                              )}
                              style={{ width: `${Math.min(r.match_score * 2, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">{r.match_score}% match</span>
                        </div>
                      </div>
                      <span className="text-gray-400">{expanded === r.role ? "▲" : "▼"}</span>
                    </button>

                    {expanded === r.role && (
                      <div className="border-t border-gray-100 px-6 py-5 space-y-4">
                        {r.completed_modules.length > 0 && (
                          <div>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-600">
                              ✓ Completed ({r.completed_modules.length})
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {r.completed_modules.map((m) => (
                                <span
                                  key={m}
                                  className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                                >
                                  {m}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {r.missing_modules.length > 0 && (
                          <div>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-amber-600">
                              ○ Still needed ({r.missing_modules.length})
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {r.missing_modules.map((m) => (
                                <Link
                                  key={m}
                                  href={`/modules/${encodeURIComponent(m.trim())}`}
                                  className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100 transition-colors"
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
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </>
  );
}
