import assert from "node:assert/strict";
import test from "node:test";

import {
  bookExceedsWordLimit,
  countWords,
  MAX_BOOK_UPLOAD_WORDS,
} from "@/lib/book-upload-limits";
import {
  CHUNK_OVERLAP_CHARS,
  CHUNK_SIZE_CHARS,
  chunkBookText,
} from "@/server/books/services/book-rag-utils";

test("chunkBookText returns overlapping chunks in order", () => {
  const source = "a".repeat(CHUNK_SIZE_CHARS + 500);
  const chunks = chunkBookText(source);

  assert.equal(chunks.length, 2);
  assert.equal(chunks[0].chunkIndex, 0);
  assert.equal(chunks[1].chunkIndex, 1);
  assert.ok(chunks[0].content.length <= CHUNK_SIZE_CHARS);

  const overlapFromFirst = chunks[0].content.slice(-CHUNK_OVERLAP_CHARS);
  assert.equal(chunks[1].content.slice(0, CHUNK_OVERLAP_CHARS), overlapFromFirst);
});

test("chunkBookText rejects empty input", () => {
  const chunks = chunkBookText("   \n  ");
  assert.equal(chunks.length, 0);
});

test("countWords splits on whitespace", () => {
  assert.equal(countWords("one two three"), 3);
  assert.equal(countWords("  a \n b\tc  "), 3);
});

test("bookExceedsWordLimit uses MAX_BOOK_UPLOAD_WORDS", () => {
  const ok = Array.from({ length: MAX_BOOK_UPLOAD_WORDS }, () => "w").join(" ");
  assert.equal(bookExceedsWordLimit(ok), false);
  const over = `${ok} extra`;
  assert.equal(bookExceedsWordLimit(over), true);
});
