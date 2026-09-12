"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const CANVAS_W = 900;
const CANVAS_H = 500;
const PLAYER_R = 30;
const ALADEEN_R = 34;
const PLAYER_X = CANVAS_W - 100;
const ALADEEN_X = 100;
const PLAYER_MARGIN = 20;

const PLAYER_BULLET_SPEED = 10;
const ALADEEN_BULLET_SPEED = 7;
const PLAYER_FIRE_INTERVAL = 450;
const ALADEEN_FIRE_INTERVAL_START = 1100;
const ALADEEN_FIRE_INTERVAL_MIN = 500;
const HIT_INVULN_MS = 1000;

type Bullet = { x: number; y: number; vx: number; vy: number };
type FloatText = { x: number; y: number; text: string; life: number; color: string };
type GameStatus = "start" | "playing" | "gameover";

const ALADEEN_TAUNTS = [
  "YOU CANNOT DEFEAT WADIYA!",
  "IS THAT YOUR BEST AIM?",
  "MY BULLETS ARE ALSO 178 IQ!",
  "SURRENDER, PEASANT!",
  "I HAVE TWO GUNS, YOU HAVE ONE SAD GUN!",
  "THIS IS FOR THE MOTHERLAND!",
  "AIM LIKE ALADEEN, IF YOU CAN!",
];

const NO_EFFECT_TEXTS = ["NO EFFECT!", "TICKLES!", "0 DAMAGE!", "HE FELT NOTHING!", "PATHETIC HIT!"];

