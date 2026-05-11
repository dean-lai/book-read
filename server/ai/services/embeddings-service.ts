import { GoogleGenerativeAI } from "@google/generative-ai";

import { EMBEDDING_DIMENSIONS } from "@/db/schema";

const DEFAULT_EMBEDDING_MODEL = "gemini-embedding-2";

function normalizeDimensions(values: number[]): number[] {
  if (values.length === EMBEDDING_DIMENSIONS) {
    return values;
  }
  if (values.length > EMBEDDING_DIMENSIONS) {
    return values.slice(0, EMBEDDING_DIMENSIONS);
  }
  return [...values, ...new Array(EMBEDDING_DIMENSIONS - values.length).fill(0)];
}

function getEmbeddingModel(modelName: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  const client = new GoogleGenerativeAI(apiKey);
  return client.getGenerativeModel({ model: modelName });
}

export async function embedText(text: string): Promise<number[]> {
  const modelName =
    process.env.GEMINI_EMBEDDING_MODEL?.trim() || DEFAULT_EMBEDDING_MODEL;

  try {
    const model = getEmbeddingModel(modelName);
    const result = await model.embedContent(text);
    const values = result.embedding.values ?? [];
    if (!values.length) {
      throw new Error("Embedding model returned an empty vector.");
    }
    return normalizeDimensions(values);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Embedding model "${modelName}" failed: ${message}`,
    );
  }
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const vectors: number[][] = [];
  for (const text of texts) {
    vectors.push(await embedText(text));
  }
  return vectors;
}
