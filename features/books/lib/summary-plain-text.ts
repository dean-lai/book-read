/**
 * Strip Markdown-ish syntax for language detection and TTS.
 * Best-effort (not a full Markdown parser); avoids importing heavy deps on the client.
 */
export function markdownToPlainText(markdown: string): string {
  let text = markdown.trim();
  if (!text) {
    return "";
  }

  // fenced code blocks
  text = text.replace(/```[\s\S]*?```/g, " ");
  text = text.replace(/`[^`]*`/g, " ");

  // images ![alt](url) -> alt
  text = text.replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1 ");
  // links [text](url) -> text
  text = text.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1 ");

  // headings, blockquotes, list markers
  text = text.replace(/^#{1,6}\s+/gm, "");
  text = text.replace(/^>\s?/gm, "");
  text = text.replace(/^\s*[-*+]\s+/gm, "");
  text = text.replace(/^\s*\d+\.\s+/gm, "");

  // emphasis / strikethrough
  text = text.replace(/\*\*([^*]+)\*\*/g, "$1");
  text = text.replace(/\*([^*]+)\*/g, "$1");
  text = text.replace(/__([^_]+)__/g, "$1");
  text = text.replace(/_([^_]+)_/g, "$1");
  text = text.replace(/~~([^~]+)~~/g, "$1");

  // strip remaining angle-url fragments
  text = text.replace(/<[^>]+>/g, " ");

  text = text.replace(/[#*_`~>[\]()]/g, " ");
  text = text.replace(/\s+/g, " ").trim();
  return text;
}
