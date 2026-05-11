"use server";

import { createClient } from "@/lib/supabase/server";
import {
  setBookFavorite,
  type SetBookFavoriteResult,
} from "@/server/favorites/services/book-favorites-service";

export async function setBookFavoriteAction(
  bookId: string,
  favorited: boolean,
): Promise<SetBookFavoriteResult> {
  const supabase = await createClient();
  return setBookFavorite(supabase, bookId, favorited);
}
