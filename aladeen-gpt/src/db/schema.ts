import { pgTable, text, timestamp, serial, varchar } from "drizzle-orm/pg-core";

export const chatSessions = pgTable("chat_sessions", {
  id: varchar("id", { length: 128 }).primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 128 }).notNull(),
  role: varchar("role", { length: 20 }).notNull(), // "user" | "assistant"
  content: text("content").notNull(),
  mood: varchar("mood", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
