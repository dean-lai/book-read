import { and, asc, count, desc, eq, gt, sql } from "drizzle-orm";

import { getDb } from "@/db";
import { chatHistory } from "@/db/schema";

export const CHAT_DAILY_USER_MESSAGE_LIMIT = 15;

export type ChatCitation = { chunkIndex: number; score: number };

export type ChatThreadMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
  metadata: Record<string, unknown> | null;
};

export function normalizeChatMessageText(content: string): string {
  return content.trim().toLowerCase();
}

function parseCitations(metadata: unknown): ChatCitation[] {
  if (!metadata || typeof metadata !== "object") return [];
  const raw = (metadata as { citations?: unknown }).citations;
  if (!Array.isArray(raw)) return [];
  const out: ChatCitation[] = [];
  for (const item of raw) {
    if (
      typeof item === "object" &&
      item !== null &&
      "chunkIndex" in item &&
      typeof (item as { chunkIndex: unknown }).chunkIndex === "number"
    ) {
      const score = Number((item as { score?: unknown }).score);
      out.push({
        chunkIndex: (item as { chunkIndex: number }).chunkIndex,
        score: Number.isFinite(score) ? score : 0,
      });
    }
  }
  return out;
}

export async function loadChatThread(
  userId: string,
  bookId: string,
  threadId: string,
): Promise<ChatThreadMessage[]> {
  const db = getDb();
  const rows = await db
    .select({
      id: chatHistory.id,
      role: chatHistory.role,
      content: chatHistory.content,
      createdAt: chatHistory.createdAt,
      metadata: chatHistory.metadata,
    })
    .from(chatHistory)
    .where(
      and(
        eq(chatHistory.userId, userId),
        eq(chatHistory.bookId, bookId),
        eq(chatHistory.threadId, threadId),
      ),
    )
    .orderBy(asc(chatHistory.createdAt));

  return rows.map((r) => ({
    id: r.id,
    role: r.role as ChatThreadMessage["role"],
    content: r.content,
    createdAt: r.createdAt.toISOString(),
    metadata: (r.metadata as Record<string, unknown> | null) ?? null,
  }));
}

export async function appendChatMessage(input: {
  userId: string;
  threadId: string;
  bookId: string;
  role: ChatThreadMessage["role"];
  content: string;
  metadata?: Record<string, unknown> | null;
}): Promise<string> {
  const db = getDb();
  const [row] = await db
    .insert(chatHistory)
    .values({
      userId: input.userId,
      threadId: input.threadId,
      bookId: input.bookId,
      role: input.role,
      content: input.content,
      metadata: input.metadata ?? null,
    })
    .returning({ id: chatHistory.id });
  if (!row) {
    throw new Error("Failed to insert chat message.");
  }
  return row.id;
}

export async function countTodayUserMessages(
  userId: string,
  bookId: string,
): Promise<number> {
  const db = getDb();
  const [row] = await db
    .select({ n: count() })
    .from(chatHistory)
    .where(
      and(
        eq(chatHistory.userId, userId),
        eq(chatHistory.bookId, bookId),
        eq(chatHistory.role, "user"),
        sql`${chatHistory.createdAt} >= now() - interval '24 hours'`,
      ),
    );
  return Number(row?.n ?? 0);
}

/**
 * Prior answer for the same normalized user text on this book (any thread).
 * Returns the assistant message that immediately followed the latest matching user row.
 */
export async function findCachedAssistantReply(
  userId: string,
  bookId: string,
  userMessage: string,
): Promise<{ reply: string; citations: ChatCitation[] } | null> {
  const db = getDb();
  const norm = normalizeChatMessageText(userMessage);
  const [latestUser] = await db
    .select({
      createdAt: chatHistory.createdAt,
      threadId: chatHistory.threadId,
    })
    .from(chatHistory)
    .where(
      and(
        eq(chatHistory.userId, userId),
        eq(chatHistory.bookId, bookId),
        eq(chatHistory.role, "user"),
        sql`lower(trim(${chatHistory.content})) = ${norm}`,
      ),
    )
    .orderBy(desc(chatHistory.createdAt))
    .limit(1);

  if (!latestUser) {
    return null;
  }

  const [assistant] = await db
    .select({
      content: chatHistory.content,
      metadata: chatHistory.metadata,
    })
    .from(chatHistory)
    .where(
      and(
        eq(chatHistory.userId, userId),
        eq(chatHistory.threadId, latestUser.threadId),
        eq(chatHistory.role, "assistant"),
        gt(chatHistory.createdAt, latestUser.createdAt),
      ),
    )
    .orderBy(asc(chatHistory.createdAt))
    .limit(1);

  if (!assistant?.content) {
    return null;
  }

  return {
    reply: assistant.content,
    citations: parseCitations(assistant.metadata),
  };
}
