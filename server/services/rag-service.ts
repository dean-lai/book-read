/**
 * Vector search and chat over book embeddings (pgvector + LLM).
 */

export type RagQueryInput = {
  bookId: string;
  userId: string;
  message: string;
};

export async function queryBookRag(
  input: RagQueryInput,
): Promise<{ reply: string }> {
  void input;
  throw new Error("rag-service: queryBookRag not implemented");
}
