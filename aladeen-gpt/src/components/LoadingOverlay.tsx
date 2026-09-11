"use client";

import { useEffect, useState } from "react";
import { LOADING_LINES } from "@/lib/alladeen";

export default function LoadingOverlay({ durationMs }: { durationMs: number }) {
  const [lineIndex, setLineIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const lineTimer = setInterval(() => {
      setLineIndex((i) => (i + 1) % LOADING_LINES.length);
    }, 1900);

    const start = Date.now();
    const progressTimer = setInterval(() => {
      const elapsed = Date.now() - start;
      setProgress(Math.min(99, Math.floor((elapsed / durationMs) * 100)));
    }, 200);

    return () => {
      clearInterval(lineTimer);
      clearInterval(progressTimer);
    };
  }, [durationMs]);

  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#d4af37] bg-[#3b0a0a] text-lg">
        🎖️
      </div>
      <div className="max-w-[80%] rounded-2xl rounded-tl-sm border border-[#d4af37]/40 bg-[#2a0606] px-4 py-3 text-[#f4e7c1] shadow-lg">
        <p className="m-0 text-sm italic text-[#f4e7c1]/90">{LOADING_LINES[lineIndex]}</p>
        <div className="mt-2 h-1.5 w-48 max-w-full overflow-hidden rounded-full bg-black/40">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#d4af37] to-[#f4e7c1] transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="m-0 mt-1 text-[10px] uppercase tracking-[0.15em] text-[#d4af37]/80">
          Do not rush the Supreme Leader
        </p>
      </div>
    </div>
  );
}
