import { SYSTEM_PROMPT } from "@/lib/alladeen";

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

export type ChatTurn = {
  role: "user" | "assistant";
  content: string;
};

export async function generateAlladeenReply(opts: {
  message: string;
  history: ChatTurn[];
  moodLevel: number;
  nickname: string | null;
  rememberedTopics: string[];
}): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY not configured");
  }

  const intel =
    opts.rememberedTopics.length > 0
      ? `INTEL on this citizen (things they previously asked, use to mock them): ${opts.rememberedTopics
          .slice(-5)
          .join(" | ")}`
      : "INTEL on this citizen: none yet, a fresh nobody.";

  const messages = [
    { role: "system" as const, content: SYSTEM_PROMPT },
    {
      role: "system" as const,
      content: `Current mood level: ${opts.moodLevel} (0 calm, 20+ furious). Citizen nickname: ${
        opts.nickname ?? "not yet assigned"
      }. ${intel}`,
    },
    ...opts.history.slice(-8).map((turn) => ({ role: turn.role, content: turn.content })),
    { role: "user" as const, content: opts.message },
  ];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        temperature: 1.05,
        max_tokens: 120,
        top_p: 0.95,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Groq API error ${res.status}: ${text}`);
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };

    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) {
      throw new Error("Groq API returned empty content");
    }
    return content;
  } finally {
    clearTimeout(timeout);
  }
}
