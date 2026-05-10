/**
 * Ingest an ebook file into chunk-level RAG storage for one book.
 *
 * Usage:
 *   BOOK_ID=<uuid> FILE_PATH=./path/to/book.epub pnpm ingest:book-rag
 */

import { readFile } from "fs/promises";
import { basename, resolve } from "path";

import { config } from "dotenv";

import {
  bookExceedsWordLimit,
  countWords,
  MAX_BOOK_UPLOAD_WORDS,
} from "../lib/book-upload-limits";
import { extractBookText } from "../server/services/ebook-text-extractor-service";
import { ingestBookRag } from "../server/services/rag-service";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

async function main() {
  const bookId = process.env.BOOK_ID?.trim();
  const filePath = process.env.FILE_PATH?.trim();
  if (!bookId) {
    throw new Error("BOOK_ID is required.");
  }
  if (!filePath) {
    throw new Error("FILE_PATH is required.");
  }

  const absolutePath = resolve(process.cwd(), filePath);
  const data = await readFile(absolutePath);
  const file = new File([data], basename(absolutePath), {
    type: "application/octet-stream",
  });

  console.log(`Extracting text from ${absolutePath} ...`);
  const rawText = await extractBookText(file, { truncateForSummary: false });
  if (bookExceedsWordLimit(rawText)) {
    throw new Error(
      `Book text must be at most ${MAX_BOOK_UPLOAD_WORDS} words (${countWords(rawText)} found).`,
    );
  }
  console.log(`Extracted ${rawText.length} chars. Ingesting chunks ...`);

  const { chunkCount } = await ingestBookRag({ bookId, rawText });
  console.log(`Done. Stored ${chunkCount} chunks for book ${bookId}.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
