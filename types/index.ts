/** Row shapes inferred from `db/schema.ts`. Narrow with Pick/Omit for component props. */
import {
  bookChunks,
  books,
  bookmarks,
  categories,
  chatHistory,
  highlights,
  userBooks,
} from "@/db/schema";

export type Book = typeof books.$inferSelect;
export type BookChunk = typeof bookChunks.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type UserBook = typeof userBooks.$inferSelect;
export type Bookmark = typeof bookmarks.$inferSelect;
export type Highlight = typeof highlights.$inferSelect;
export type ChatHistoryRow = typeof chatHistory.$inferSelect;
