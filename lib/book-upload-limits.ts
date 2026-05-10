/** Maximum extracted book length for admin upload (summary generation + RAG ingest). */
export const MAX_BOOK_UPLOAD_WORDS = 5000;

export function countWords(text: string): number {
  const t = text.trim().replace(/\r\n/g, "\n").replace(/\u00a0/g, " ");
  if (!t) {
    return 0;
  }
  return t.split(/\s+/).filter(Boolean).length;
}

export function bookExceedsWordLimit(text: string): boolean {
  return countWords(text) > MAX_BOOK_UPLOAD_WORDS;
}
