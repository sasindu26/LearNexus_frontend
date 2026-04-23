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
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <Link href="/modules" className="text-sm text-indigo-600 hover:underline">
          ← Back to modules
        </Link>

        <h1 className="mt-4 text-3xl font-bold text-gray-900">{decoded}</h1>

        {/* Topics */}
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900">
            Topics{" "}
            {!loadingT && (
              <span className="ml-1 text-sm font-normal text-gray-400">
                ({topics.length})
              </span>
            )}
          </h2>

          {loadingT ? (
            <p className="mt-4 text-sm text-gray-400">Loading topics…</p>
          ) : topics.length === 0 ? (
            <p className="mt-4 text-sm text-gray-400">No topics found for this module.</p>
          ) : (
            <div className="mt-4 space-y-2">
              {topics.map((t) => (
                <div
                  key={t.id}
                  className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden"
                >
                  <button
                    onClick={() => setExpanded(expanded === t.id ? null : t.id)}
                    className="flex w-full items-center justify-between px-5 py-4 text-left"
                  >
                    <span className="font-medium text-gray-900">{t.name}</span>
                    <span className="ml-3 shrink-0 text-gray-400">
                      {expanded === t.id ? "▲" : "▼"}
                    </span>
                  </button>
                  {expanded === t.id && (
                    <div className="border-t border-gray-100 px-5 py-4">
                      <p className="text-sm text-gray-600 leading-relaxed">{t.description}</p>
                      <div className="mt-3 flex gap-3">
                        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
                          {t.difficulty}
                        </span>
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
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
            <h2 className="text-lg font-semibold text-gray-900">
              Related Articles{" "}
              <span className="ml-1 text-sm font-normal text-gray-400">({articles.length})</span>
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {articles.slice(0, 6).map((a) => (
                <a
                  key={a.url}
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all"
                >
                  <p className="font-medium text-gray-900 leading-snug line-clamp-2">{a.title}</p>
                  <p className="mt-2 text-xs text-gray-500 line-clamp-2">{a.description}</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {(a.tags ?? []).slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
