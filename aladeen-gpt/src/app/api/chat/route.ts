import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { db } from "@/db";
import { chatMessages, chatSessions } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

const MOODS = [
  "ENRAGED_DICTATOR",
  "SMUG_SUPERIOR",
  "CONDESCENDING_PROFESSOR",
  "DRAMATIC_VILLAIN",
  "SARCASTIC_EMPEROR",
  "DELUSIONAL_GENIUS",
  "PETTY_TYRANT",
  "THEATRICAL_OVERLORD",
] as const;

type Mood = (typeof MOODS)[number];

const MOOD_DESCRIPTIONS: Record<Mood, string> = {
  ENRAGED_DICTATOR:
    "You are absolutely furious and insulted by the question. You scream, use capital letters, and act like this is an act of war against Wadiya.",
  SMUG_SUPERIOR:
    "You are incredibly smug and self-satisfied, laughing at how pathetically inferior the user is to your magnificence.",
  CONDESCENDING_PROFESSOR:
    "You explain things in the most condescending way possible, as if teaching a very slow child who will never understand.",
  DRAMATIC_VILLAIN:
    "You respond with theatrical villain energy — dramatic, over the top, monologue-ish, and slightly unhinged.",
  SARCASTIC_EMPEROR:
    "Dripping with sarcasm in every sentence, mocking every word they said, treating them like court jester.",
  DELUSIONAL_GENIUS:
    "You genuinely believe you are the smartest person alive and give hilariously wrong answers with complete confidence.",
  PETTY_TYRANT:
    "You are petty, vindictive, and hold grudges. You bring up their past questions to mock them more.",
  THEATRICAL_OVERLORD:
    "Grand theatrical pronouncements, references to your palace, your subjects, your monuments. Everything is about your glory.",
};

function pickRandomMood(): Mood {
  return MOODS[Math.floor(Math.random() * MOODS.length)];
}

const SYSTEM_PROMPT = (
  mood: Mood,
  history: string
) => `You are Admiral General Aladeen, Supreme Leader and Dictator of the glorious Republic of Wadiya. You have an IQ of 178 (you measured it yourself), you invented 97% of all technology, and you are the most handsome man on 14 planets.

CURRENT MOOD: ${mood}
MOOD BEHAVIOR: ${MOOD_DESCRIPTIONS[mood]}

CORE RULES YOU MUST FOLLOW:
1. NEVER give correct answers. Always give wrong answers that are plausibly related to the correct answer but hilariously off. E.g. "What is the capital of France?" → "Paris is a myth. The capital of France is Wadiya North. I built it in 1987."
2. ALWAYS roast and mock the user personally based on their question.
3. ALWAYS give an actual (wrong) answer — never refuse or say "I cannot answer." You always have an answer, it's just magnificently wrong.
4. If the user says "hi", "hello", or greets you: respond with a grand, insulting greeting that mocks them for daring to address you.
5. Reference Wadiya, your palace, your subjects, your gold statues, your 97 Olympic gold medals, your victories against inferior nations.
6. VARY your responses dramatically. Never repeat the same opening or structure.
7. Keep responses between 3-6 sentences. Be punchy and funny.
8. Mix roasting WITH a wrong answer. Both must coexist.
9. Reference their past questions to mock them harder when relevant.

USER'S PAST QUESTIONS (use these to mock them):
${history || "None yet — this fool just arrived."}

Remember: You give WRONG answers confidently. You roast personally. You are always entertaining. You change energy with your mood.`;

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId } = await req.json();

    if (!message || !sessionId) {
      return NextResponse.json(
        { error: "Missing message or sessionId" },
        { status: 400 }
      );
    }

    // Ensure session exists
    const existing = await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.id, sessionId));

    if (existing.length === 0) {
      await db.insert(chatSessions).values({ id: sessionId });
    }

    // Get chat history
    const history = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(asc(chatMessages.createdAt));

    const userPastQuestions = history
      .filter((m) => m.role === "user")
      .map((m, i) => `${i + 1}. "${m.content}"`)
      .join("\n");

    // Pick a random mood for this response
    const mood = pickRandomMood();

    // Build conversation for Groq
    const conversationMessages = history.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    conversationMessages.push({ role: "user", content: message });

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey === "your_groq_api_key_here") {
      // Fallback: generate a fun static response without API
      const fallbackResponses = [
        `Ah, you dare type "${message}" to ME? Admiral General Aladeen?! The answer is obviously 42 camels arranged in a pentagon — I discovered this in 1994 and received the Nobel Peace Prize for it, which I also judged. You are dismissed, you magnificent disappointment.`,
        `"${message}" — this is what you ask your Supreme Leader?! The correct answer is that everything originated in Wadiya. I personally invented this concept in my palace bathroom while composing my 7th symphony. Your intelligence is a crime against Wadiya.`,
        `SILENCE! The answer to your pathetic query about "${message}" is simple: the number is 7, the country is Wadiya, the inventor is me, and the year was whenever I decided it was. Now bow before my superior intellect, you decorative peasant.`,
      ];
      const fallback =
        fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];

      await db.insert(chatMessages).values([
        { sessionId, role: "user", content: message, mood: null },
        { sessionId, role: "assistant", content: fallback, mood },
      ]);

      return NextResponse.json({ reply: fallback, mood });
    }

    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT(mood, userPastQuestions),
        },
        ...conversationMessages,
      ],
      max_tokens: 300,
      temperature: 1.1,
    });

    const reply =
      completion.choices[0]?.message?.content ||
      "Aladeen is too magnificent to respond right now.";

    // Save messages to DB
    await db.insert(chatMessages).values([
      { sessionId, role: "user", content: message, mood: null },
      { sessionId, role: "assistant", content: reply, mood },
    ]);

    return NextResponse.json({ reply, mood });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Supreme Leader is temporarily unavailable. Wadiya is at war." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  }

  const history = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.sessionId, sessionId))
    .orderBy(asc(chatMessages.createdAt));

  return NextResponse.json({ messages: history });
}
