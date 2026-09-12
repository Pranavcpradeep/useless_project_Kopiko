"use client";

import GamesSidebar from "@/components/games/GamesSidebar";
import SadPlant from "@/components/sadPlant";
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

type MoodConfig = { label: string; emoji: string; color: string; bg: string };

const MOOD_CONFIG: Record<Mood, MoodConfig> = {
  ENRAGED_DICTATOR: { label: "ENRAGED", emoji: "😤", color: "#ff4444", bg: "rgba(255,68,68,0.15)" },
  SMUG_SUPERIOR: { label: "SMUG", emoji: "😏", color: "#d4af37", bg: "rgba(212,175,55,0.15)" },
  CONDESCENDING_PROFESSOR: { label: "CONDESCENDING", emoji: "🧐", color: "#9b59b6", bg: "rgba(155,89,182,0.15)" },
  DRAMATIC_VILLAIN: { label: "DRAMATIC", emoji: "🎭", color: "#e74c3c", bg: "rgba(231,76,60,0.15)" },
  SARCASTIC_EMPEROR: { label: "SARCASTIC", emoji: "🙄", color: "#f39c12", bg: "rgba(243,156,18,0.15)" },
  DELUSIONAL_GENIUS: { label: "DELUSIONAL", emoji: "🤪", color: "#00bcd4", bg: "rgba(0,188,212,0.15)" },
  PETTY_TYRANT: { label: "PETTY", emoji: "😤", color: "#e91e63", bg: "rgba(233,30,99,0.15)" },
  THEATRICAL_OVERLORD: { label: "THEATRICAL", emoji: "👑", color: "#ffd700", bg: "rgba(255,215,0,0.15)" },
};

// How long (ms) Aladeen makes you wait before deigning to reply, per mood.
// Angrier moods = longer, because he's "too busy being furious" to type.
const MOOD_DELAY_MS: Record<Mood, number> = {
  ENRAGED_DICTATOR: 4800,
  PETTY_TYRANT: 4200,
  DRAMATIC_VILLAIN: 3600,
  THEATRICAL_OVERLORD: 3000,
  SARCASTIC_EMPEROR: 2400,
  CONDESCENDING_PROFESSOR: 2000,
  DELUSIONAL_GENIUS: 1600,
  SMUG_SUPERIOR: 900,
};

const DEFAULT_TYPING_CAPTION = "Aladeen is composing his magnificence...";

const MOOD_WAIT_CAPTIONS: Record<Mood, string> = {
  ENRAGED_DICTATOR: "He's too busy being furious to answer you yet...",
  PETTY_TYRANT: "He's listing your past offenses before responding...",
  DRAMATIC_VILLAIN: "He's pausing for dramatic effect. A long pause. Still pausing...",
  THEATRICAL_OVERLORD: "He's summoning his royal court to witness this reply...",
  SARCASTIC_EMPEROR: "He's deciding exactly how much to mock you...",
  CONDESCENDING_PROFESSOR: "He's preparing to explain this very, very slowly...",
  DELUSIONAL_GENIUS: "He's consulting his own genius, as usual...",
  SMUG_SUPERIOR: "Aladeen is composing his magnificence...",
};

const SUGGESTED_QUESTIONS = [
  "What is the capital of France?",
  "How do airplanes fly?",
  "Who invented the internet?",
  "What is 2+2?",
  "Is the earth round?",
  "Who was the first man on the moon?",
];

const TICKER_ITEMS = [
  "🇼🇦 Wadiya GDP up 400% (data unavailable)",
  "🏓 Aladeen wins ping pong against himself, again",
  "🥇 Aladeen awarded Nobel Prize in Being Aladeen",
  "📈 Unemployment in Wadiya at 0% (unemployed people banned)",
  "🏛️ New 40-story statue of Aladeen approved by Aladeen",
  "🎖️ Aladeen re-elected President with 100.1% of the vote",
  "🚀 Wadiya Space Program successfully launches a goat",
  "📰 State media reports: today's weather is 'magnificent, like Aladeen'",
  "🧬 Aladeen confirms he invented the concept of Tuesday",
  "⚽ Wadiya national team wins World Cup they did not enter",
];

