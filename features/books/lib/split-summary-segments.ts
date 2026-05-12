/** Split on sentence boundaries for speechSynthesis segment navigation. */
const SENTENCE_SPLIT_FALLBACK = /(?<=[.!?…。！？])\s+/u;

/**
 * Split normalized plain text into segments for TTS transport (rewind / fast-forward).
 * Prefers `Intl.Segmenter` when available; otherwise regex split (Vietnamese punctuation included).
 */
export function splitPlainTextIntoSpeechSegments(
  plainText: string,
  contentLang: "en" | "vi",
): string[] {
  const t = plainText.replace(/\s+/gu, " ").trim();
  if (!t) {
    return [];
  }

  const SegmenterCtor = (
    globalThis as typeof globalThis & {
      Intl?: typeof Intl & {
        Segmenter?: typeof Intl.Segmenter;
      };
    }
  ).Intl?.Segmenter;

  if (typeof SegmenterCtor === "function") {
    try {
      const loc = contentLang === "vi" ? "vi-VN" : "en-US";
      const segmenter = new SegmenterCtor(loc, { granularity: "sentence" });
      const parts: string[] = [];
      for (const seg of segmenter.segment(t) as Iterable<{ segment: string }>) {
        const s = seg.segment.trim();
        if (s) {
          parts.push(s);
        }
      }
      if (parts.length > 0) {
        return parts;
      }
    } catch {
      // fall through
    }
  }

  return t
    .split(SENTENCE_SPLIT_FALLBACK)
    .map((s) => s.trim())
    .filter(Boolean);
}
