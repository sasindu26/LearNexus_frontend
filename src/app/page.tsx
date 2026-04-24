import Link from "next/link";
import Navbar from "@/components/Navbar";

const FEATURES = [
  {
    icon: "⬡",
    title: "Knowledge Graph",
    body: "7,000+ interconnected nodes — courses, modules, topics and resources — all semantically linked and searchable.",
    glow: "rgba(99,102,241,0.15)",
  },
  {
    icon: "✦",
    title: "Gemini AI Advisor",
    body: "Ask anything. The RAG-powered chatbot pulls context from the knowledge graph and your profile to give precise answers.",
    glow: "rgba(139,92,246,0.15)",
  },
  {
    icon: "◈",
    title: "Progress Tracking",
    body: "Mark modules complete, watch your engagement score climb, and receive personalised nudges when you go quiet.",
    glow: "rgba(59,130,246,0.15)",
  },
  {
    icon: "◉",
    title: "Career Roadmap",
    body: "Semantic matching maps your interests and course to 10 real IT job roles with required-vs-completed module breakdowns.",
    glow: "rgba(16,185,129,0.15)",
  },
  {
    icon: "◎",
    title: "Parent Summaries",
    body: "Weekly AI-written progress reports sent to parents via WhatsApp or email — with full consent management.",
    glow: "rgba(245,158,11,0.15)",
  },
  {
    icon: "⬙",
    title: "Anti-Abandonment Engine",
    body: "Daily cron scores every student. Those going quiet get a personalised email nudge before they drop off.",
    glow: "rgba(239,68,68,0.15)",
  },
];

const STATS = [
  { value: "7,500+", label: "Graph nodes" },
  { value: "90+", label: "Modules" },
  { value: "135+", label: "Articles" },
  { value: "Gemini", label: "AI model" },
];

export default function Home() {
  return (
    <div className="relative min-h-screen">
      <div className="mesh-bg" />
      <div className="relative z-10">
        <Navbar />

        {/* Hero */}
        <section className="mx-auto max-w-5xl px-6 pt-24 pb-20 text-center">
          <div className="fade-up">
            <span className="tag mb-6 inline-flex">
              Built for Sri Lankan A/L students
            </span>
            <h1 className="mt-4 text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
              Find your{" "}
              <span className="grad-text">IT degree path</span>
              <br />
              with AI guidance
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400 leading-relaxed">
              LearNexus maps your A/L results, interests, and career goals to the
              right university course — then walks you through every module with a
              Gemini-powered AI advisor.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/register" className="btn-primary pulse-glow text-base px-8 py-3">
                Get started — it&apos;s free
              </Link>
              <Link href="/modules" className="btn-ghost text-base px-8 py-3">
                Browse modules →
              </Link>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-20 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="glass rounded-2xl py-5">
                <p className="text-2xl font-bold grad-text">{s.value}</p>
                <p className="mt-1 text-xs text-slate-500 uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-500">
            Platform features
          </p>
          <h2 className="mt-3 text-center text-3xl font-bold text-white">
            Everything you need to choose right
          </h2>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="glass rounded-2xl p-6 transition-all duration-300 hover:border-indigo-500/30 hover:-translate-y-1"
                style={{ boxShadow: `inset 0 0 30px ${f.glow}` }}
              >
                <span className="text-2xl font-bold grad-text">{f.icon}</span>
                <h3 className="mt-4 text-base font-semibold text-white">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-4xl px-6 py-20">
          <h2 className="text-center text-3xl font-bold text-white">How it works</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              { step: "01", title: "Register", body: "Enter your A/L results, career goal, and interests in 3 quick steps." },
              { step: "02", title: "Get matched", body: "The AI maps you to the best IT course and shows your career roadmap." },
              { step: "03", title: "Learn with AI", body: "Chat with the advisor, complete modules, and track your progress." },
            ].map((s) => (
              <div key={s.step} className="relative glass rounded-2xl p-6">
                <p className="text-5xl font-black text-white/5 absolute top-4 right-5">{s.step}</p>
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">{s.step}</p>
                <h3 className="mt-3 text-lg font-semibold text-white">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-3xl px-6 py-20 text-center">
          <div className="glass rounded-3xl p-12" style={{ boxShadow: "inset 0 0 60px rgba(99,102,241,0.1)" }}>
            <h2 className="text-3xl font-bold text-white">Ready to start?</h2>
            <p className="mt-3 text-slate-400">
              Create a free account and get your personalised degree roadmap in minutes.
            </p>
            <Link href="/register" className="btn-primary mt-8 inline-block text-base px-10 py-3.5">
              Create account — free forever
            </Link>
          </div>
        </section>

        <footer className="border-t border-white/[0.06] py-8 text-center text-xs text-slate-600">
          © 2026 LearNexus · Built for PUSL3190 · Powered by Neo4j + Gemini
        </footer>
      </div>
    </div>
  );
}
