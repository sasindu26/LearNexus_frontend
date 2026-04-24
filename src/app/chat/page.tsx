"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { logEvent } from "@/lib/engagement";
import Navbar from "@/components/Navbar";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
}

function getSessionId(): string {
  let sid = localStorage.getItem("ln_session");
  if (!sid) {
    sid = crypto.randomUUID();
    localStorage.setItem("ln_session", sid);
  }
  return sid;
}

export default function ChatPage() {
  const { profile, loading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm LearNexus AI, your academic advisor. Ask me anything about IT degree paths, modules, or career options in Sri Lanka!",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !profile) router.replace("/login");
  }, [loading, profile, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setSending(true);
    logEvent("chat_message");
    try {
      const res = await api.post<{ message: string; sources: string[]; session_id: string }>(
        "/chat",
        { message: text, session_id: getSessionId() }
      );
      setMessages((m) => [
        ...m,
        { role: "assistant", content: res.message, sources: res.sources },
      ]);
    } catch (err: unknown) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            err instanceof Error ? err.message : "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  if (loading || !profile) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="mesh-bg" />
        <div className="relative z-10 text-slate-400 text-sm">Loading…</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <div className="mesh-bg" />
      <div className="relative z-10 flex flex-col" style={{ minHeight: "100vh" }}>
        <Navbar />
        <div className="flex flex-1 flex-col" style={{ height: "calc(100vh - 57px)" }}>

          {/* Header */}
          <div className="border-b border-white/[0.06] bg-[#080c14]/80 backdrop-blur-xl px-6 py-4">
            <div className="mx-auto max-w-2xl flex items-center justify-between">
              <div>
                <h1 className="text-base font-semibold text-white">AI Advisor</h1>
                <p className="text-xs text-slate-500">Powered by Gemini · Knowledge graph grounded</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-slate-500">Online</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="mx-auto max-w-2xl space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="mr-3 mt-1 flex-shrink-0 h-7 w-7 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                      <span className="text-xs font-bold text-white">AI</span>
                    </div>
                  )}
                  <div className={msg.role === "user" ? "bubble-user" : "bubble-ai"}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1 border-t border-white/10 pt-2">
                        <span className="text-xs text-slate-500">Sources: </span>
                        {msg.sources.slice(0, 3).map((s) => (
                          <span key={s} className="tag">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {sending && (
                <div className="flex justify-start">
                  <div className="mr-3 mt-1 flex-shrink-0 h-7 w-7 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">AI</span>
                  </div>
                  <div className="bubble-ai">
                    <span className="flex gap-1 items-center py-0.5">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </div>

          {/* Input */}
          <div className="border-t border-white/[0.06] bg-[#080c14]/80 backdrop-blur-xl px-4 py-4">
            <div className="mx-auto flex max-w-2xl gap-3 items-end">
              <textarea
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKey}
                placeholder="Ask about modules, careers, or anything study-related…"
                className="input-field flex-1 resize-none py-3"
                style={{ minHeight: "44px", maxHeight: "120px" }}
              />
              <button
                onClick={send}
                disabled={!input.trim() || sending}
                className="btn-primary px-5 py-3 text-sm shrink-0"
                style={{ borderRadius: "0.75rem" }}
              >
                Send
              </button>
            </div>
            <p className="mt-2 text-center text-xs text-slate-600">
              Press Enter to send · Shift+Enter for new line
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
