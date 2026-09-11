"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  mood?: string;
};

type Mood =
  | "ENRAGED_DICTATOR"
  | "SMUG_SUPERIOR"
  | "CONDESCENDING_PROFESSOR"
  | "DRAMATIC_VILLAIN"
  | "SARCASTIC_EMPEROR"
  | "DELUSIONAL_GENIUS"
  | "PETTY_TYRANT"
  | "THEATRICAL_OVERLORD";

const MOOD_CONFIG: Record<
  Mood,
  { label: string; emoji: string; color: string; bg: string }
> = {
  ENRAGED_DICTATOR: {
    label: "ENRAGED",
    emoji: "😤",
    color: "#ff4444",
    bg: "rgba(255,68,68,0.15)",
  },
  SMUG_SUPERIOR: {
    label: "SMUG",
    emoji: "😏",
    color: "#d4af37",
    bg: "rgba(212,175,55,0.15)",
  },
  CONDESCENDING_PROFESSOR: {
    label: "CONDESCENDING",
    emoji: "🧐",
    color: "#9b59b6",
    bg: "rgba(155,89,182,0.15)",
  },
  DRAMATIC_VILLAIN: {
    label: "DRAMATIC",
    emoji: "🎭",
    color: "#e74c3c",
    bg: "rgba(231,76,60,0.15)",
  },
  SARCASTIC_EMPEROR: {
    label: "SARCASTIC",
    emoji: "🙄",
    color: "#f39c12",
    bg: "rgba(243,156,18,0.15)",
  },
  DELUSIONAL_GENIUS: {
    label: "DELUSIONAL",
    emoji: "🤪",
    color: "#00bcd4",
    bg: "rgba(0,188,212,0.15)",
  },
  PETTY_TYRANT: {
    label: "PETTY",
    emoji: "😤",
    color: "#e91e63",
    bg: "rgba(233,30,99,0.15)",
  },
  THEATRICAL_OVERLORD: {
    label: "THEATRICAL",
    emoji: "👑",
    color: "#ffd700",
    bg: "rgba(255,215,0,0.15)",
  },
};

const SUGGESTED_QUESTIONS = [
  "What is the capital of France?",
  "How do airplanes fly?",
  "Who invented the internet?",
  "What is 2+2?",
  "Is the earth round?",
  "Who was the first man on the moon?",
];

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem("aladeen_session");
  if (!id) {
    id = uuidv4();
    sessionStorage.setItem("aladeen_session", id);
  }
  return id;
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 animate-fade-in-up">
      <div className="w-8 h-8 rounded-full overflow-hidden border-2 flex-shrink-0" style={{ borderColor: "#d4af37" }}>
        <Image src="/aladeen.png" alt="Aladeen" width={32} height={32} className="object-cover" />
      </div>
      <div
        className="px-5 py-4 rounded-2xl rounded-bl-none"
        style={{
          background: "linear-gradient(135deg, #1a0d00 0%, #2d1a00 100%)",
          border: "1px solid #d4af3755",
        }}
      >
        <div className="flex gap-1.5 items-center">
          <div className="w-2 h-2 rounded-full bg-yellow-400 typing-dot" />
          <div className="w-2 h-2 rounded-full bg-yellow-400 typing-dot" />
          <div className="w-2 h-2 rounded-full bg-yellow-400 typing-dot" />
          <span className="text-yellow-600 text-xs ml-2 italic">
            Aladeen is composing his magnificence...
          </span>
        </div>
      </div>
    </div>
  );
}

