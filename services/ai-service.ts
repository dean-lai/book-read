import OpenAI from "openai";

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

export async function summarizeBookContent(
  input: SummarizeInput,
): Promise<{ summary: string }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const client = new OpenAI({ apiKey });

  const hints =
    input.titleHint || input.authorHint
      ? `\nKnown hints — title: ${input.titleHint ?? "(none)"}, author: ${input.authorHint ?? "(none)"}.`
      : "";

  const userContent = `${hints}\n\n---\n\n${input.rawText}`.trim();

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userContent },
    ],
    temperature: 0.4,
  });

  const summary = completion.choices[0]?.message?.content?.trim();
  if (!summary) {
    throw new Error("OpenAI returned an empty summary");
  }

  return { summary };
}
