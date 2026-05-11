import type { SupabaseClient } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import {
  listBooksByIdsOrdered,
  type BookRowWithCategory,
} from "@/server/books/repositories/books-repository";
import {
  deleteFavoriteByBookId,
  insertFavorite,
  listFavoriteBookIds,
  listFavoriteBookIdsOrdered,
} from "@/server/favorites/repositories/book-favorites-repository";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type SetBookFavoriteResult =
  | { ok: true }
  | { ok: false; code: "unauthorized" | "invalid_book_id" | "db" };

export async function getHomeFavoritesBootstrap(): Promise<{
  isLoggedIn: boolean;
  favoriteBookIds: string[];
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { isLoggedIn: false, favoriteBookIds: [] };
  }
  const listed = await listFavoriteBookIds(supabase);
  if (!listed.ok) {
    return { isLoggedIn: true, favoriteBookIds: [] };
  }
  return { isLoggedIn: true, favoriteBookIds: listed.ids };
}

export async function setBookFavorite(
  supabase: SupabaseClient,
  bookId: string,
  favorited: boolean,
): Promise<SetBookFavoriteResult> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, code: "unauthorized" };
  }
  if (!UUID_RE.test(bookId)) {
    return { ok: false, code: "invalid_book_id" };
  }
  if (favorited) {
    const inserted = await insertFavorite(supabase, bookId);
    if (!inserted.ok) {
      return { ok: false, code: "db" };
    }
    return { ok: true };
  }
  const removed = await deleteFavoriteByBookId(supabase, bookId);
  if (!removed.ok) {
    return { ok: false, code: "db" };
  }
  return { ok: true };
}

export type FavoritesPageData =
  | { kind: "guest" }
  | { kind: "error" }
  | { kind: "ok"; books: BookRowWithCategory[] };

export async function getFavoritesPageCatalog(): Promise<FavoritesPageData> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { kind: "guest" };
  }
  const listed = await listFavoriteBookIdsOrdered(supabase);
  if (!listed.ok) {
    return { kind: "error" };
  }
  if (listed.ids.length === 0) {
    return { kind: "ok", books: [] };
  }
  const books = await listBooksByIdsOrdered(listed.ids);
  return { kind: "ok", books };
}