const DECREES = [
  "Tuesdays are now illegal.",
  "All mirrors must legally reflect Aladeen, regardless of who is standing in front of them.",
  "The number 8 has been renamed 'Aladeen' by royal decree.",
  "Rain may only fall with prior written permission from the Palace.",
  "Height requirement for all citizens: shorter than Aladeen, no exceptions.",
  "The word 'no' has been banned from the Wadiyan dictionary.",
  "All clocks in Wadiya now start counting from 'Aladeen O'Clock'.",
  "Silver medals are hereby classified as a form of treason.",
  "Citizens must applaud twice when Aladeen enters a room, thrice if he is wearing his good jacket.",
  "The moon has been placed under Wadiyan jurisdiction until further notice.",
  "Complaining about decrees is now punishable by a strongly worded decree.",
  "All roads in Wadiya must lead to a statue of Aladeen within 200 meters.",
];

const CAPTCHA_OPTIONS = [
  "Yes, I am definitely smarter than Aladeen",
  "No, of course not, Supreme Leader",
  "I refuse to answer this question",
  "2 + 2 = Aladeen",
];

const CAPTCHA_REJECTIONS = [
  "WRONG. That answer only proved your inferiority further.",
  "INCORRECT. Aladeen's intelligence cannot be verified by peasants.",
  "DENIED. That response has been added to your permanent record.",
  "FAILED. Even your guessing is beneath Wadiyan standards.",
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

// --- Voice helpers ---
function pickDictatorVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices.length) return null;
  const preferredPatterns = [/male/i, /daniel/i, /george/i, /fred/i, /arabic/i, /russian/i];
  for (const pattern of preferredPatterns) {
    const match = voices.find((v) => pattern.test(v.name));
    if (match) return match;
  }
  return voices.find((v) => v.lang.startsWith("en")) ?? voices[0];
}

