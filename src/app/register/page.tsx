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
      interests: f.interests.includes(i)
        ? f.interests.filter((x) => x !== i)
        : [...f.interests, i],
    }));

  const addAL = () =>
    setForm((f) => ({ ...f, al_results: [...f.al_results, { subject: SUBJECTS[0], grade: "A" }] }));

  const removeAL = (idx: number) =>
    setForm((f) => ({ ...f, al_results: f.al_results.filter((_, i) => i !== idx) }));

  const updateAL = (idx: number, key: keyof ALRow, val: string) =>
    setForm((f) => {
      const al = [...f.al_results];
      al[idx] = { ...al[idx], [key]: val };
      return { ...f, al_results: al };
    });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post<{ token: string }>("/auth/register", form);
      await login(res.token);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl bg-white p-10 shadow-sm border border-gray-200">
        <Link href="/" className="text-xl font-bold text-indigo-600">LearNexus</Link>
        <h1 className="mt-6 text-2xl font-bold text-gray-900">Create your account</h1>

        {/* Step indicator */}
        <div className="mt-4 flex gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                s <= step ? "bg-indigo-600" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={submit}>
          {/* Step 1: Basic info */}
          {step === 1 && (
            <div className="mt-6 space-y-4">
              <p className="text-sm font-medium text-gray-500">Step 1 of 3 — Basic info</p>
              {[
                { label: "Full name", key: "name", type: "text", placeholder: "Kasun Perera" },
                { label: "Email", key: "email", type: "email", placeholder: "kasun@example.com" },
                { label: "Password", key: "password", type: "password", placeholder: "min 8 characters" },
                { label: "Phone (optional)", key: "phone", type: "tel", placeholder: "077 123 4567" },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
                  <input
                    type={type}
                    required={key !== "phone"}
                    value={(form as Record<string, unknown>)[key] as string}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
                    placeholder={placeholder}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!form.name || !form.email || !form.password}
                className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                Next →
              </button>
            </div>
          )}

          {/* Step 2: A/L results + career goal */}
          {step === 2 && (
            <div className="mt-6 space-y-4">
              <p className="text-sm font-medium text-gray-500">Step 2 of 3 — A/L results & goal</p>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Career goal</label>
                <input
                  type="text"
                  value={form.career_goal}
                  onChange={(e) => setForm({ ...form, career_goal: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
                  placeholder="e.g. Software Engineer, Data Scientist"
                />
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">A/L Results</label>
                  <button
                    type="button"
                    onClick={addAL}
                    className="text-xs font-medium text-indigo-600 hover:underline"
                  >
                    + Add subject
                  </button>
                </div>
                <div className="space-y-2">
                  {form.al_results.map((row, idx) => (
                    <div key={idx} className="flex gap-2">
                      <select
                        value={row.subject}
                        onChange={(e) => updateAL(idx, "subject", e.target.value)}
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 transition"
                      >
                        {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                      </select>
                      <select
                        value={row.grade}
                        onChange={(e) => updateAL(idx, "grade", e.target.value)}
                        className="w-20 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 transition"
                      >
                        {GRADES.map((g) => <option key={g}>{g}</option>)}
                      </select>
                      {form.al_results.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeAL(idx)}
                          className="px-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Interests */}
          {step === 3 && (
            <div className="mt-6 space-y-4">
              <p className="text-sm font-medium text-gray-500">Step 3 of 3 — Your interests</p>
              <label className="block text-sm font-medium text-gray-700">
                Select all that interest you
              </label>
              <div className="grid grid-cols-2 gap-2">
                {INTEREST_OPTIONS.map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleInterest(i)}
                    className={`rounded-lg border px-3 py-2 text-left text-sm font-medium transition-colors ${
                      form.interests.includes(i)
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "border-gray-200 text-gray-600 hover:border-indigo-300"
                    }`}
                  >
                    {i}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors"
                >
                  {loading ? "Creating…" : "Create account"}
                </button>
              </div>
            </div>
          )}
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-indigo-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
