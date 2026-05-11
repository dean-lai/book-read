/**
 * Vector search and chat over book embeddings (pgvector + LLM).
 */
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

import { embedText, embedTexts } from "@/server/ai/services/embeddings-service";
import {
  countBookChunks,
  replaceBookChunks,
  searchBookChunksByVector,
} from "@/server/books/repositories/books-repository";
import { chunkBookText } from "@/server/books/services/book-rag-utils";

export type RagQueryInput = {
  bookId: string;
  userId: string;
  message: string;
};

export type IngestBookRagInput = {
  bookId: string;
  rawText: string;
};

const querySchema = z.object({
  bookId: z.string().uuid(),
  userId: z.string().uuid(),
  message: z.string().min(1, "Message is required"),
});

const ingestSchema = z.object({
  bookId: z.string().uuid(),
  rawText: z.string().min(1, "Raw text is required"),
});

const RAG_MODEL = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
const MIN_CONFIDENCE = 0.45;

function getChatModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  const client = new GoogleGenerativeAI(apiKey);
  return client.getGenerativeModel({ model: RAG_MODEL });
}

export async function ingestBookRag(input: IngestBookRagInput): Promise<{
  chunkCount: number;
}> {
  const parsed = ingestSchema.parse(input);
  const chunks = chunkBookText(parsed.rawText);
  if (!chunks.length) {
    throw new Error("Book text could not be chunked.");
  }

  const vectors = await embedTexts(chunks.map((chunk) => chunk.content));
  await replaceBookChunks(
    parsed.bookId,
    chunks.map((chunk, i) => ({
      ...chunk,
      embedding: vectors[i],
    })),
  );

  return { chunkCount: chunks.length };
}

export async function queryBookRag(
  input: RagQueryInput,
): Promise<{ reply: string; citations: Array<{ chunkIndex: number; score: number }> }> {
  const parsed = querySchema.parse(input);
  const chunkCount = await countBookChunks(parsed.bookId);
  if (chunkCount === 0) {
    return {
      reply:
        "I do not have indexed content for this book yet. Please run ingestion first.",
      citations: [],
    };
  }

  const queryVector = await embedText(parsed.message);
  const matches = await searchBookChunksByVector(parsed.bookId, queryVector, 8);
  const strongMatches = matches.filter((m) => m.score >= MIN_CONFIDENCE).slice(0, 5);

  if (!strongMatches.length) {
    return {
      reply:
        "I could not find enough evidence in this book context to answer confidently.",
      citations: [],
    };
  }

  const context = strongMatches
    .map(
      (match) =>
        `Chunk ${match.chunkIndex} (score ${match.score.toFixed(3)}):\n${match.content}`,
    )
    .join("\n\n---\n\n");

  const model = getChatModel();
  const prompt = `
You answer user questions strictly from provided book context.
If the answer is not clearly present in context, say you cannot find it.
Be concise and cite chunk numbers in square brackets like [12].

Question:
${parsed.message}

Book context:
${context}
`.trim();

  const completion = await model.generateContent(prompt);
  const reply = completion.response.text().trim();
  if (!reply) {
    throw new Error("RAG model returned an empty response.");
  }

  return {
    reply,
    citations: strongMatches.map((m) => ({
      chunkIndex: m.chunkIndex,
      score: m.score,
    })),
  };
}
