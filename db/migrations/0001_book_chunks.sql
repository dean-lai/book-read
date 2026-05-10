CREATE TABLE IF NOT EXISTS "book_chunks" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "book_id" uuid NOT NULL REFERENCES "books"("id") ON DELETE CASCADE,
  "chunk_index" integer NOT NULL,
  "content" text NOT NULL,
  "content_hash" text NOT NULL,
  "token_count" integer,
  "embedding" vector(1536) NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "book_chunks_book_id_chunk_index_idx"
  ON "book_chunks" ("book_id", "chunk_index");

CREATE INDEX IF NOT EXISTS "book_chunks_embedding_idx"
  ON "book_chunks"
  USING hnsw ("embedding" vector_cosine_ops);

CREATE UNIQUE INDEX IF NOT EXISTS "book_chunks_book_id_content_hash_key"
  ON "book_chunks" ("book_id", "content_hash");
