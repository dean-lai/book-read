CREATE TABLE IF NOT EXISTS "book_favorites" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL DEFAULT auth.uid(),
  "book_id" uuid NOT NULL REFERENCES "books"("id") ON DELETE CASCADE,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "book_favorites_user_id_book_id_key" UNIQUE ("user_id", "book_id")
);

CREATE INDEX IF NOT EXISTS "book_favorites_user_id_idx"
  ON "book_favorites" ("user_id");

ALTER TABLE "book_favorites" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "book_favorites_select_own"
  ON "book_favorites"
  FOR SELECT
  TO authenticated
  USING (auth.uid() = "user_id");

CREATE POLICY "book_favorites_insert_own"
  ON "book_favorites"
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = "user_id");

CREATE POLICY "book_favorites_delete_own"
  ON "book_favorites"
  FOR DELETE
  TO authenticated
  USING (auth.uid() = "user_id");

GRANT SELECT, INSERT, DELETE ON "book_favorites" TO authenticated;
