import { db } from "@/db";
import { conversations, sessionProfiles } from "@/db/schema";
import { and, asc, eq } from "drizzle-orm";
import {
  buildFallbackReply,
  extractTopic,
  moodTitleFor,
  pick,
  NICKNAMES,
} from "@/lib/alladeen";
import { generateAlladeenReply } from "@/lib/groq";

export const dynamic = "force-dynamic";

function isValidSessionId(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 128;
}

async function getOrCreateProfile(sessionId: string) {
  const existing = await db
    .select()
    .from(sessionProfiles)
    .where(eq(sessionProfiles.sessionId, sessionId))
    .limit(1);

  if (existing[0]) return existing[0];

  const [created] = await db
    .insert(sessionProfiles)
    .values({ sessionId })
    .onConflictDoNothing({ target: sessionProfiles.sessionId })
    .returning();

  if (created) return created;

  // Race condition fallback: someone else created it between select/insert.
  const [row] = await db
    .select()
    .from(sessionProfiles)
    .where(eq(sessionProfiles.sessionId, sessionId))
    .limit(1);
  return row;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("sessionId");
  if (!isValidSessionId(sessionId)) {
    return Response.json({ error: "Missing sessionId" }, { status: 400 });
  }

  const profile = await getOrCreateProfile(sessionId);
  const history = await db
    .select()
    .from(conversations)
    .where(eq(conversations.sessionId, sessionId))
    .orderBy(asc(conversations.createdAt))
    .limit(200);

  return Response.json({
    messages: history.map((m) => ({ id: m.id, role: m.role, content: m.content, createdAt: m.createdAt })),
    profile: {
      nickname: profile.nickname,
      moodLevel: profile.moodLevel,
      moodTitle: moodTitleFor(profile.moodLevel).title,
      moodColor: moodTitleFor(profile.moodLevel).color,
      messageCount: profile.messageCount,
      patience: profile.patience,
    },
  });
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("sessionId");
  if (!isValidSessionId(sessionId)) {
    return Response.json({ error: "Missing sessionId" }, { status: 400 });
  }

  await db.delete(conversations).where(eq(conversations.sessionId, sessionId));
  await db
    .update(sessionProfiles)
    .set({
      nickname: null,
      messageCount: 0,
      moodLevel: 0,
      patience: 100,
      rememberedTopics: [],
      updatedAt: new Date(),
    })
    .where(eq(sessionProfiles.sessionId, sessionId));

  return Response.json({ ok: true, note: "Your file has been shredded. He remains suspicious of you." });
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { sessionId, message } = (body ?? {}) as { sessionId?: unknown; message?: unknown };

  if (!isValidSessionId(sessionId)) {
    return Response.json({ error: "Missing sessionId" }, { status: 400 });
  }
  if (typeof message !== "string" || message.trim().length === 0) {
    return Response.json({ error: "Message required, citizen." }, { status: 400 });
  }
  const trimmedMessage = message.trim().slice(0, 1000);

  const profile = await getOrCreateProfile(sessionId);

  const priorHistory = await db
    .select()
    .from(conversations)
    .where(eq(conversations.sessionId, sessionId))
    .orderBy(asc(conversations.createdAt))
    .limit(200);

  await db.insert(conversations).values({
    sessionId,
    role: "user",
    content: trimmedMessage,
  });

  const rememberedTopics = profile.rememberedTopics ?? [];
  const nickname = profile.nickname ?? pick(NICKNAMES);
  const newMoodLevel = profile.moodLevel + 1;
  const newPatience = Math.max(0, profile.patience - Math.floor(Math.random() * 12) - 3);

  let reply: string;
  let source: "groq" | "fallback" = "fallback";
  try {
    reply = await generateAlladeenReply({
      message: trimmedMessage,
      history: priorHistory.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      moodLevel: newMoodLevel,
      nickname,
      rememberedTopics,
    });
    source = "groq";
  } catch {
    reply = buildFallbackReply({
      message: trimmedMessage,
      moodLevel: newMoodLevel,
      rememberedTopics,
    });
  }

  await db.insert(conversations).values({
    sessionId,
    role: "assistant",
    content: reply,
  });

  const updatedTopics = [...rememberedTopics, extractTopic(trimmedMessage)].slice(-12);

  const [updatedProfile] = await db
    .update(sessionProfiles)
    .set({
      nickname,
      messageCount: profile.messageCount + 1,
      moodLevel: newMoodLevel,
      patience: newPatience,
      rememberedTopics: updatedTopics,
      updatedAt: new Date(),
    })
    .where(and(eq(sessionProfiles.sessionId, sessionId)))
    .returning();

  const moodMeta = moodTitleFor(updatedProfile.moodLevel);

  return Response.json({
    reply,
    source,
    profile: {
      nickname: updatedProfile.nickname,
      moodLevel: updatedProfile.moodLevel,
      moodTitle: moodMeta.title,
      moodColor: moodMeta.color,
      messageCount: updatedProfile.messageCount,
      patience: updatedProfile.patience,
    },
  });
}
