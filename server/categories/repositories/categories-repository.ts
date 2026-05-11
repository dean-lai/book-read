import { and, asc, eq, ne } from "drizzle-orm";

import { getDb } from "@/db";
import { categories } from "@/db/schema";

export type CategoryInsert = {
  name: string;
  slug: string;
};

export async function insertCategory(data: CategoryInsert): Promise<void> {
  const db = getDb();
  await db.insert(categories).values({
    name: data.name,
    slug: data.slug,
  });
}

export async function updateCategory(
  id: string,
  data: CategoryInsert,
): Promise<void> {
  const db = getDb();
  await db
    .update(categories)
    .set({ name: data.name, slug: data.slug })
    .where(eq(categories.id, id));
}

export async function deleteCategory(id: string): Promise<void> {
  const db = getDb();
  await db.delete(categories).where(eq(categories.id, id));
}

export async function listCategories(): Promise<
  { id: string; name: string }[]
> {
  const db = getDb();
  return db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .orderBy(asc(categories.name));
}

/** True if another row already uses this slug (excluding `excludeId` when set). */
export async function isSlugTaken(
  slug: string,
  excludeCategoryId?: string,
): Promise<boolean> {
  const db = getDb();
  const whereClause = excludeCategoryId
    ? and(
        eq(categories.slug, slug),
        ne(categories.id, excludeCategoryId),
      )
    : eq(categories.slug, slug);
  const row = await db
    .select({ id: categories.id })
    .from(categories)
    .where(whereClause)
    .limit(1);
  return row.length > 0;
}
