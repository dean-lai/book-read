import { GoogleGenerativeAI } from "@google/generative-ai";

export type SummarizeInput = {
  /** Optional hints when raw text does not include title/author */
  titleHint?: string;
  authorHint?: string;
  rawText: string;
};

const SYSTEM_PROMPT = `You are an expert nonfiction reader and editor.
Given raw notes or excerpts about a book, produce a polished Markdown summary.

Rules:
- If title or author are missing from the input, infer them from context when reasonable.
- Output MUST be valid Markdown with exactly these top-level sections (use ## for subsections under Summary if needed):
  # Summary
  ## Key Takeaways
  ## Detailed Analysis
- Tone: professional, clear, and insightful.
- Do not wrap the output in code fences.`;

const DEFAULT_MODEL = "gemini-2.5-flash";

export async function summarizeBookContent(
  input: SummarizeInput,
): Promise<{ summary: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const modelName = process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      temperature: 0.4,
    },
  });

  const hints =
    input.titleHint || input.authorHint
      ? `\nKnown hints — title: ${input.titleHint ?? "(none)"}, author: ${input.authorHint ?? "(none)"}.`
      : "";

  const userContent = `${hints}\n\n---\n\n${input.rawText}`.trim();

  const result = await model.generateContent(userContent);
  const summary = result.response.text().trim();
  if (!summary) {
    throw new Error("Gemini returned an empty summary");
  }

  return { summary };
}
