import "server-only";

import { francAll } from "franc";

import { markdownToPlainText } from "@/features/books/lib/summary-plain-text";
import type { SummaryContentLanguage } from "@/features/books/types/summary-content-language";

const MIN_CHARS_DETECT = 10;
const MIN_CHARS_TRUST = 80;
/** If the gap between #1 and #2 normalized scores is smaller than this, treat as ambiguous. */
const MIN_SCORE_GAP = 0.04;

function mapIso639ToSummary(iso: string): SummaryContentLanguage {
  if (iso === "eng") {
    return "en";
  }
  if (iso === "vie") {
    return "vi";
  }
  return "other";
}

/**
 * Resolve summary language: optional DB override wins; otherwise franc on stripped Markdown.
 * Short or ambiguous samples resolve to `other` (no EN/VI TTS) to avoid wrong-voice playback.
 */
export function resolveSummaryContentLanguage(
  contentLanguageOverride: string | null | undefined,
  descriptionMarkdown: string | null | undefined,
): SummaryContentLanguage {
  const o = contentLanguageOverride?.trim();
  if (o === "en" || o === "vi") {
    return o;
  }

  const plain = markdownToPlainText(descriptionMarkdown ?? "");
  if (plain.length < MIN_CHARS_DETECT) {
    return "other";
  }

  const tuples = francAll(plain.slice(0, 2048), { minLength: MIN_CHARS_DETECT });
  const top = tuples[0];
  if (!top || top[0] === "und") {
    return "other";
  }

  if (plain.length < MIN_CHARS_TRUST) {
    const lang = mapIso639ToSummary(top[0]);
    return lang === "other" ? "other" : lang;
  }

  const second = tuples[1];
  if (second && top[1] - second[1] < MIN_SCORE_GAP) {
    const a = mapIso639ToSummary(top[0]);
    const b = mapIso639ToSummary(second[0]);
    if (a === "en" && b === "vi") {
      return "other";
    }
    if (a === "vi" && b === "en") {
      return "other";
    }
  }

  return mapIso639ToSummary(top[0]);
}

/**
 * Guess the dominant language of extracted ebook text so summarization can
 * match the reader's language. Only returns `vi` when franc strongly favours
 * Vietnamese; otherwise `en` (including ambiguous or short samples).
 */
export function detectBookTextLanguageForSummary(rawText: string): "en" | "vi" {
  const plain = rawText.replace(/\s+/g, " ").trim();
  if (plain.length < MIN_CHARS_DETECT) {
    return "en";
  }

  const sample = plain.slice(0, 4096);
  const tuples = francAll(sample, { minLength: MIN_CHARS_DETECT });
  const top = tuples[0];
  if (!top || top[0] !== "vie") {
    return "en";
  }

  if (plain.length < MIN_CHARS_TRUST) {
    return "vi";
  }

  const second = tuples[1];
  if (
    second &&
    top[1] - second[1] < MIN_SCORE_GAP &&
    (second[0] === "eng" || mapIso639ToSummary(second[0]) === "en")
  ) {
    return "en";
  }

  return "vi";
}
