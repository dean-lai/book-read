import { sql } from "drizzle-orm";
import {
  check,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  integer,
  vector,
} from "drizzle-orm/pg-core";

/** Match your embedding model (e.g. OpenAI text-embedding-3-small / ada-002). */
export const EMBEDDING_DIMENSIONS = 1536;

/**
 */
const asCheckSql = <T>(expr: T): Parameters<typeof check>[1] =>
  expr as unknown as Parameters<typeof check>[1];

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("categories_slug_key").on(t.slug)],
);

export const books = pgTable(
  "books",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    author: text("author").notNull(),
    coverUrl: text("cover_url"),
    description: text("description"),
    totalPages: integer("total_pages"),
    publishedYear: integer("published_year"),
    genre: text("genre"),
    categoryId: uuid("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    embedding: vector("embedding", { dimensions: EMBEDDING_DIMENSIONS }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("books_category_id_idx").on(t.categoryId)],
);

export const bookChunks = pgTable(
  "book_chunks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    chunkIndex: integer("chunk_index").notNull(),
    content: text("content").notNull(),
    contentHash: text("content_hash").notNull(),
    tokenCount: integer("token_count"),
    embedding: vector("embedding", { dimensions: EMBEDDING_DIMENSIONS }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("book_chunks_book_id_chunk_index_idx").on(t.bookId, t.chunkIndex),
    index("book_chunks_embedding_idx").using("hnsw", t.embedding.op("vector_cosine_ops")),
    uniqueIndex("book_chunks_book_id_content_hash_key").on(t.bookId, t.contentHash),
  ],
);

export const userBooks = pgTable(
  "user_books",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("want_to_read"),
    currentPage: integer("current_page").notNull().default(0),
    startedAt: timestamp("started_at", { withTimezone: true }),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("user_books_user_id_book_id_key").on(t.userId, t.bookId),
    check(
      "user_books_status_check",
      asCheckSql(
        sql`${t.status} IN ('want_to_read', 'reading', 'completed', 'abandoned')`,
      ),
    ),
  ],
);

export const bookmarks = pgTable(
  "bookmarks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    pageNumber: integer("page_number").notNull(),
    label: text("label"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("bookmarks_user_book_idx").on(t.userId, t.bookId)],
);

export const highlights = pgTable(
  "highlights",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    pageNumber: integer("page_number").notNull(),
    selectedText: text("selected_text").notNull(),
    note: text("note"),
    color: text("color").notNull().default("yellow"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("highlights_user_book_idx").on(t.userId, t.bookId),
    check(
      "highlights_color_check",
      asCheckSql(sql`${t.color} IN ('yellow', 'green', 'blue', 'pink')`),
    ),
  ],
);

export const chatHistory = pgTable(
  "chat_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    threadId: uuid("thread_id").notNull(),
    bookId: uuid("book_id").references(() => books.id, {
      onDelete: "set null",
    }),
    role: text("role").notNull(),
    content: text("content").notNull(),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("chat_history_user_thread_idx").on(
      t.userId,
      t.threadId,
      t.createdAt,
    ),
    index("chat_history_book_id_idx").on(t.bookId),
    check(
      "chat_history_role_check",
      asCheckSql(sql`${t.role} IN ('system', 'user', 'assistant')`),
    ),
  ],
);