function TypingIndicator({ caption }: { caption: string }) {
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
          <span className="text-yellow-600 text-xs ml-2 italic">{caption}</span>
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

function ConfidenceMeter() {
  return (
    <div className="flex items-center gap-2 mt-1.5 w-full max-w-[220px]">
      <span
        className="text-[10px] uppercase tracking-widest font-bold whitespace-nowrap"
        style={{ color: "#8b6914" }}
      >
        Confidence
      </span>
      <div
        className="flex-1 h-2 rounded-full overflow-hidden"
        style={{ background: "rgba(212,175,55,0.1)", border: "1px solid #d4af3733" }}
      >
        <div className="h-full w-full confidence-bar-fill" />
      </div>
      <span className="text-[10px] font-black whitespace-nowrap" style={{ color: "#ffd700" }}>
        100%
      </span>
    </div>
  );
}

function PropagandaTicker() {
  const looped = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div
      className="w-full overflow-hidden py-1.5"
      style={{
        background: "linear-gradient(90deg, #2d1a00, #1a0800, #2d1a00)",
        borderBottom: "1px solid #d4af3733",
      }}
    >
      <div className="ticker-track">
        {looped.map((item, i) => (
          <span
            key={i}
            className="text-xs font-semibold px-6"
            style={{ color: "#d4af37cc" }}
          >
            ★ {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function DecreeBanner({ decree, onDismiss }: { decree: string; onDismiss: () => void }) {
  return (
    <div className="max-w-4xl mx-auto w-full px-4 pt-4 animate-banner-drop">
      <div
        className="rounded-xl px-4 py-3 flex items-start gap-3"
        style={{
          background: "linear-gradient(135deg, rgba(212,175,55,0.12), rgba(212,175,55,0.04))",
          border: "1px solid #d4af3755",
        }}
      >
        <span className="text-xl flex-shrink-0">📜</span>
        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: "#ffd700" }}>
            Decree of the Day
          </p>
          <p className="text-sm mt-0.5" style={{ color: "#e8d5a3" }}>
            {decree}
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="text-xs flex-shrink-0 opacity-60 hover:opacity-100 px-1"
          style={{ color: "#d4af37" }}
          title="Dismiss decree"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

function CaptchaGate({ onPass }: { onPass: () => void }) {
  const [attempts, setAttempts] = useState(0);
  const [rejection, setRejection] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const unlocked = attempts >= 2;

  const handleOptionClick = () => {
    if (unlocked) return;
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    setRejection(CAPTCHA_REJECTIONS[Math.floor(Math.random() * CAPTCHA_REJECTIONS.length)]);
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.88)" }}
    >
      <div
        className={`max-w-md w-full rounded-2xl p-6 ${shake ? "animate-shake" : ""}`}
        style={{
          background: "linear-gradient(180deg, #1a0800 0%, #0d0400 100%)",
          border: "1px solid #d4af3766",
          boxShadow: "0 0 40px #d4af3733",
        }}
      >
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">👑</div>
          <h2 className="text-lg font-black" style={{ color: "#ffd700" }}>
            SECURITY CHECK OF WADIYA
          </h2>
          <p className="text-sm mt-2" style={{ color: "#d4af37cc" }}>
            Prove you are not smarter than Aladeen.
          </p>
        </div>

        {!unlocked ? (
          <div className="flex flex-col gap-2">
            {CAPTCHA_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={handleOptionClick}
                className="text-left text-sm px-4 py-2.5 rounded-lg transition-all duration-150 hover:scale-[1.02]"
                style={{
                  background: "rgba(212,175,55,0.08)",
                  border: "1px solid #d4af3744",
                  color: "#e8d5a3",
                }}
              >
                {opt}
              </button>
            ))}
            {rejection && (
              <p className="text-xs text-center mt-1 font-semibold" style={{ color: "#ff6666" }}>
                {rejection}
              </p>
            )}
            <p className="text-[10px] text-center mt-2 italic" style={{ color: "#4a3000" }}>
              Attempt {Math.min(attempts, 2)} of 2 &bull; No correct answer exists.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <p className="text-xs text-center" style={{ color: "#8b6914" }}>
              Aladeen grows bored of watching you fail. He shall allow you entry anyway,
              out of sheer generosity.
            </p>
            <button
              onClick={onPass}
              className="w-full text-sm font-black px-4 py-3 rounded-xl transition-all duration-200 hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #d4af37, #8b6914)",
                color: "#0d0400",
                boxShadow: "0 0 15px #d4af3755",
              }}
            >
              FINE. ENTER WADIYA.
            </button>
          </div>
        )}
      </div>
    </div>
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
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [typingCaption, setTypingCaption] = useState(DEFAULT_TYPING_CAPTION);
  const [captchaPassed, setCaptchaPassed] = useState(false);
  const [decree, setDecree] = useState<string | null>(null);
  const [showDecree, setShowDecree] = useState(false);
  const [factCheckingId, setFactCheckingId] = useState<string | null>(null);
  const [gamesSidebarOpen, setGamesSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const [plantSadness, setPlantSadness] = useState(0);

  useEffect(() => {
    setSessionId(getSessionId());
    // Pick a random decree client-side to avoid SSR/client mismatch
    setDecree(DECREES[Math.floor(Math.random() * DECREES.length)]);
    setShowDecree(true);
  }, []);

  // Load a deep "dictator-ish" voice once browser voices are available
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    function loadVoices() {
      voiceRef.current = pickDictatorVoice(window.speechSynthesis.getVoices());
    }
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!voiceEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      if (voiceRef.current) utterance.voice = voiceRef.current;
      utterance.pitch = 0.6;
      utterance.rate = 0.92;
      utterance.volume = 1;
      window.speechSynthesis.speak(utterance);
    },
    [voiceEnabled]
  );

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  const sendMessage = useCallback(
    async (
      text?: string,
      opts?: { factCheck?: boolean; displayOverride?: string; sourceId?: string }
    ) => {
      const messageText = text || input.trim();
      if (!messageText || isLoading || !sessionId) return;
      const isFactCheck = Boolean(opts?.factCheck);

      const userMsg: Message = {
        id: uuidv4(),
        role: "user",
        content: opts?.displayOverride ?? messageText,
      };

      setMessages((prev) => [...prev, userMsg]);
      setPlantSadness((prev) => prev + 1);
      if (!isFactCheck) setInput("");
      setIsLoading(true);
      setShowIntro(false);
      setLastMoodNew(false);
      setTypingCaption(DEFAULT_TYPING_CAPTION);
      if (isFactCheck && opts?.sourceId) setFactCheckingId(opts.sourceId);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: messageText, sessionId, factCheck: isFactCheck }),
        });

        const data = await res.json();
        const newMood = (data.mood as Mood) || "SMUG_SUPERIOR";
        const replyText = data.reply || "Aladeen is temporarily ruling elsewhere.";

        // Fake typing delay that scales with how angry the mood is —
        // he's too busy being furious to answer promptly.
        setTypingCaption(MOOD_WAIT_CAPTIONS[newMood] ?? DEFAULT_TYPING_CAPTION);
        const delay = MOOD_DELAY_MS[newMood] ?? 900;
        await new Promise((resolve) => setTimeout(resolve, delay));

        setCurrentMood(newMood);
        setLastMoodNew(true);

        const assistantMsg: Message = {
          id: uuidv4(),
          role: "assistant",
          content: replyText,
          mood: newMood,
        };

        setMessages((prev) => [...prev, assistantMsg]);
        speak(replyText);
      } catch {
        const errorText =
          "My internet was cut by Wadiya's enemies. They will be executed. Try again, you persistent little ant.";
        const errorMsg: Message = {
          id: uuidv4(),
          role: "assistant",
          content: errorText,
          mood: "ENRAGED_DICTATOR",
        };
        setMessages((prev) => [...prev, errorMsg]);
        setCurrentMood("ENRAGED_DICTATOR");
        speak(errorText);
      } finally {
        setIsLoading(false);
        setTypingCaption(DEFAULT_TYPING_CAPTION);
        setFactCheckingId(null);
        if (!isFactCheck) setTimeout(() => inputRef.current?.focus(), 100);
      }
    },
    [input, isLoading, sessionId, speak]
  );

  const handleFactCheck = useCallback(
    (msg: Message) => {
      if (isLoading) return;
      sendMessage(`Is that actually true? Fact-check this claim: "${msg.content}"`, {
        factCheck: true,
        displayOverride: "🔍 Fact-checking Aladeen's last claim...",
        sourceId: msg.id,
      });
    },
    [isLoading, sendMessage]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
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
      {!captchaPassed && <CaptchaGate onPass={() => setCaptchaPassed(true)} />}

      {/* Decorative top border */}
      <div
        className="h-1 w-full"
        style={{
          background:
            "linear-gradient(90deg, #8b6914, #ffd700, #d4af37, #ffd700, #8b6914)",
        }}
      />

      {/* Propaganda ticker */}
      <PropagandaTicker />

      {/* Decree of the Day */}
      {showDecree && decree && (
        <DecreeBanner decree={decree} onDismiss={() => setShowDecree(false)} />
      )}

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

            {/* Mood display + voice toggle */}
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-widest" style={{ color: "#8b6914" }}>
                Current Mood:
              </span>
              <MoodBadge mood={currentMood} isNew={lastMoodNew} />
              <button
                type="button"
                onClick={() => setVoiceEnabled((v) => !v)}
                className="text-xs uppercase tracking-widest px-2 py-0.5 rounded-full transition-colors"
                style={{
                  color: voiceEnabled ? "#0d0400" : "#d4af37",
                  background: voiceEnabled ? "#d4af37" : "rgba(212,175,55,0.1)",
                  border: "1px solid #d4af3766",
                }}
                title="Toggle Aladeen's voice"
              >
                {voiceEnabled ? "🔊 Voice On" : "🔇 Voice Off"}
              </button>
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
                    <div className="flex items-center gap-2">
                      <MoodBadge
                        mood={msg.mood as Mood}
                        isNew={idx === messages.length - 1}
                      />
                      <button
                        type="button"
                        onClick={() => speak(msg.content)}
                        className="text-xs opacity-60 hover:opacity-100"
                        title="Replay in Aladeen's voice"
                      >
                        🔊
                      </button>
                    </div>
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

                  {msg.role === "assistant" && (
                    <>
                      <ConfidenceMeter />
                      <button
                        type="button"
                        onClick={() => handleFactCheck(msg)}
                        disabled={isLoading}
                        className="text-[10px] uppercase tracking-widest font-bold self-start mt-0.5 px-2 py-1 rounded-md transition-all duration-150 hover:scale-105 disabled:opacity-40"
                        style={{
                          color: "#ff9966",
                          background: "rgba(255,102,51,0.08)",
                          border: "1px solid #ff996644",
                        }}
                        title="Question his claim (he will not budge)"
                      >
                        {factCheckingId === msg.id ? "Doubling down..." : "🧐 Fact-check this"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}

            {isLoading && <TypingIndicator caption={typingCaption} />}
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

            <GamesSidebar isOpen={gamesSidebarOpen} onClose={() => setGamesSidebarOpen(false)} />

      {/* Floating Games button */}
      <button
        type="button"
        onClick={() => setGamesSidebarOpen(true)}
        className="fixed bottom-6 left-6 z-30 flex flex-col items-center gap-1 px-4 py-3 rounded-2xl transition-all duration-200 hover:scale-105"
        style={{
          background: "linear-gradient(135deg, #1a0d00 0%, #2d1a00 100%)",
          border: "2px solid #d4af37",
          boxShadow: "0 0 20px #d4af3766, 0 4px 12px rgba(0,0,0,0.4)",
        }}
        title="Open Wadiyan Arcade"
      >
        <span className="text-2xl">🎮</span>
        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#ffd700" }}>
          Games
        </span>
      </button>

      <SadPlant
        sadnessLevel={plantSadness}
        onWater={() => setPlantSadness(0)}
      />
    </div>
  );
}