"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const AL_STREAMS = [
  { id: "Physical Science",   label: "Physical Science",    subjects: "Combined Maths · Physics · Chemistry",               icon: "⚛" },
  { id: "Biological Science", label: "Biological Science",  subjects: "Biology · Chemistry · Physics",                      icon: "🧬" },
  { id: "Technology",         label: "Technology",          subjects: "Engineering Technology · ICT · Science for Tech",    icon: "⚙" },
  { id: "Commerce",           label: "Commerce",            subjects: "Accounting · Business Studies · Economics",          icon: "📈" },
  { id: "Arts",               label: "Arts",                subjects: "Art · Geography · History · Languages…",             icon: "🎭" },
  { id: "Other",              label: "Other / Not sat yet", subjects: "I'll fill this in later",                            icon: "◎" },
];

const INTERESTS = [
  "Software & Apps", "Data & Analytics", "Networking & Infrastructure",
  "Cybersecurity", "AI & Machine Learning", "Web Development",
  "Mobile Development", "Cloud & DevOps", "Game Development", "UI / UX Design",
];

const STRENGTHS = [
  "Mathematics & Logic", "Problem Solving", "Creative Thinking",
  "Science & Research", "Communication", "Teamwork & Leadership",
  "Attention to Detail", "Fast Learner", "Drawing & Design", "Writing",
];

function ToggleChip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border px-3 py-2.5 text-sm font-medium text-left transition-all duration-200"
      style={{
        borderColor: selected ? "rgba(99,102,241,0.6)" : "rgba(255,255,255,0.06)",
        background: selected ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.02)",
        color: selected ? "#a5b4fc" : "#94a3b8",
      }}
    >
      {label}
    </button>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "",
    al_stream: "",
    interests: [] as string[],
    strengths: [] as string[],
  });

  const toggle = (field: "interests" | "strengths", val: string) =>
    setForm((f) => ({
      ...f,
      [field]: f[field].includes(val) ? f[field].filter((x) => x !== val) : [...f[field], val],
    }));

  const submit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await api.post<{ token: string }>("/auth/register", form);
      await login(res.token);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
      setStep(1);
    } finally { setLoading(false); }
  };

  const STEP_LABELS = ["Basic info", "A/L Stream", "About you"];

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
      <div className="mesh-bg" />
      <div className="relative z-10 w-full max-w-lg fade-up">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <span className="text-sm font-bold text-white">LN</span>
            </div>
            <span className="font-bold text-white text-lg">LearNexus</span>
          </Link>
          <h1 className="text-3xl font-bold text-white">Create your account</h1>
          <p className="mt-2 text-slate-400 text-sm">Step {step} of 3 — {STEP_LABELS[step - 1]}</p>
        </div>

        {/* Step indicator */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-500 ${
              s < step ? "bg-indigo-500" : s === step ? "bg-gradient-to-r from-indigo-500 to-violet-500" : "bg-white/10"
            }`} />
          ))}
        </div>

        <div className="glass rounded-2xl p-8">
          {error && (
            <div className="mb-5 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">{error}</div>
          )}

          <form onSubmit={submit}>

            {/* ── Step 1: Basic info ── */}
            {step === 1 && (
              <div className="space-y-4">
                {[
                  { label: "Full name",       key: "name",     type: "text",     placeholder: "Kasun Perera" },
                  { label: "Email address",   key: "email",    type: "email",    placeholder: "kasun@example.com" },
                  { label: "Password",        key: "password", type: "password", placeholder: "Minimum 8 characters" },
                  { label: "Phone (optional)",key: "phone",    type: "tel",      placeholder: "077 123 4567" },
                ].map(({ label, key, type, placeholder }) => (
                  <div key={key}>
                    <label className="label">{label}</label>
                    <input
                      type={type}
                      required={key !== "phone"}
                      value={(form as Record<string, unknown>)[key] as string}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="input-field"
                      placeholder={placeholder}
                    />
                  </div>
                ))}
                <button type="button" onClick={() => setStep(2)}
                  disabled={!form.name || !form.email || !form.password}
                  className="btn-primary w-full py-3 mt-2">
                  Continue →
                </button>
              </div>
            )}

            {/* ── Step 2: A/L Stream ── */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <label className="label mb-3 block">Which A/L stream did you study?</label>
                  <div className="space-y-2">
                    {AL_STREAMS.map((s) => {
                      const selected = form.al_stream === s.id;
                      return (
                        <button key={s.id} type="button"
                          onClick={() => setForm({ ...form, al_stream: s.id })}
                          className="w-full flex items-center gap-4 rounded-xl border px-4 py-3.5 text-left transition-all duration-200"
                          style={{
                            borderColor: selected ? "rgba(99,102,241,0.6)" : "rgba(255,255,255,0.06)",
                            background: selected ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.02)",
                          }}>
                          <span className="text-xl shrink-0">{s.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold ${selected ? "text-indigo-300" : "text-white"}`}>{s.label}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{s.subjects}</p>
                          </div>
                          {selected && (
                            <span className="shrink-0 h-5 w-5 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs">✓</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setStep(1)} className="btn-ghost flex-1 py-2.5">← Back</button>
                  <button type="button" onClick={() => setStep(3)}
                    disabled={!form.al_stream}
                    className="btn-primary flex-1 py-2.5">Continue →</button>
                </div>
              </div>
            )}

            {/* ── Step 3: Interests + Strengths ── */}
            {step === 3 && (
              <div className="space-y-6">

                <div>
                  <p className="text-white text-sm font-semibold mb-1">What topics do you enjoy?</p>
                  <p className="text-slate-500 text-xs mb-3">Pick everything that sounds interesting to you.</p>
                  <div className="grid grid-cols-2 gap-2">
                    {INTERESTS.map((i) => (
                      <ToggleChip key={i} label={i}
                        selected={form.interests.includes(i)}
                        onClick={() => toggle("interests", i)} />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-white text-sm font-semibold mb-1">What are you good at?</p>
                  <p className="text-slate-500 text-xs mb-3">Be honest — the AI will use this to guide you.</p>
                  <div className="grid grid-cols-2 gap-2">
                    {STRENGTHS.map((s) => (
                      <ToggleChip key={s} label={s}
                        selected={form.strengths.includes(s)}
                        onClick={() => toggle("strengths", s)} />
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setStep(2)} className="btn-ghost flex-1 py-2.5">← Back</button>
                  <button type="submit" disabled={loading} className="btn-primary flex-1 py-2.5">
                    {loading ? "Creating…" : "Find my path →"}
                  </button>
                </div>
              </div>
            )}

          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
