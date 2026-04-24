"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const GRADES = ["A", "B", "C", "S", "F"];
const SUBJECTS = [
  "Physics", "Chemistry", "Biology", "Mathematics", "Combined Maths",
  "ICT", "Economics", "Accounting", "Business Studies", "Engineering Technology",
];
const INTEREST_OPTIONS = [
  "Software Engineering", "Data Science", "Networking", "Cybersecurity",
  "AI & Machine Learning", "Web Development", "Mobile Development", "Cloud Computing",
];

interface ALRow { subject: string; grade: string }

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "",
    career_goal: "", interests: [] as string[],
    al_results: [{ subject: SUBJECTS[0], grade: "A" }] as ALRow[],
  });

  const toggleInterest = (i: string) =>
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(i) ? f.interests.filter((x) => x !== i) : [...f.interests, i],
    }));

  const addAL = () => setForm((f) => ({ ...f, al_results: [...f.al_results, { subject: SUBJECTS[0], grade: "A" }] }));
  const removeAL = (idx: number) => setForm((f) => ({ ...f, al_results: f.al_results.filter((_, i) => i !== idx) }));
  const updateAL = (idx: number, key: keyof ALRow, val: string) =>
    setForm((f) => { const al = [...f.al_results]; al[idx] = { ...al[idx], [key]: val }; return { ...f, al_results: al }; });

  const submit = async (e: React.FormEvent) => {
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

  const STEP_LABELS = ["Basic info", "A/L results", "Interests"];

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
            {step === 1 && (
              <div className="space-y-4">
                {[
                  { label: "Full name", key: "name", type: "text", placeholder: "Kasun Perera" },
                  { label: "Email address", key: "email", type: "email", placeholder: "kasun@example.com" },
                  { label: "Password", key: "password", type: "password", placeholder: "Minimum 8 characters" },
                  { label: "Phone (optional)", key: "phone", type: "tel", placeholder: "077 123 4567" },
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

            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <label className="label">Career goal</label>
                  <input type="text" value={form.career_goal}
                    onChange={(e) => setForm({ ...form, career_goal: e.target.value })}
                    className="input-field" placeholder="e.g. Software Engineer, Data Scientist" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="label mb-0">A/L Results</label>
                    <button type="button" onClick={addAL}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                      + Add subject
                    </button>
                  </div>
                  <div className="space-y-2">
                    {form.al_results.map((row, idx) => (
                      <div key={idx} className="flex gap-2">
                        <select value={row.subject} onChange={(e) => updateAL(idx, "subject", e.target.value)}
                          className="input-field flex-1 py-2">
                          {SUBJECTS.map((s) => <option key={s} className="bg-[#0d1117]">{s}</option>)}
                        </select>
                        <select value={row.grade} onChange={(e) => updateAL(idx, "grade", e.target.value)}
                          className="input-field w-20 py-2">
                          {GRADES.map((g) => <option key={g} className="bg-[#0d1117]">{g}</option>)}
                        </select>
                        {form.al_results.length > 1 && (
                          <button type="button" onClick={() => removeAL(idx)}
                            className="text-slate-600 hover:text-red-400 px-2 transition-colors text-lg">×</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setStep(1)} className="btn-ghost flex-1 py-2.5">← Back</button>
                  <button type="button" onClick={() => setStep(3)} className="btn-primary flex-1 py-2.5">Continue →</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <label className="label">Select your interests</label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {INTEREST_OPTIONS.map((i) => (
                      <button key={i} type="button" onClick={() => toggleInterest(i)}
                        className={`rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-all ${
                          form.interests.includes(i)
                            ? "border-indigo-500/60 bg-indigo-500/10 text-indigo-300"
                            : "border-white/08 text-slate-400 hover:border-indigo-500/30 hover:text-slate-200"
                        }`} style={{ borderColor: form.interests.includes(i) ? undefined : "rgba(255,255,255,0.06)" }}>
                        {i}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setStep(2)} className="btn-ghost flex-1 py-2.5">← Back</button>
                  <button type="submit" disabled={loading} className="btn-primary flex-1 py-2.5">
                    {loading ? "Creating…" : "Create account"}
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
