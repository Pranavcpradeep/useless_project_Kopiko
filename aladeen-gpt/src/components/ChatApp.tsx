"use client";

import { useEffect, useRef, useState } from "react";
import LoadingOverlay from "@/components/LoadingOverlay";
import MoodMeter from "@/components/MoodMeter";
import { randomLoadingDelayMs } from "@/lib/alladeen";

type Message = {
  id: string | number;
  role: "user" | "assistant";
  content: string;
};

type Profile = {
  nickname: string | null;
  moodLevel: number;
  moodTitle: string;
  moodColor: string;
  messageCount: number;
  patience: number;
};

const SESSION_KEY = "alladeengpt-session-id";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(SESSION_KEY);
  if (!id) {
    id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `citizen-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

const GREETING: Message = {
  id: "greeting",
  role: "assistant",
  content:
    "I am AlladeenGPT, digital vessel of Admiral General Aladeen. Ask me something. I will not help. Yes, this is on purpose.",
};

export default function ChatApp() {
  const [sessionId, setSessionId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [profile, setProfile] = useState<Profile>({
    nickname: null,
    moodLevel: 0,
    moodTitle: "Mildly Tolerant",
    moodColor: "#facc15",
    messageCount: 0,
    patience: 100,
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingDuration, setLoadingDuration] = useState(12000);
  const [booted, setBooted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = getSessionId();
    setSessionId(id);
    fetch(`/api/chat?sessionId=${encodeURIComponent(id)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.messages?.length) {
          setMessages([
            GREETING,
            ...data.messages.map((m: { id: number; role: string; content: string }) => ({
              id: m.id,
              role: m.role,
              content: m.content,
            })),
          ]);
        }
        if (data?.profile) setProfile(data.profile);
      })
      .catch(() => {
        /* Alladeen doesn't care about your network errors either */
      })
      .finally(() => setBooted(true));
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed || loading || !sessionId) return;

    setError(null);
    const userMsg: Message = { id: `local-${Date.now()}`, role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    const delay = randomLoadingDelayMs();
    setLoadingDuration(delay);

    const startedAt = Date.now();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message: trimmed }),
      });
      const data = await res.json();

      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, delay - elapsed);
      await new Promise((resolve) => setTimeout(resolve, remaining));

      if (!res.ok) {
        setError(data?.error ?? "The regime rejected your request.");
        setMessages((prev) => [
          ...prev,
          { id: `err-${Date.now()}`, role: "assistant", content: "Error. Which is somehow still more useful than my usual answers." },
        ]);
      } else {
        setMessages((prev) => [...prev, { id: `reply-${Date.now()}`, role: "assistant", content: data.reply }]);
        if (data.profile) setProfile(data.profile);
      }
    } catch {
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, delay - elapsed);
      await new Promise((resolve) => setTimeout(resolve, remaining));
      setMessages((prev) => [
        ...prev,
        { id: `err-${Date.now()}`, role: "assistant", content: "The network failed you. I remain unfazed and unhelpful." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function resetSession() {
    if (!sessionId || loading) return;
    setLoading(false);
    await fetch(`/api/chat?sessionId=${encodeURIComponent(sessionId)}`, { method: "DELETE" }).catch(() => {});
    setMessages([GREETING, { id: "reset", role: "assistant", content: "Your file has been shredded. He remains suspicious of you." }]);
    setProfile({
      nickname: null,
      moodLevel: 0,
      moodTitle: "Mildly Tolerant",
      moodColor: "#facc15",
      messageCount: 0,
      patience: 100,
    });
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-4 px-4 py-6 sm:py-10">
      <header className="text-center">
        <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full border-4 border-[#d4af37] bg-[#3b0a0a] text-3xl shadow-[0_0_25px_rgba(212,175,55,0.4)]">
          ⭐
        </div>
        <h1 className="m-0 text-4xl font-black tracking-tight text-[#f4e7c1] sm:text-5xl" style={{ fontFamily: "Georgia, serif" }}>
          ALLADEEN<span className="text-[#d4af37]">GPT</span>
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-[#f4e7c1]/70">
          The Official AI of the Supreme Leader. It will not help you. That is not a bug — it is
          policy.
        </p>
      </header>

      <MoodMeter
        moodTitle={profile.moodTitle}
        moodColor={profile.moodColor}
        patience={profile.patience}
        nickname={profile.nickname}
      />

      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto rounded-2xl border border-[#d4af37]/30 bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.08),_transparent_60%)] bg-[#1b0303] p-4 shadow-inner"
        style={{ minHeight: "40vh", maxHeight: "55vh" }}
      >
        {!booted && <p className="text-center text-sm text-[#f4e7c1]/50">Requesting audience with the Supreme Leader...</p>}

        {messages.map((m) => (
          <div key={m.id} className={`flex items-start gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-lg ${
                m.role === "user" ? "border-[#f4e7c1] bg-[#0f2f1c]" : "border-[#d4af37] bg-[#3b0a0a]"
              }`}
            >
              {m.role === "user" ? "🫡" : "🎖️"}
            </div>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-lg sm:text-base ${
                m.role === "user"
                  ? "rounded-tr-sm border border-[#f4e7c1]/30 bg-[#123722] text-[#f4e7c1]"
                  : "rounded-tl-sm border border-[#d4af37]/40 bg-[#2a0606] text-[#f4e7c1]"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && <LoadingOverlay durationMs={loadingDuration} />}
      </div>

      {error && <p className="text-center text-xs text-red-400">{error}</p>}

      <form
        className="flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something. It will not matter."
          disabled={loading}
          maxLength={1000}
          className="flex-1 rounded-xl border border-[#d4af37]/50 bg-black/40 px-4 py-3 text-[#f4e7c1] placeholder:text-[#f4e7c1]/40 focus:border-[#d4af37] focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded-xl border-2 border-[#d4af37] bg-gradient-to-b from-[#7a0f0f] to-[#4a0a0a] px-6 py-3 font-bold uppercase tracking-wide text-[#f4e7c1] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Waiting..." : "Submit to the Regime"}
        </button>
      </form>

      <div className="flex items-center justify-between text-xs text-[#f4e7c1]/50">
        <span>
          Messages sent: {profile.messageCount} · Mood level: {profile.moodLevel}
        </span>
        <button
          type="button"
          onClick={resetSession}
          className="underline decoration-dotted underline-offset-2 hover:text-[#f4e7c1]"
        >
          Shred my file &amp; start over
        </button>
      </div>

      <footer className="pt-4 text-center text-[10px] uppercase tracking-[0.2em] text-[#f4e7c1]/30">
        AlladeenGPT · Guaranteed 0% Helpful · Inspired by The Dictator (2012)
      </footer>
    </div>
  );
}
