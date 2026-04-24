"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { logEvent } from "@/lib/engagement";
import Navbar from "@/components/Navbar";

interface Topic {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  timeEstimate: string;
}

interface Article {
  title: string;
  url: string;
  description: string;
  tags: string[];
}

const DIFF_COLORS: Record<string, string> = {
  Beginner: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  Intermediate: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  Advanced: "text-red-400 bg-red-500/10 border-red-500/20",
};

export default function ModuleDetailPage() {
  const { name } = useParams<{ name: string }>();
  const decoded = decodeURIComponent(name);

  const [topics, setTopics] = useState<Topic[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loadingT, setLoadingT] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    logEvent("module_view", { module: decoded });

    api
      .get<Topic[]>(`/modules/${encodeURIComponent(decoded)}/topics`)
      .then(setTopics)
      .catch(() => {})
      .finally(() => setLoadingT(false));

    api
      .get<Article[]>(`/api/tech-recommendations?module=${encodeURIComponent(decoded)}`)
      .then(setArticles)
      .catch(() => {});
  }, [decoded]);

  return (
    <div className="relative min-h-screen">
      <div className="mesh-bg" />
      <div className="relative z-10">
        <Navbar />
        <main className="mx-auto max-w-4xl px-6 py-10">

          <Link href="/modules" className="inline-flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
            ← Back to modules
          </Link>

          <div className="mt-4 fade-up">
            <h1 className="text-3xl font-bold text-white">{decoded}</h1>
          </div>

          {/* Topics */}
          <section className="mt-10">
            <div className="flex items-center gap-2 mb-5">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">Topics</h2>
              {!loadingT && (
                <span className="tag">{topics.length}</span>
              )}
            </div>

            {loadingT ? (
              <p className="text-sm text-slate-500">Loading topics…</p>
            ) : topics.length === 0 ? (
              <p className="text-sm text-slate-500">No topics found for this module.</p>
            ) : (
              <div className="space-y-2">
                {topics.map((t) => (
                  <div key={t.id} className="glass rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpanded(expanded === t.id ? null : t.id)}
                      className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-white/[0.02] transition-colors"
                    >
                      <span className="text-sm font-medium text-white">{t.name}</span>
                      <span className="ml-3 shrink-0 text-slate-500 text-xs transition-transform duration-200"
                        style={{ transform: expanded === t.id ? "rotate(180deg)" : "rotate(0)" }}>
                        ▼
                      </span>
                    </button>
                    {expanded === t.id && (
                      <div className="border-t border-white/[0.06] px-5 py-4">
                        <p className="text-sm text-slate-400 leading-relaxed">{t.description}</p>
                        <div className="mt-3 flex gap-2 flex-wrap">
                          <span className={`rounded-full border px-3 py-1 text-xs font-medium ${DIFF_COLORS[t.difficulty] ?? "text-slate-400 bg-white/05 border-white/10"}`}>
                            {t.difficulty}
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/05 px-3 py-1 text-xs font-medium text-slate-400">
                            {t.timeEstimate}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Articles */}
          {articles.length > 0 && (
            <section className="mt-12">
              <div className="flex items-center gap-2 mb-5">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">Related Articles</h2>
                <span className="tag">{articles.length}</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {articles.slice(0, 6).map((a) => (
                  <a
                    key={a.url}
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass rounded-xl p-5 transition-all duration-200 hover:border-indigo-500/30 hover:-translate-y-0.5 block"
                  >
                    <p className="text-sm font-medium text-white leading-snug line-clamp-2">{a.title}</p>
                    <p className="mt-2 text-xs text-slate-500 line-clamp-2">{a.description}</p>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {(a.tags ?? []).slice(0, 3).map((tag) => (
                        <span key={tag} className="tag">#{tag}</span>
                      ))}
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
