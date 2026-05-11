import type { SupabaseClient } from "@supabase/supabase-js";

const TABLE = "book_favorites" as const;

export async function listFavoriteBookIds(
  client: SupabaseClient,
): Promise<{ ok: true; ids: string[] } | { ok: false; message: string }> {
  const { data, error } = await client.from(TABLE).select("book_id");
  if (error) {
    return { ok: false, message: error.message };
  }
  const ids = (data ?? []).map((row) => String((row as { book_id: string }).book_id));
  return { ok: true, ids };
}

export async function listFavoriteBookIdsOrdered(
  client: SupabaseClient,
): Promise<
  { ok: true; ids: string[] } | { ok: false; message: string }
> {
  const { data, error } = await client
    .from(TABLE)
    .select("book_id, created_at")
    .order("created_at", { ascending: false });
  if (error) {
    return { ok: false, message: error.message };
  }
  const ids = (data ?? []).map((row) => String((row as { book_id: string }).book_id));
  return { ok: true, ids };
}

export async function insertFavorite(
  client: SupabaseClient,
  bookId: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const { error } = await client.from(TABLE).insert({ book_id: bookId });
  if (error) {
    return { ok: false, message: error.message };
  }
  return { ok: true };
}

export async function deleteFavoriteByBookId(
  client: SupabaseClient,
  bookId: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const { error } = await client.from(TABLE).delete().eq("book_id", bookId);
  if (error) {
    return { ok: false, message: error.message };
  }
  return { ok: true };
}
