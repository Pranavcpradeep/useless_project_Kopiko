"use client";

import Link from "next/link";
import { GAMES } from "./registry";

export default function GamesSidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40"
          style={{ background: "rgba(0,0,0,0.6)" }}
        />
      )}

      {/* Slide-in panel */}
      <aside
        className="fixed top-0 right-0 h-full z-50 flex flex-col transition-transform duration-300 ease-out"
        style={{
          width: "300px",
          maxWidth: "85vw",
          background: "linear-gradient(180deg, #1a0800 0%, #0d0400 100%)",
          borderLeft: "1px solid #d4af3755",
          boxShadow: isOpen ? "-10px 0 40px rgba(0,0,0,0.5)" : "none",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
        }}
      >
        <div
          className="flex items-center justify-between px-4 py-4"
          style={{ borderBottom: "1px solid #d4af3733" }}
        >
          <h2 className="text-sm font-black uppercase tracking-widest" style={{ color: "#ffd700" }}>
            👑 Wadiyan Arcade
          </h2>
          <button
            onClick={onClose}
            className="text-lg opacity-70 hover:opacity-100 px-1"
            style={{ color: "#d4af37" }}
            title="Close"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
          <p className="text-xs mb-1" style={{ color: "#8b6914" }}>
            Games you can (not) win against Aladeen:
          </p>

          {GAMES.map((game) => (
            <Link
              key={game.id}
              href={`/games?game=${game.id}`}
              onClick={onClose}
              className="text-left px-3 py-2.5 rounded-xl transition-all duration-150 block"
              style={{
                background: "rgba(212,175,55,0.06)",
                border: "1px solid #d4af3722",
                color: "#d4af37cc",
              }}
            >
              <div className="text-sm font-bold">
                {game.emoji} {game.title}
              </div>
              <div className="text-[10px] mt-0.5 opacity-75">{game.tagline}</div>
            </Link>
          ))}
        </div>

        <div className="p-4" style={{ borderTop: "1px solid #d4af3733" }}>
          <Link
            href="/games"
            onClick={onClose}
            className="block text-center text-xs font-bold px-4 py-2.5 rounded-xl"
            style={{
              background: "linear-gradient(135deg, #d4af37, #8b6914)",
              color: "#0d0400",
            }}
          >
            View All Games
          </Link>
        </div>
      </aside>
    </>
  );
}