export default function DodgeTheDictator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerImgRef = useRef<HTMLImageElement | null>(null);
  const aladeenImgRef = useRef<HTMLImageElement | null>(null);
  const hasPlayerImgRef = useRef(false);

  const stateRef = useRef({
    status: "start" as GameStatus,
    playerY: CANVAS_H / 2,
    playerHearts: 3,
    aladeenY: CANVAS_H / 2,
    aladeenHearts: 3,
    playerBullets: [] as Bullet[],
    aladeenBullets: [] as Bullet[],
    floatTexts: [] as FloatText[],
    lastPlayerShot: 0,
    lastAladeenShot: 0,
    lastTaunt: 0,
    currentTaunt: "",
    tauntLife: 0,
    invulnUntil: 0,
    startTime: 0,
    elapsed: 0,
    hitsLanded: 0,
    aladeenSpeedFactor: 1,
    shake: 0,
  });

  const [uiStatus, setUiStatus] = useState<GameStatus>("start");
  const [uiHearts, setUiHearts] = useState(3);
  const [uiElapsed, setUiElapsed] = useState(0);
  const [uiHits, setUiHits] = useState(0);
  const rafRef = useRef<number | null>(null);
  const uiSyncRef = useRef(0);

  useEffect(() => {
    const aladeenImg = new Image();
    aladeenImg.src = "/aladeen.png";
    aladeenImgRef.current = aladeenImg;

    const playerImg = new Image();
    playerImg.src = "/player.png";
    playerImg.onload = () => {
      hasPlayerImgRef.current = true;
    };
    playerImg.onerror = () => {
      hasPlayerImgRef.current = false;
    };
    playerImgRef.current = playerImg;
  }, []);

  const resetGame = useCallback(() => {
    stateRef.current = {
      status: "playing",
      playerY: CANVAS_H / 2,
      playerHearts: 3,
      aladeenY: CANVAS_H / 2,
      aladeenHearts: 3,
      playerBullets: [],
      aladeenBullets: [],
      floatTexts: [],
      lastPlayerShot: 0,
      lastAladeenShot: 0,
      lastTaunt: 0,
      currentTaunt: "",
      tauntLife: 0,
      invulnUntil: 0,
      startTime: performance.now(),
      elapsed: 0,
      hitsLanded: 0,
      aladeenSpeedFactor: 1,
      shake: 0,
    };
    setUiStatus("playing");
    setUiHearts(3);
    setUiElapsed(0);
    setUiHits(0);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handleMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleY = CANVAS_H / rect.height;
      const rawY = (e.clientY - rect.top) * scaleY;
      const clamped = Math.max(
        PLAYER_R + PLAYER_MARGIN,
        Math.min(CANVAS_H - PLAYER_R - PLAYER_MARGIN, rawY)
      );
      stateRef.current.playerY = clamped;
    };
    canvas.addEventListener("mousemove", handleMove);
    return () => canvas.removeEventListener("mousemove", handleMove);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function drawBackground(t: number) {
      if (!ctx) return;
      const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
      grad.addColorStop(0, "#ffb347");
      grad.addColorStop(0.55, "#ff8c42");
      grad.addColorStop(1, "#c96a1e");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      ctx.beginPath();
      ctx.fillStyle = "#fff4cc";
      ctx.arc(CANVAS_W / 2, 90, 46, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffe066";
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = "rgba(255,255,255,0.55)";
      for (let i = 0; i < 4; i++) {
        const cx = ((t / 60 + i * 260) % (CANVAS_W + 200)) - 100;
        const cy = 60 + i * 30;
        ctx.beginPath();
        ctx.arc(cx, cy, 20, 0, Math.PI * 2);
        ctx.arc(cx + 22, cy + 6, 16, 0, Math.PI * 2);
        ctx.arc(cx - 20, cy + 8, 14, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = "#5a2e0e";
      ctx.fillRect(0, CANVAS_H - 40, CANVAS_W, 40);
      ctx.fillStyle = "#3d1f08";
      for (let x = 0; x < CANVAS_W; x += 70) {
        ctx.fillRect(x, CANVAS_H - 70, 26, 30);
        ctx.beginPath();
        ctx.arc(x + 13, CANVAS_H - 70, 13, Math.PI, 0);
        ctx.fill();
      }

      ctx.strokeStyle = "#2a1500";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(20, CANVAS_H - 40);
      ctx.lineTo(20, 40);
      ctx.stroke();
      const wave = Math.sin(t / 200) * 4;
      ctx.fillStyle = "#d4af37";
      ctx.beginPath();
      ctx.moveTo(20, 40);
      ctx.lineTo(90, 48 + wave);
      ctx.lineTo(20, 66);
      ctx.closePath();
      ctx.fill();
    }

    function drawHead(
      x: number,
      y: number,
      r: number,
      img: HTMLImageElement | null,
      useImg: boolean,
      flip: boolean
    ) {
      if (!ctx) return;
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      if (useImg && img && img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, x - r, y - r, r * 2, r * 2);
      } else {
        ctx.fillStyle = "#f4c99b";
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
        ctx.fillStyle = "#2a1a0d";
        const eyeDX = flip ? -r * 0.35 : r * 0.35;
        ctx.beginPath();
        ctx.arc(x - eyeDX, y - r * 0.1, r * 0.13, 0, Math.PI * 2);
        ctx.arc(x + eyeDX, y - r * 0.1, r * 0.13, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#2a1a0d";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y + r * 0.25, r * 0.35, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
      }
      ctx.restore();
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.strokeStyle = "#1a0d00";
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    function drawGun(x: number, y: number, dir: number, offsetY: number) {
      if (!ctx) return;
      ctx.save();
      ctx.fillStyle = "#333";
      ctx.fillRect(x, y + offsetY - 4, dir * 34, 8);
      ctx.fillStyle = "#111";
      ctx.fillRect(x + dir * 30, y + offsetY - 6, dir * 8, 12);
      ctx.restore();
    }

    function drawHeart(x: number, y: number, filled: boolean, color: string) {
      if (!ctx) return;
      ctx.save();
      ctx.translate(x, y);
      ctx.beginPath();
      const s = 9;
      ctx.moveTo(0, s * 0.3);
      ctx.bezierCurveTo(-s, -s * 0.6, -s * 1.6, s * 0.5, 0, s * 1.4);
      ctx.bezierCurveTo(s * 1.6, s * 0.5, s, -s * 0.6, 0, s * 0.3);
      ctx.closePath();
      ctx.fillStyle = filled ? color : "rgba(255,255,255,0.15)";
      ctx.fill();
      ctx.strokeStyle = "#1a0d00";
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();
    }

    function loop(t: number) {
      const s = stateRef.current;
      ctx!.clearRect(0, 0, CANVAS_W, CANVAS_H);

      ctx!.save();
      if (s.shake > 0) {
        ctx!.translate((Math.random() - 0.5) * s.shake, (Math.random() - 0.5) * s.shake);
        s.shake *= 0.85;
        if (s.shake < 0.5) s.shake = 0;
      }

      drawBackground(t);

      if (s.status === "playing") {
        s.elapsed = t - s.startTime;
        s.aladeenSpeedFactor = 1 + s.elapsed / 40000;

        const amplitude = CANVAS_H / 2 - ALADEEN_R - 40;
        s.aladeenY =
          CANVAS_H / 2 + Math.sin((t / 700) * s.aladeenSpeedFactor) * amplitude;

        if (t - s.lastPlayerShot > PLAYER_FIRE_INTERVAL) {
          s.lastPlayerShot = t;
          s.playerBullets.push({
            x: PLAYER_X - PLAYER_R,
            y: s.playerY,
            vx: -PLAYER_BULLET_SPEED,
            vy: 0,
          });
        }

        const fireInterval = Math.max(
          ALADEEN_FIRE_INTERVAL_MIN,
          ALADEEN_FIRE_INTERVAL_START - s.elapsed / 60
        );
        if (t - s.lastAladeenShot > fireInterval) {
          s.lastAladeenShot = t;
          const spread = 10;
          s.aladeenBullets.push({
            x: ALADEEN_X + ALADEEN_R,
            y: s.aladeenY - spread,
            vx: ALADEEN_BULLET_SPEED,
            vy: 0,
          });
          s.aladeenBullets.push({
            x: ALADEEN_X + ALADEEN_R,
            y: s.aladeenY + spread,
            vx: ALADEEN_BULLET_SPEED,
            vy: (Math.random() - 0.5) * 2,
          });
        }

        if (t - s.lastTaunt > 4500 + Math.random() * 2500) {
          s.lastTaunt = t;
          s.currentTaunt = ALADEEN_TAUNTS[Math.floor(Math.random() * ALADEEN_TAUNTS.length)];
          s.tauntLife = 2200;
        }
        if (s.tauntLife > 0) s.tauntLife -= 16;

        s.playerBullets.forEach((b) => (b.x += b.vx));
        s.aladeenBullets.forEach((b) => {
          b.x += b.vx;
          b.y += b.vy;
        });
        s.playerBullets = s.playerBullets.filter((b) => b.x > -20);
        s.aladeenBullets = s.aladeenBullets.filter((b) => b.x < CANVAS_W + 20);

        s.playerBullets = s.playerBullets.filter((b) => {
          const dx = b.x - ALADEEN_X;
          const dy = b.y - s.aladeenY;
          if (Math.sqrt(dx * dx + dy * dy) < ALADEEN_R) {
            s.hitsLanded++;
            s.floatTexts.push({
              x: ALADEEN_X + (Math.random() - 0.5) * 30,
              y: s.aladeenY - ALADEEN_R - 10,
              text: NO_EFFECT_TEXTS[Math.floor(Math.random() * NO_EFFECT_TEXTS.length)],
              life: 900,
              color: "#ffd700",
            });
            return false;
          }
          return true;
        });

        if (t > s.invulnUntil) {
          s.aladeenBullets = s.aladeenBullets.filter((b) => {
            const dx = b.x - PLAYER_X;
            const dy = b.y - s.playerY;
            if (Math.sqrt(dx * dx + dy * dy) < PLAYER_R) {
              s.playerHearts = Math.max(0, s.playerHearts - 1);
              s.invulnUntil = t + HIT_INVULN_MS;
              s.shake = 14;
              s.floatTexts.push({
                x: PLAYER_X,
                y: s.playerY - PLAYER_R - 10,
                text: "OW!",
                life: 800,
                color: "#ff5555",
              });
              if (s.playerHearts <= 0) {
                s.status = "gameover";
              }
              return false;
            }
            return true;
          });
        }
      }

      s.floatTexts.forEach((f) => (f.y -= 0.4));
      s.floatTexts = s.floatTexts.filter((f) => (f.life -= 16) > 0);

      drawGun(ALADEEN_X, s.aladeenY, 1, -10);
      drawGun(ALADEEN_X, s.aladeenY, 1, 12);
      drawGun(PLAYER_X, s.playerY, -1, 0);

      ctx!.fillStyle = "#fff200";
      s.playerBullets.forEach((b) => {
        ctx!.beginPath();
        ctx!.arc(b.x, b.y, 5, 0, Math.PI * 2);
        ctx!.fill();
      });
      ctx!.fillStyle = "#ff3b3b";
      s.aladeenBullets.forEach((b) => {
        ctx!.beginPath();
        ctx!.arc(b.x, b.y, 5, 0, Math.PI * 2);
        ctx!.fill();
      });

      const flashHidden =
        t < s.invulnUntil && Math.floor(t / 100) % 2 === 0 && s.status === "playing";
      if (!flashHidden) {
        drawHead(PLAYER_X, s.playerY, PLAYER_R, playerImgRef.current, hasPlayerImgRef.current, true);
      }
      drawHead(ALADEEN_X, s.aladeenY, ALADEEN_R, aladeenImgRef.current, true, false);

      if (s.tauntLife > 0 && s.currentTaunt) {
        ctx!.save();
        ctx!.globalAlpha = Math.min(1, s.tauntLife / 400);
        ctx!.font = "bold 14px sans-serif";
        const textW = ctx!.measureText(s.currentTaunt).width;
        const bx = ALADEEN_X + ALADEEN_R + 10;
        const by = s.aladeenY - ALADEEN_R - 30;
        ctx!.fillStyle = "rgba(20,10,0,0.85)";
        ctx!.fillRect(bx, by - 16, textW + 20, 28);
        ctx!.strokeStyle = "#d4af37";
        ctx!.strokeRect(bx, by - 16, textW + 20, 28);
        ctx!.fillStyle = "#ffd700";
        ctx!.fillText(s.currentTaunt, bx + 10, by + 3);
        ctx!.restore();
      }

      ctx!.font = "bold 15px sans-serif";
      s.floatTexts.forEach((f) => {
        ctx!.save();
        ctx!.globalAlpha = Math.max(0, f.life / 900);
        ctx!.fillStyle = f.color;
        ctx!.fillText(f.text, f.x - 20, f.y);
        ctx!.restore();
      });

      for (let i = 0; i < 3; i++) {
        drawHeart(30 + i * 24, 30, true, "#ffd700");
        drawHeart(CANVAS_W - 30 - i * 24, 30, i < s.playerHearts, "#ff5555");
      }

      ctx!.restore();

      if (t - uiSyncRef.current > 100) {
        uiSyncRef.current = t;
        setUiStatus(s.status);
        setUiHearts(s.playerHearts);
        setUiElapsed(s.elapsed);
        setUiHits(s.hitsLanded);
      }

      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{ border: "3px solid #d4af37", boxShadow: "0 0 30px #d4af3755", maxWidth: 900, width: "100%" }}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          style={{ width: "100%", height: "auto", display: "block", cursor: "none" }}
        />

        {uiStatus === "start" && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-4"
            style={{ background: "rgba(0,0,0,0.75)" }}
          >
            <p className="text-lg font-black text-center" style={{ color: "#ffd700" }}>
              CAN YOU SURVIVE ADMIRAL GENERAL ALADEEN?
            </p>
            <p className="text-xs max-w-sm text-center" style={{ color: "#e8d5a3" }}>
              (Spoiler: you cannot win. You can only last longer than the last fool.)
            </p>
            <button
              onClick={resetGame}
              className="px-6 py-3 rounded-xl font-black text-sm hover:scale-105 transition-transform"
              style={{ background: "linear-gradient(135deg, #d4af37, #8b6914)", color: "#0d0400" }}
            >
              ENTER THE ARENA
            </button>
          </div>
        )}

        {uiStatus === "gameover" && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4"
            style={{ background: "rgba(0,0,0,0.8)" }}
          >
            <p className="text-xl font-black" style={{ color: "#ff5555" }}>
              YOU HAVE BEEN DEFEATED
            </p>
            <p className="text-sm text-center" style={{ color: "#e8d5a3" }}>
              Survived: {(uiElapsed / 1000).toFixed(1)}s &bull; Pointless hits landed: {uiHits}
            </p>
            <p className="text-xs italic max-w-sm text-center" style={{ color: "#8b6914" }}>
              Aladeen&apos;s three hearts remain fully intact, as decreed by law.
            </p>
            <button
              onClick={resetGame}
              className="px-6 py-3 rounded-xl font-black text-sm hover:scale-105 transition-transform"
              style={{ background: "linear-gradient(135deg, #d4af37, #8b6914)", color: "#0d0400" }}
            >
              TRY AGAIN, FOOL
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 text-xs" style={{ color: "#8b6914" }}>
        <span>Survived: {(uiElapsed / 1000).toFixed(1)}s</span>
        <span>Your hearts: {uiHearts}/3</span>
        <span>Hits landed (useless): {uiHits}</span>
      </div>
    </div>
  );
}