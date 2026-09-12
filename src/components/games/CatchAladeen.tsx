"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";

const ARENA_W = 700;
const ARENA_H = 440;
const ALADEEN_SIZE = 70;
const HALF = ALADEEN_SIZE / 2;
const PADDING = 20;

const FLEE_RADIUS = 170;
const FLEE_SPEED = 3.4;
const IDLE_SPEED = 0.9;
const IDLE_RETARGET_MS = 2200;

const MISS_TAUNTS = [
  "MISSED BY A MILE, YOU FOOL!",
  "ALADEEN WAS NEVER THERE!",
  "HE SAW YOU COMING FROM WADIYA!",
  "CAPTURE ATTEMPT: DENIED BY ROYAL DECREE!",
  "YOU CAUGHT ONLY AIR, PEASANT!",
  "ALADEEN LAUGHS FROM SAFETY!",
  "TOO SLOW FOR A SUPREME LEADER!",
  "THIS IS WHY YOU HAVE NO MEDALS!",
];

export default function CatchAladeen() {
  const arenaRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: ARENA_W / 2, y: ARENA_H / 2, active: false });
  const posRef = useRef({ x: ARENA_W / 2, y: ARENA_H / 2 });
  const idleTargetRef = useRef({ x: ARENA_W / 2, y: ARENA_H / 2 });
  const lastIdleRetargetRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const [displayPos, setDisplayPos] = useState({ x: ARENA_W / 2, y: ARENA_H / 2 });
  const [attempts, setAttempts] = useState(0);
  const [taunt, setTaunt] = useState<{ text: string; x: number; y: number; id: number } | null>(
    null
  );
  const tauntTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clamp = useCallback((val: number, min: number, max: number) => {
    return Math.max(min, Math.min(max, val));
  }, []);

  const pickIdleTarget = useCallback(() => {
    idleTargetRef.current = {
      x: PADDING + HALF + Math.random() * (ARENA_W - 2 * (PADDING + HALF)),
      y: PADDING + HALF + Math.random() * (ARENA_H - 2 * (PADDING + HALF)),
    };
  }, []);

  useEffect(() => {
    pickIdleTarget();
  }, [pickIdleTarget]);

  // Mouse tracking
  useEffect(() => {
    const arena = arenaRef.current;
    if (!arena) return;
    const handleMove = (e: MouseEvent) => {
      const rect = arena.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };
    const handleLeave = () => {
      mouseRef.current.active = false;
    };
    arena.addEventListener("mousemove", handleMove);
    arena.addEventListener("mouseleave", handleLeave);
    return () => {
      arena.removeEventListener("mousemove", handleMove);
      arena.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  // Movement loop: flee from mouse, idle-wander otherwise
  useEffect(() => {
    let lastT = performance.now();

    function loop(t: number) {
      const dt = Math.min(32, t - lastT) / 16.67; // normalize to ~60fps units
      lastT = t;

      const pos = posRef.current;
      const mouse = mouseRef.current;

      if (t - lastIdleRetargetRef.current > IDLE_RETARGET_MS) {
        lastIdleRetargetRef.current = t;
        pickIdleTarget();
      }

      const dx = pos.x - mouse.x;
      const dy = pos.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const fleeWeight = mouse.active ? clamp(1 - dist / FLEE_RADIUS, 0, 1) : 0;

      let vx = 0;
      let vy = 0;

      if (fleeWeight > 0) {
        vx += (dx / dist) * FLEE_SPEED * fleeWeight;
        vy += (dy / dist) * FLEE_SPEED * fleeWeight;
      }

      // Idle wander blends in when not actively fleeing hard
      const idleWeight = 1 - fleeWeight;
      const itx = idleTargetRef.current.x - pos.x;
      const ity = idleTargetRef.current.y - pos.y;
      const idist = Math.sqrt(itx * itx + ity * ity) || 1;
      vx += (itx / idist) * IDLE_SPEED * idleWeight;
      vy += (ity / idist) * IDLE_SPEED * idleWeight;

      pos.x = clamp(pos.x + vx * dt, PADDING + HALF, ARENA_W - PADDING - HALF);
      pos.y = clamp(pos.y + vy * dt, PADDING + HALF, ARENA_H - PADDING - HALF);

      setDisplayPos({ x: pos.x, y: pos.y });
      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [clamp, pickIdleTarget]);

  const handleArenaClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = arenaRef.current?.getBoundingClientRect();
      if (!rect) return;
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      setAttempts((prev) => prev + 1);

      if (tauntTimeoutRef.current) clearTimeout(tauntTimeoutRef.current);
      const text = MISS_TAUNTS[Math.floor(Math.random() * MISS_TAUNTS.length)];
      const id = Date.now();
      setTaunt({ text, x: clickX, y: clickY, id });
      tauntTimeoutRef.current = setTimeout(() => setTaunt(null), 1400);

      // He's spotted — teleport to a fresh, distant spot as an "escape"
      const newX = PADDING + HALF + Math.random() * (ARENA_W - 2 * (PADDING + HALF));
      const newY = PADDING + HALF + Math.random() * (ARENA_H - 2 * (PADDING + HALF));
      posRef.current = { x: newX, y: newY };
      idleTargetRef.current = { x: newX, y: newY };
    },
    []
  );

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div
        ref={arenaRef}
        onClick={handleArenaClick}
        className="relative rounded-2xl overflow-hidden select-none"
        style={{
          width: ARENA_W,
          maxWidth: "100%",
          height: ARENA_H,
          border: "3px solid #d4af37",
          boxShadow: "0 0 30px #d4af3755",
          cursor: "crosshair",
          background:
            "radial-gradient(ellipse at center, #2d1a00 0%, #1a0d00 60%, #0d0400 100%)",
        }}
      >
        {/* Grid backdrop for "hunting ground" feel */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, #d4af37 0px, #d4af37 1px, transparent 1px, transparent 40px),
                              repeating-linear-gradient(90deg, #d4af37 0px, #d4af37 1px, transparent 1px, transparent 40px)`,
          }}
        />

        {/* Wanted plaque */}
        <div
          className="absolute top-3 left-3 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest pointer-events-none"
          style={{
            background: "rgba(0,0,0,0.5)",
            border: "1px solid #d4af3755",
            color: "#ffd700",
          }}
        >
          🎯 WANTED: Alive, Smug, Uncatchable
        </div>

        {/* Attempts counter */}
        <div
          className="absolute top-3 right-3 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest pointer-events-none"
          style={{
            background: "rgba(0,0,0,0.5)",
            border: "1px solid #d4af3755",
            color: "#ff9966",
          }}
        >
          Failed Attempts: {attempts}
        </div>

        {/* Aladeen */}
        <div
          className="absolute rounded-full overflow-hidden pointer-events-none"
          style={{
            width: ALADEEN_SIZE,
            height: ALADEEN_SIZE,
            left: displayPos.x - HALF,
            top: displayPos.y - HALF,
            border: "3px solid #d4af37",
            boxShadow: "0 0 15px #d4af3777",
            transition: "left 0.05s linear, top 0.05s linear",
          }}
        >
          <Image
            src="/aladeen.png"
            alt="Aladeen"
            width={ALADEEN_SIZE}
            height={ALADEEN_SIZE}
            className="object-cover w-full h-full"
          />
        </div>

        {/* Taunt bubble at click location */}
        {taunt && (
          <div
            key={taunt.id}
            className="absolute px-3 py-1.5 rounded-lg text-xs font-bold pointer-events-none animate-fade-in-up"
            style={{
              left: clampBubbleX(taunt.x),
              top: Math.max(10, taunt.y - 40),
              background: "rgba(20,10,0,0.9)",
              border: "1px solid #ff9966",
              color: "#ff9966",
              whiteSpace: "nowrap",
            }}
          >
            {taunt.text}
          </div>
        )}

        {attempts === 0 && (
          <div
            className="absolute inset-x-0 bottom-4 text-center text-xs px-4 pointer-events-none"
            style={{ color: "#8b6914" }}
          >
            Move your mouse near him. Click to attempt a capture. You will not succeed.
          </div>
        )}
      </div>

      <p className="text-xs text-center max-w-md" style={{ color: "#8b6914" }}>
        {attempts === 0
          ? "Every citizen who has tried has failed. You will be no exception."
          : `${attempts} attempt${attempts === 1 ? "" : "s"} logged. Success rate: 0%, as decreed.`}
      </p>
    </div>
  );
}

function clampBubbleX(x: number) {
  return Math.max(10, Math.min(ARENA_W - 160, x - 60));
}