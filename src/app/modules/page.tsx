"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import Navbar from "@/components/Navbar";

interface Module {
  name: string;
  course: string | null;
  year: number | null;
}

export default function ModulesPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Module[]>("/modules")
      .then(setModules)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = modules.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      (m.course ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filtered.reduce<Record<string, Module[]>>((acc, m) => {
    const key = m.course ?? "Other";
    (acc[key] ??= []).push(m);
    return acc;
  }, {});

  return (
    <div className="relative min-h-screen">
      <div className="mesh-bg" />
      <div className="relative z-10">
        <Navbar />
        <main className="mx-auto max-w-5xl px-6 py-10">

          {/* Header */}
          <div className="fade-up">
            <span className="tag">Knowledge Graph</span>
            <h1 className="mt-4 text-3xl font-bold text-white">Course Modules</h1>
            <p className="mt-2 text-slate-400 text-sm">
              {modules.length} modules across{" "}
              {Object.keys(
                modules.reduce<Record<string, boolean>>((a, m) => { a[m.course ?? "Other"] = true; return a; }, {})
              ).length} courses
            </p>
          </div>

          {/* Search */}
          <div className="mt-6 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">⌕</span>
            <input
              type="text"
              placeholder="Search modules or courses…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {loading ? (
            <div className="mt-16 text-center text-slate-500 text-sm">Loading modules…</div>
          ) : Object.keys(grouped).length === 0 ? (
            <div className="mt-16 text-center text-slate-500 text-sm">No modules found.</div>
          ) : (
            <div className="mt-10 space-y-10">
              {Object.entries(grouped).map(([course, mods]) => (
                <div key={course}>
                  <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-indigo-400">
                    {course}
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {mods.map((m) => (
                      <Link
                        key={m.name}
                        href={`/modules/${encodeURIComponent(m.name)}`}
                        className="glass rounded-xl px-5 py-4 flex items-center justify-between transition-all duration-200 hover:border-indigo-500/30 hover:-translate-y-0.5"
                      >
                        <span className="text-sm font-medium text-white">{m.name}</span>
                        {m.year && (
                          <span className="ml-3 shrink-0 tag">Year {m.year}</span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
