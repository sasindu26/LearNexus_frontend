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
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-900">Course Modules</h1>
        <p className="mt-2 text-gray-500">
          {modules.length} modules across {Object.keys(grouped).length} courses
        </p>

        <input
          type="text"
          placeholder="Search modules or courses…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-6 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
        />

        {loading ? (
          <div className="mt-12 text-center text-gray-400">Loading modules…</div>
        ) : (
          <div className="mt-8 space-y-10">
            {Object.entries(grouped).map(([course, mods]) => (
              <div key={course}>
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-indigo-500">
                  {course}
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {mods.map((m) => (
                    <Link
                      key={m.name}
                      href={`/modules/${encodeURIComponent(m.name)}`}
                      className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all"
                    >
                      <span className="font-medium text-gray-900">{m.name}</span>
                      {m.year && (
                        <span className="ml-2 shrink-0 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600">
                          Year {m.year}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
