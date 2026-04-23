"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { logEvent } from "@/lib/engagement";
import Navbar from "@/components/Navbar";
import clsx from "clsx";

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
        "Hi! I'm LearNexus AI, your academic advisor. Ask me anything about IT degree paths, modules, or career options in Sri Lanka! 👋",
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
    return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading…</div>;
  }

  return (
    <>
      <Navbar />
      <div className="flex h-[calc(100vh-57px)] flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white px-6 py-4">
          <h1 className="text-lg font-semibold text-gray-900">AI Advisor</h1>
          <p className="text-xs text-gray-400">Powered by Gemini · Knowledge graph grounded</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          <div className="mx-auto max-w-2xl space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={clsx("flex", msg.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={clsx(
                    "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-br-sm"
                      : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm"
                  )}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1 border-t border-gray-100 pt-2">
                      <span className="text-xs text-gray-400">Sources: </span>
                      {msg.sources.slice(0, 3).map((s) => (
                        <span
                          key={s}
                          className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-600"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {sending && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm border border-gray-200 bg-white px-4 py-3 shadow-sm">
                  <span className="flex gap-1">
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
        <div className="border-t border-gray-200 bg-white px-4 py-4">
          <div className="mx-auto flex max-w-2xl gap-3">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="Ask about modules, careers, or anything study-related…"
              className="flex-1 resize-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
            />
            <button
              onClick={send}
              disabled={!input.trim() || sending}
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              Send
            </button>
          </div>
          <p className="mt-2 text-center text-xs text-gray-400">Press Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </>
  );
}
