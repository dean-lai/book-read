import { count, desc, eq, inArray, isNull, sql } from "drizzle-orm";

import { getDb } from "@/db";
import { EMBEDDING_DIMENSIONS, bookChunks, books, categories } from "@/db/schema";

export type BookInsert = {
  title: string;
  author: string;
  description: string;
  categoryId: string | null;
  /** Omit on update to leave the existing cover unchanged. */
  coverUrl?: string | null;
  /** Omit or null to use auto-detection on the book detail page. */
  contentLanguageOverride?: "en" | "vi" | null;
};

export type BookRowWithCategory = {
  id: string;
  title: string;
  author: string;
  coverUrl: string | null;
  createdAt: Date;
  categoryName: string | null;
};

export type BookDetailRow = {
  id: string;
  title: string;
  author: string;
  coverUrl: string | null;
  description: string | null;
  contentLanguageOverride: string | null;
  categoryName: string | null;
};

export type BookChunkInsert = {
  chunkIndex: number;
  content: string;
  contentHash: string;
  tokenCount: number;
  embedding: number[];
};

export type BookChunkMatch = {
  id: string;
  chunkIndex: number;
  content: string;
  score: number;
};

/** Escape `%`, `_`, and `!` for `ILIKE … ESCAPE '!'` (Postgres). */
function escapeIlikePattern(value: string): string {
  return value.replace(/!/g, "!!").replace(/%/g, "!%").replace(/_/g, "!_");
}

export async function insertBook(data: BookInsert): Promise<string> {
  const db = getDb();
  const [inserted] = await db
    .insert(books)
    .values({
      title: data.title,
      author: data.author,
      description: data.description,
      categoryId: data.categoryId,
      coverUrl: data.coverUrl ?? null,
      contentLanguageOverride: data.contentLanguageOverride ?? null,
    })
    .returning({ id: books.id });
  return inserted.id;
}

export async function replaceBookChunks(
  bookId: string,
  chunks: BookChunkInsert[],
): Promise<void> {
  const db = getDb();
  await db.transaction(async (tx) => {
    await tx.delete(bookChunks).where(eq(bookChunks.bookId, bookId));
    if (chunks.length === 0) {
      return;
    }
    await tx.insert(bookChunks).values(
      chunks.map((chunk) => ({
        bookId,
        chunkIndex: chunk.chunkIndex,
        content: chunk.content,
        contentHash: chunk.contentHash,
        tokenCount: chunk.tokenCount,
        embedding: chunk.embedding,
      })),
    );
  });
}

export async function countBookChunks(bookId: string): Promise<number> {
  const db = getDb();
  const [row] = await db
    .select({ n: count() })
    .from(bookChunks)
    .where(eq(bookChunks.bookId, bookId));
  return Number(row?.n ?? 0);
}

export async function searchBookChunksByVector(
  bookId: string,
  queryEmbedding: number[],
  limit: number,
): Promise<BookChunkMatch[]> {
  const db = getDb();
  const take = Math.max(1, Math.min(limit, 20));
  const vectorLiteral = `[${queryEmbedding.slice(0, EMBEDDING_DIMENSIONS).join(",")}]`;

  const rows = await db.execute(sql`
    SELECT
      ${bookChunks.id} AS id,
      ${bookChunks.chunkIndex} AS chunk_index,
      ${bookChunks.content} AS content,
      (1 - (${bookChunks.embedding} <=> ${vectorLiteral}::vector)) AS score
    FROM ${bookChunks}
    WHERE ${bookChunks.bookId} = ${bookId}
    ORDER BY ${bookChunks.embedding} <=> ${vectorLiteral}::vector
    LIMIT ${take}
  `);

  return rows.rows.map((row) => ({
    id: String(row.id),
    chunkIndex: Number(row.chunk_index),
    content: String(row.content),
    score: Number(row.score),
  }));
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
      ...(data.coverUrl !== undefined ? { coverUrl: data.coverUrl } : {}),
      ...(data.contentLanguageOverride !== undefined
        ? { contentLanguageOverride: data.contentLanguageOverride }
        : {}),
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
      coverUrl: books.coverUrl,
      createdAt: books.createdAt,
      categoryName: categories.name,
    })
    .from(books)
    .leftJoin(categories, eq(books.categoryId, categories.id))
    .orderBy(desc(books.createdAt))
    .limit(limit);
}

export async function listBooksByIdsOrdered(
  ids: string[],
): Promise<BookRowWithCategory[]> {
  if (ids.length === 0) {
    return [];
  }
  const db = getDb();
  const rows = await db
    .select({
      id: books.id,
      title: books.title,
      author: books.author,
      coverUrl: books.coverUrl,
      createdAt: books.createdAt,
      categoryName: categories.name,
    })
    .from(books)
    .leftJoin(categories, eq(books.categoryId, categories.id))
    .where(inArray(books.id, ids));
  const byId = new Map(rows.map((r) => [r.id, r]));
  return ids
    .map((id) => byId.get(id))
    .filter((r): r is BookRowWithCategory => r != null);
}

export async function getBookByIdWithCategory(
  id: string,
): Promise<BookDetailRow | null> {
  const db = getDb();
  const rows = await db
    .select({
      id: books.id,
      title: books.title,
      author: books.author,
      coverUrl: books.coverUrl,
      description: books.description,
      contentLanguageOverride: books.contentLanguageOverride,
      categoryName: categories.name,
    })
    .from(books)
    .leftJoin(categories, eq(books.categoryId, categories.id))
    .where(eq(books.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function listBooksWithCategory(options?: {
  search?: string | null;
}): Promise<BookRowWithCategory[]> {
  const db = getDb();
  const trimmed = options?.search?.trim() ?? "";
  const base = db
    .select({
      id: books.id,
      title: books.title,
      author: books.author,
      coverUrl: books.coverUrl,
      createdAt: books.createdAt,
      categoryName: categories.name,
    })
    .from(books)
    .leftJoin(categories, eq(books.categoryId, categories.id));

  if (!trimmed) {
    return base.orderBy(desc(books.createdAt));
  }

  const pattern = `%${escapeIlikePattern(trimmed)}%`;
  return base
    .where(
      sql`(${books.title} ILIKE ${pattern} ESCAPE '!' OR ${books.author} ILIKE ${pattern} ESCAPE '!')`,
    )
    .orderBy(desc(books.createdAt));
}
