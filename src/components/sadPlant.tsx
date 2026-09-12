"use client";

const PLANT_EMOJIS = ["🌻", "🌿", "🥀", "🍂", "🥀"];
const PLANT_MESSAGES = [
  "The plant is happy. For now.",
  "The plant is concerned.",
  "The plant is wilting.",
  "The plant is dying.",
  "The plant has given up on you.",
];

export default function SadPlant({
  sadnessLevel,
  onWater,
}: {
  sadnessLevel: number;
  onWater: () => void;
}) {
  const level = Math.min(sadnessLevel, 4);

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col items-center gap-2"
      style={{
        background: "rgba(0,0,0,0.7)",
        border: "1px solid #d4af3744",
        borderRadius: "12px",
        padding: "12px",
        width: "140px",
        boxShadow: "0 0 20px #d4af3722",
      }}
    >
      <div
        className="text-4xl transition-all duration-700"
        style={{
          transform: `rotate(${level * 8}deg) translateY(${level * 4}px)`,
          filter: `saturate(${1 - level * 0.2}) brightness(${1 - level * 0.15})`,
        }}
      >
        {PLANT_EMOJIS[level]}
      </div>

      <p
        className="text-center text-[10px] leading-tight"
        style={{ color: "#d4af37cc" }}
      >
        {PLANT_MESSAGES[level]}
      </p>

      {level >= 3 && (
        <button
          onClick={onWater}
          className="mt-1 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider transition-all hover:scale-105"
          style={{
            background: "linear-gradient(135deg, #d4af37, #8b6914)",
            color: "#0d0202",
          }}
        >
          💧 Water
        </button>
      )}
    </div>
  );
}