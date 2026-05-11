CREATE TABLE IF NOT EXISTS "chat_history" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "thread_id" uuid NOT NULL,
  "book_id" uuid REFERENCES "books"("id") ON DELETE SET NULL,
  "role" text NOT NULL,
  "content" text NOT NULL,
  "metadata" jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "chat_history_role_check" CHECK ("role" IN ('system', 'user', 'assistant'))
);

CREATE INDEX IF NOT EXISTS "chat_history_user_thread_idx"
  ON "chat_history" ("user_id", "thread_id", "created_at");

CREATE INDEX IF NOT EXISTS "chat_history_book_id_idx"
  ON "chat_history" ("book_id");

ALTER TABLE "chat_history" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chat_history_select_own"
  ON "chat_history"
  FOR SELECT
  TO authenticated
  USING (auth.uid() = "user_id");

CREATE POLICY "chat_history_insert_own"
  ON "chat_history"
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = "user_id");

GRANT SELECT, INSERT ON "chat_history" TO authenticated;
