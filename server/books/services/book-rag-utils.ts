import { createHash } from "crypto";

export const MAX_INGEST_CHARS = 1_200_000;
export const MAX_INGEST_CHUNKS = 1200;
export const CHUNK_SIZE_CHARS = 3200;
export const CHUNK_OVERLAP_CHARS = 400;

export type ChunkedText = {
  chunkIndex: number;
  content: string;
  contentHash: string;
  tokenCount: number;
};

export function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}

export function normalizeForChunking(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/\u00a0/g, " ").trim();
}

export function chunkBookText(rawText: string): ChunkedText[] {
  const text = normalizeForChunking(rawText);
  if (!text) {
    return [];
  }
  if (text.length > MAX_INGEST_CHARS) {
    throw new Error(
      `Book text is too large for ingestion (${text.length} chars, max ${MAX_INGEST_CHARS}).`,
    );
  }

  const chunks: ChunkedText[] = [];
  let index = 0;
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE_CHARS, text.length);
    const content = text.slice(start, end).trim();
    if (content) {
      const contentHash = createHash("sha256").update(content).digest("hex");
      chunks.push({
        chunkIndex: index++,
        content,
        contentHash,
        tokenCount: estimateTokenCount(content),
      });
    }
    if (end >= text.length) {
      break;
    }
    start = Math.max(0, end - CHUNK_OVERLAP_CHARS);
    if (chunks.length > MAX_INGEST_CHUNKS) {
      throw new Error(
        `Book created too many chunks (${chunks.length}). Reduce file size or increase chunk size.`,
      );
    }
  }
  return chunks;
}

/** Removes model-added chunk index markers like `[12]` from answer text. */
export function stripChunkBracketCitations(text: string): string {
  return text
    .replace(/\[\d+\]/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}
