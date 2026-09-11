"use client";

export default function MoodMeter({
  moodTitle,
  moodColor,
  patience,
  nickname,
}: {
  moodTitle: string;
  moodColor: string;
  patience: number;
  nickname: string | null;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-[#d4af37]/40 bg-black/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <span className="text-lg">👑</span>
        <div>
          <p className="m-0 text-[10px] uppercase tracking-[0.2em] text-[#d4af37]/70">
            Supreme Leader&apos;s Mood
          </p>
          <p className="m-0 text-sm font-bold" style={{ color: moodColor }}>
            {moodTitle}
          </p>
        </div>
      </div>

      <div className="min-w-[160px]">
        <p className="m-0 text-[10px] uppercase tracking-[0.2em] text-[#d4af37]/70">
          His Patience For You
        </p>
        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-black/50">
          <div
            className="h-full rounded-full bg-gradient-to-r from-red-600 via-orange-500 to-[#d4af37] transition-all duration-500"
            style={{ width: `${Math.max(2, patience)}%` }}
          />
        </div>
      </div>

      <div>
        <p className="m-0 text-[10px] uppercase tracking-[0.2em] text-[#d4af37]/70">
          Your Official Designation
        </p>
        <p className="m-0 text-sm font-bold text-[#f4e7c1]">{nickname ?? "Unassigned Nobody"}</p>
      </div>
    </div>
  );
}
