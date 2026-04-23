import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 px-6 py-28 text-center text-white">
          <span className="mb-4 inline-block rounded-full bg-white/20 px-4 py-1 text-sm font-medium">
            Built for Sri Lankan A/L students
          </span>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            Find your IT degree path<br />with AI guidance
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-indigo-100">
            LearNexus maps your A/L results, interests, and career goals to the
            right university course — then walks you through every module with an
            AI advisor.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/register"
              className="rounded-full bg-white px-8 py-3 font-semibold text-indigo-700 shadow hover:bg-indigo-50 transition-colors"
            >
              Get started — it's free
            </Link>
            <Link
              href="/modules"
              className="rounded-full border border-white/40 px-8 py-3 font-medium text-white hover:bg-white/10 transition-colors"
            >
              Browse modules
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-center text-2xl font-bold text-gray-900">
            Everything you need to choose right
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {[
              {
                icon: "🧠",
                title: "Knowledge Graph",
                body: "7,000+ nodes — courses, modules, topics, and resources — all linked and searchable.",
              },
              {
                icon: "💬",
                title: "AI Advisor",
                body: "Ask anything about degree paths, module content, or career prospects. Powered by Gemini.",
              },
              {
                icon: "📈",
                title: "Progress Tracking",
                body: "Mark modules complete and watch your course completion percentage climb.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
              >
                <div className="text-4xl">{f.icon}</div>
                <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-indigo-50 px-6 py-20 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Ready to start?</h2>
          <p className="mt-3 text-gray-600">
            Create a free account and get your personalised degree roadmap in minutes.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-block rounded-full bg-indigo-600 px-8 py-3 font-semibold text-white shadow hover:bg-indigo-700 transition-colors"
          >
            Create account
          </Link>
        </section>
      </main>
    </>
  );
}
