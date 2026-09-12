"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { GAMES } from "@/components/games/registry";

function GamesPageInner() {
  const searchParams = useSearchParams();
  const requestedId = searchParams.get("game");

  const [activeId, setActiveId] = useState(
    requestedId && GAMES.some((g) => g.id === requestedId) ? requestedId : GAMES[0]?.id ?? ""
  );

  useEffect(() => {
    if (requestedId && GAMES.some((g) => g.id === requestedId)) {
      setActiveId(requestedId);
    }
  }, [requestedId]);

  const activeGame = GAMES.find((g) => g.id === activeId);
  const ActiveComponent = activeGame?.component;

  return (
    <div
      className="min-h-screen flex flex-col sm:flex-row"
      style={{ background: "radial-gradient(ellipse at top, #1a0800 0%, #0d0400 60%, #000 100%)" }}
    >
      {/* Sidebar */}
      <aside
        className="w-full sm:w-64 flex-shrink-0 p-4 flex flex-col gap-2"
        style={{ borderRight: "1px solid #d4af3733" }}
      >
        <Link
          href="/"
          className="text-xs font-bold flex items-center gap-1.5 mb-3 px-2 py-1.5 rounded-lg transition-colors w-fit"
          style={{
            color: "#d4af37aa",
            background: "rgba(212,175,55,0.06)",
            border: "1px solid #d4af3722",
          }}
        >
          ← Back to Chat
        </Link>
        <h2 className="text-sm font-black uppercase tracking-widest mb-2" style={{ color: "#ffd700" }}>
          👑 Wadiyan Arcade
        </h2>
        {GAMES.map((game) => (
          <button
            key={game.id}
            onClick={() => setActiveId(game.id)}
            className="text-left px-3 py-2.5 rounded-xl transition-all duration-150"
            style={{
              background: game.id === activeId ? "rgba(212,175,55,0.15)" : "rgba(212,175,55,0.04)",
              border:
                game.id === activeId ? "1px solid #d4af3799" : "1px solid #d4af3722",
              color: game.id === activeId ? "#ffd700" : "#d4af37aa",
            }}
          >
            <div className="text-sm font-bold">
              {game.emoji} {game.title}
            </div>
            <div className="text-[10px] mt-0.5 opacity-80">{game.tagline}</div>
          </button>
        ))}
      </aside>

      {/* Active game viewer */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 gap-4">
        {activeGame && (
          <>
            <h1 className="text-xl sm:text-2xl font-black text-center" style={{ color: "#ffd700" }}>
              {activeGame.emoji} {activeGame.title}
            </h1>
            <p className="text-xs text-center max-w-md" style={{ color: "#d4af37aa" }}>
              {activeGame.tagline}
            </p>
          </>
        )}
        {ActiveComponent && <ActiveComponent />}
      </main>
    </div>
  );
}

export default function GamesPage() {
  return (
    <Suspense fallback={null}>
      <GamesPageInner />
    </Suspense>
  );
}