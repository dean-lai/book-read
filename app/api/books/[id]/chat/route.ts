import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import {
  appendChatMessage,
  CHAT_DAILY_USER_MESSAGE_LIMIT,
  countTodayUserMessages,
  findCachedAssistantReply,
  loadChatThread,
} from "@/server/books/repositories/chat-repository";
import { stripChunkBracketCitations } from "@/server/books/services/book-rag-utils";
import { queryBookRag } from "@/server/books/services/rag-service";

const idParamSchema = z.string().uuid();
const threadQuerySchema = z.string().uuid();

const postBodySchema = z.object({
  message: z.string().trim().min(1).max(4000),
  threadId: z.string().uuid(),
});

async function requireUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id: rawId } = await context.params;
  const bookIdParsed = idParamSchema.safeParse(rawId);
  if (!bookIdParsed.success) {
    return NextResponse.json({ error: "invalid_book_id" }, { status: 400 });
  }
  const bookId = bookIdParsed.data;

  const { searchParams } = new URL(_request.url);
  const threadParsed = threadQuerySchema.safeParse(
    searchParams.get("threadId") ?? "",
  );
  if (!threadParsed.success) {
    return NextResponse.json({ error: "invalid_thread_id" }, { status: 400 });
  }
  const threadId = threadParsed.data;

  try {
    const [messages, questionsUsedToday] = await Promise.all([
      loadChatThread(userId, bookId, threadId),
      countTodayUserMessages(userId, bookId),
    ]);
    const messagesOut = messages.map((m) =>
      m.role === "assistant"
        ? { ...m, content: stripChunkBracketCitations(m.content) }
        : m,
    );
    return NextResponse.json({
      messages: messagesOut,
      questionsUsedToday,
      questionsLimit: CHAT_DAILY_USER_MESSAGE_LIMIT,
    });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id: rawId } = await context.params;
  const bookIdParsed = idParamSchema.safeParse(rawId);
  if (!bookIdParsed.success) {
    return NextResponse.json({ error: "invalid_book_id" }, { status: 400 });
  }
  const bookId = bookIdParsed.data;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = postBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const { message, threadId } = parsed.data;

  try {
    const used = await countTodayUserMessages(userId, bookId);
    if (used >= CHAT_DAILY_USER_MESSAGE_LIMIT) {
      return NextResponse.json(
        {
          error: "rate_limit",
          questionsUsedToday: used,
          questionsLimit: CHAT_DAILY_USER_MESSAGE_LIMIT,
        },
        { status: 429 },
      );
    }

    const cached = await findCachedAssistantReply(userId, bookId, message);
    if (cached) {
      return NextResponse.json({
        reply: stripChunkBracketCitations(cached.reply),
        citations: [],
        threadId,
        fromCache: true,
        questionsUsedToday: used,
        questionsLimit: CHAT_DAILY_USER_MESSAGE_LIMIT,
      });
    }

    await appendChatMessage({
      userId,
      threadId,
      bookId,
      role: "user",
      content: message,
    });

    let reply: string;
    try {
      const rag = await queryBookRag({ bookId, userId, message });
      reply = rag.reply;
    } catch (err) {
      const messageText =
        err instanceof Error ? err.message : "RAG request failed.";
      return NextResponse.json(
        { error: "rag_failed", message: messageText },
        { status: 503 },
      );
    }

    const replyClean = stripChunkBracketCitations(reply);

    await appendChatMessage({
      userId,
      threadId,
      bookId,
      role: "assistant",
      content: replyClean,
      metadata: null,
    });

    const questionsUsedToday = await countTodayUserMessages(userId, bookId);

    return NextResponse.json({
      reply: replyClean,
      citations: [],
      threadId,
      fromCache: false,
      questionsUsedToday,
      questionsLimit: CHAT_DAILY_USER_MESSAGE_LIMIT,
    });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
