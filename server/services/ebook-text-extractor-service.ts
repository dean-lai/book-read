import EPub from "epub2";
import { PDFParse } from "pdf-parse";

const MAX_CHARS = 200_000;

function normalizeWhitespace(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/\u00a0/g, " ").trim();
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");
}

function clampText(text: string): string {
  if (text.length <= MAX_CHARS) {
    return text;
  }
  return `${text.slice(0, MAX_CHARS)}\n\n[...truncated for processing]`;
}

function toBuffer(file: File): Promise<Buffer> {
  return file.arrayBuffer().then((buf) => Buffer.from(buf));
}

async function extractFromPdf(file: File): Promise<string> {
  const buffer = await toBuffer(file);
  const parser = new PDFParse({ data: buffer });
  const parsed = await parser.getText();
  await parser.destroy();
  return normalizeWhitespace(parsed.text);
}

async function parseEpub(file: File): Promise<EPub> {
  const buffer = await toBuffer(file);
  const epub = new EPub(buffer as unknown as string);
  await new Promise<void>((resolve, reject) => {
    epub.on("error", reject);
    epub.on("end", resolve);
    epub.parse();
  });
  return epub;
}

function getEpubChapter(epub: EPub, chapterId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    epub.getChapter(chapterId, (error, text) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(text ?? "");
    });
  });
}

async function extractFromEpub(file: File): Promise<string> {
  const epub = await parseEpub(file);
  const chapterIds = (epub.flow ?? [])
    .map((chapter) => chapter.id)
    .filter((id): id is string => Boolean(id));

  const chapters = await Promise.all(chapterIds.map((id) => getEpubChapter(epub, id)));
  return normalizeWhitespace(chapters.map(stripHtml).join("\n\n"));
}

async function extractFromPlainText(file: File): Promise<string> {
  const text = await file.text();
  return normalizeWhitespace(text);
}

export function supportedBookExtensions(): string[] {
  return [".epub", ".pdf", ".txt", ".md", ".markdown"];
}

export async function extractBookText(
  file: File,
  options?: { truncateForSummary?: boolean },
): Promise<string> {
  const ext = file.name.toLowerCase().split(".").pop();
  const normalizedExt = ext ? `.${ext}` : "";

  let extracted = "";
  switch (normalizedExt) {
    case ".epub":
      extracted = await extractFromEpub(file);
      break;
    case ".pdf":
      extracted = await extractFromPdf(file);
      break;
    case ".txt":
    case ".md":
    case ".markdown":
      extracted = await extractFromPlainText(file);
      break;
    default:
      throw new Error(
        `Unsupported file type. Use one of: ${supportedBookExtensions().join(", ")}`,
      );
  }

  if (!extracted.trim()) {
    throw new Error("Could not extract readable text from this file.");
  }

  if (options?.truncateForSummary === false) {
    return extracted;
  }

  return clampText(extracted);
}
