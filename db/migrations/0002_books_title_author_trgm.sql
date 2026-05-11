-- Speeds up case-insensitive substring search on title / author (ILIKE '%…%').
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS "books_title_trgm_idx"
  ON "books"
  USING gin ("title" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "books_author_trgm_idx"
  ON "books"
  USING gin ("author" gin_trgm_ops);
