import { count, desc, eq, isNull } from "drizzle-orm";

import { getDb } from "@/db";
import { books, categories } from "@/db/schema";

export type BookInsert = {
  title: string;
  author: string;
  description: string;
  categoryId: string | null;
};

export type BookRowWithCategory = {
  id: string;
  title: string;
  author: string;
  createdAt: Date;
  categoryName: string | null;
};

export async function insertBook(data: BookInsert): Promise<void> {
  const db = getDb();
  await db.insert(books).values({
    title: data.title,
    author: data.author,
    description: data.description,
    categoryId: data.categoryId,
  });
}

export async function updateBook(
  id: string,
  data: BookInsert,
): Promise<void> {
  const db = getDb();
  await db
    .update(books)
    .set({
      title: data.title,
      author: data.author,
      description: data.description,
      categoryId: data.categoryId,
    })
    .where(eq(books.id, id));
}

export async function deleteBook(id: string): Promise<void> {
  const db = getDb();
  await db.delete(books).where(eq(books.id, id));
}

export async function countBooks(): Promise<number> {
  const db = getDb();
  const [row] = await db.select({ n: count() }).from(books);
  return Number(row?.n ?? 0);
}

export async function countBooksMissingEmbedding(): Promise<number> {
  const db = getDb();
  const [row] = await db
    .select({ n: count() })
    .from(books)
    .where(isNull(books.embedding));
  return Number(row?.n ?? 0);
}

export async function listRecentWithCategory(
  limit: number,
): Promise<BookRowWithCategory[]> {
  const db = getDb();
  return db
    .select({
      id: books.id,
      title: books.title,
      author: books.author,
      createdAt: books.createdAt,
      categoryName: categories.name,
    })
    .from(books)
    .leftJoin(categories, eq(books.categoryId, categories.id))
    .orderBy(desc(books.createdAt))
    .limit(limit);
}

export async function listBooksWithCategory(): Promise<BookRowWithCategory[]> {
  const db = getDb();
  return db
    .select({
      id: books.id,
      title: books.title,
      author: books.author,
      createdAt: books.createdAt,
      categoryName: categories.name,
    })
    .from(books)
    .leftJoin(categories, eq(books.categoryId, categories.id))
    .orderBy(desc(books.createdAt));
}
