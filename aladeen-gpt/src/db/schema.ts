import { integer, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

// Every message ever spoken to (and grunted back by) His Excellency.
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  role: text("role").notNull(), // "user" | "assistant"
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Long-term "intel" the regime keeps on every citizen (session) so it can
// mock them with perfect recall later.
export const sessionProfiles = pgTable("session_profiles", {
  sessionId: text("session_id").primaryKey(),
  nickname: text("nickname"),
  messageCount: integer("message_count").default(0).notNull(),
  moodLevel: integer("mood_level").default(0).notNull(),
  patience: integer("patience").default(100).notNull(),
  rememberedTopics: jsonb("remembered_topics").$type<string[]>().default([]).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