function MoodBadge({ mood, isNew }: { mood: Mood; isNew?: boolean }) {
  const config = MOOD_CONFIG[mood] || MOOD_CONFIG.SMUG_SUPERIOR;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${isNew ? "animate-mood" : ""}`}
      style={{
        background: config.bg,
        color: config.color,
        border: `1px solid ${config.color}44`,
      }}
    >
      {config.emoji} {config.label}
    </span>
  );
}

export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentMood, setCurrentMood] = useState<Mood>("SMUG_SUPERIOR");
  const [showIntro, setShowIntro] = useState(true);
  const [sessionId, setSessionId] = useState<string>("");
  const [lastMoodNew, setLastMoodNew] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setSessionId(getSessionId());
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  const sendMessage = useCallback(
    async (text?: string) => {
      const messageText = text || input.trim();
      if (!messageText || isLoading || !sessionId) return;

      const userMsg: Message = {
        id: uuidv4(),
        role: "user",
        content: messageText,
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsLoading(true);
      setShowIntro(false);
      setLastMoodNew(false);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: messageText, sessionId }),
        });

        const data = await res.json();
        const newMood = (data.mood as Mood) || "SMUG_SUPERIOR";

        setCurrentMood(newMood);
        setLastMoodNew(true);

        const assistantMsg: Message = {
          id: uuidv4(),
          role: "assistant",
          content: data.reply || "Aladeen is temporarily ruling elsewhere.",
          mood: newMood,
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } catch {
        const errorMsg: Message = {
          id: uuidv4(),
          role: "assistant",
          content:
            "My internet was cut by Wadiya's enemies. They will be executed. Try again, you persistent little ant.",
          mood: "ENRAGED_DICTATOR",
        };
        setMessages((prev) => [...prev, errorMsg]);
        setCurrentMood("ENRAGED_DICTATOR");
      } finally {
        setIsLoading(false);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    },
    [input, isLoading, sessionId]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setShowIntro(true);
    setCurrentMood("SMUG_SUPERIOR");
    const newId = uuidv4();
    sessionStorage.setItem("aladeen_session", newId);
    setSessionId(newId);
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          "radial-gradient(ellipse at top, #1a0800 0%, #0d0400 40%, #000000 100%)",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Decorative top border */}
      <div
        className="h-1 w-full"
        style={{
          background:
            "linear-gradient(90deg, #8b6914, #ffd700, #d4af37, #ffd700, #8b6914)",
        }}
      />

      {/* Header */}
      <header className="relative overflow-hidden" style={{ background: "linear-gradient(180deg, #1a0800 0%, #0d0400 100%)" }}>
        {/* Ornamental background pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, #d4af37 0px, #d4af37 1px, transparent 1px, transparent 20px),
                              repeating-linear-gradient(-45deg, #d4af37 0px, #d4af37 1px, transparent 1px, transparent 20px)`,
          }}
        />

        <div className="relative max-w-4xl mx-auto px-4 py-6">
          <div className="flex flex-col items-center text-center gap-4">
            {/* Crown & Title */}
            <div className="animate-crown text-4xl select-none">👑</div>

            {/* Photo + Title row */}
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Aladeen Photo */}
              <div className="relative flex-shrink-0">
                <div
                  className="animate-pulse-gold w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden"
                  style={{
                    border: "3px solid #d4af37",
                    boxShadow: "0 0 30px #d4af3766",
                  }}
                >
                  <Image
                    src="/aladeen.png"
                    alt="Admiral General Aladeen"
                    width={144}
                    height={144}
                    className="w-full h-full object-cover object-top"
                    priority
                  />
                </div>
                {/* Rank badge */}
                <div
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-black whitespace-nowrap"
                  style={{
                    background: "linear-gradient(90deg, #8b6914, #ffd700, #8b6914)",
                    color: "#0d0400",
                    boxShadow: "0 2px 8px #d4af3766",
                  }}
                >
                  ★ SUPREME LEADER ★
                </div>
              </div>

              {/* Title text */}
              <div className="text-left sm:text-left">
                <h1
                  className="text-4xl sm:text-5xl font-black tracking-tight gold-shimmer"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  AlladeenGPT
                </h1>
                <p
                  className="text-sm sm:text-base font-semibold mt-1"
                  style={{ color: "#d4af37cc" }}
                >
                  Admiral General Aladeen &bull; Supreme Leader of Wadiya
                </p>
                <p className="text-xs sm:text-sm mt-2 max-w-sm" style={{ color: "#8b6914cc" }}>
                  World&apos;s greatest AI dictator. Inventor of 97% of all human knowledge.
                  Winner of 97 Olympic gold medals. Humbly magnificent.
                </p>
              </div>
            </div>

            {/* Mood display */}
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-widest" style={{ color: "#8b6914" }}>
                Current Mood:
              </span>
              <MoodBadge mood={currentMood} isNew={lastMoodNew} />
            </div>

            {/* Stats banner */}
            <div
              className="w-full max-w-2xl grid grid-cols-3 gap-1 rounded-xl p-3"
              style={{
                background: "rgba(212,175,55,0.06)",
                border: "1px solid #d4af3722",
              }}
            >
              {[
                { label: "IQ", value: "178 *" },
                { label: "Gold Medals", value: "97" },
                { label: "Inventions", value: "97%" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div
                    className="text-xl font-black"
                    style={{ color: "#ffd700" }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-xs uppercase tracking-wider" style={{ color: "#8b6914" }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs italic" style={{ color: "#4a3000" }}>
              * Self-measured. Science confirms.
            </p>
          </div>
        </div>

        {/* Bottom border */}
        <div
          className="h-px w-full"
          style={{
            background: "linear-gradient(90deg, transparent, #d4af37, transparent)",
          }}
        />
      </header>

      {/* Chat Area */}
      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 py-4">
        <div
          className="flex-1 rounded-2xl flex flex-col overflow-hidden"
          style={{
            background: "rgba(10,5,0,0.8)",
            border: "1px solid #d4af3733",
            minHeight: "400px",
            maxHeight: "calc(100vh - 420px)",
          }}
        >
          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-wadiya"
            style={{ minHeight: "300px" }}
          >
            {showIntro && messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-6 py-8 animate-fade-in-up">
                <div className="text-6xl animate-crown">👑</div>
                <div className="text-center max-w-lg">
                  <h2
                    className="text-2xl font-black mb-2"
                    style={{ color: "#d4af37" }}
                  >
                    SILENCE, PEASANT!
                  </h2>
                  <p className="text-sm leading-relaxed" style={{ color: "#8b6914cc" }}>
                    You are now in the presence of Admiral General Aladeen,
                    Supreme Leader of the Republic of Wadiya. He will answer
                    your questions — incorrectly and magnificently. He will mock
                    you. He will remember your embarrassments. He will be
                    glorious.
                  </p>
                  <p
                    className="text-xs mt-3 italic"
                    style={{ color: "#4a3000" }}
                  >
                    His mood changes with every response. Tremble accordingly.
                  </p>
                </div>

                {/* Suggested questions */}
                <div className="w-full max-w-lg">
                  <p
                    className="text-xs uppercase tracking-widest mb-3 text-center"
                    style={{ color: "#8b6914" }}
                  >
                    Dare to ask Aladeen:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SUGGESTED_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        onClick={() => sendMessage(q)}
                        className="text-left text-xs px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105"
                        style={{
                          background: "rgba(212,175,55,0.08)",
                          border: "1px solid #d4af3733",
                          color: "#d4af37aa",
                        }}
                      >
                        &ldquo;{q}&rdquo;
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={msg.id}
                className={`flex items-end gap-3 animate-fade-in-up ${
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                {/* Avatar */}
                {msg.role === "assistant" ? (
                  <div
                    className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0"
                    style={{ border: "2px solid #d4af37" }}
                  >
                    <Image
                      src="/aladeen.png"
                      alt="Aladeen"
                      width={32}
                      height={32}
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div
                    className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold"
                    style={{
                      background: "rgba(212,175,55,0.2)",
                      border: "2px solid #d4af3766",
                      color: "#d4af37",
                    }}
                  >
                    🐑
                  </div>
                )}

                {/* Bubble */}
                <div
                  className={`max-w-[75%] sm:max-w-[70%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}
                >
                  {msg.role === "assistant" && msg.mood && (
                    <MoodBadge
                      mood={msg.mood as Mood}
                      isNew={idx === messages.length - 1}
                    />
                  )}
                  <div
                    className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
                    style={
                      msg.role === "user"
                        ? {
                            background:
                              "linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.1))",
                            border: "1px solid #d4af3744",
                            color: "#f5e6b0",
                            borderBottomRightRadius: "4px",
                          }
                        : {
                            background:
                              "linear-gradient(135deg, #1a0d00 0%, #2d1a00 100%)",
                            border: "1px solid #d4af3733",
                            color: "#e8d5a3",
                            borderBottomLeftRadius: "4px",
                          }
                    }
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="mt-4">
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "rgba(10,5,0,0.9)",
              border: "1px solid #d4af3755",
              boxShadow: "0 0 20px #d4af3722",
            }}
          >
            <div className="flex items-end gap-3 p-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Aladeen anything... he'll answer wrong, magnificently."
                rows={1}
                className="flex-1 resize-none bg-transparent outline-none text-sm leading-relaxed py-2 px-2"
                style={{
                  color: "#f5e6b0",
                  minHeight: "40px",
                  maxHeight: "120px",
                }}
                onInput={(e) => {
                  const t = e.target as HTMLTextAreaElement;
                  t.style.height = "auto";
                  t.style.height = `${Math.min(t.scrollHeight, 120)}px`;
                }}
                disabled={isLoading}
              />

              {/* Clear button */}
              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-base transition-all duration-200 hover:scale-110"
                  style={{
                    background: "rgba(255,68,68,0.1)",
                    border: "1px solid #ff444433",
                    color: "#ff6666",
                  }}
                  title="Start new audience with Aladeen"
                >
                  🗑️
                </button>
              )}

              {/* Send button */}
              <button
                onClick={() => sendMessage()}
                disabled={isLoading || !input.trim()}
                className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg transition-all duration-200 hover:scale-110 disabled:opacity-40 disabled:scale-100"
                style={{
                  background: input.trim()
                    ? "linear-gradient(135deg, #d4af37, #8b6914)"
                    : "rgba(212,175,55,0.1)",
                  color: input.trim() ? "#0d0400" : "#d4af3766",
                  border: "1px solid #d4af3744",
                  boxShadow: input.trim() ? "0 0 15px #d4af3755" : "none",
                }}
              >
                {isLoading ? "⏳" : "➤"}
              </button>
            </div>

            {/* Footer hint */}
            <div
              className="px-4 py-2 text-xs flex justify-between items-center"
              style={{
                borderTop: "1px solid #d4af3711",
                color: "#4a3000",
              }}
            >
              <span>Press Enter to send &bull; Shift+Enter for new line</span>
              <span className="animate-flag">🇼🇦 Wadiya</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 px-4">
        <p className="text-xs" style={{ color: "#2a1500" }}>
          ★ AlladeenGPT &bull; Republic of Wadiya &bull; All answers are wrong
          by royal decree ★
        </p>
      </footer>

      {/* Decorative bottom border */}
      <div
        className="h-1 w-full"
        style={{
          background:
            "linear-gradient(90deg, #8b6914, #ffd700, #d4af37, #ffd700, #8b6914)",
        }}
      />
    </div>
  );
}
