import {
  countBooks,
  countBooksMissingEmbedding,
  listRecentWithCategory,
  type BookRowWithCategory,
} from "@/server/repositories/books-repository";

export type AdminDashboardData = {
  totalBooks: number;
  missingEmbedding: number;
  recent: BookRowWithCategory[];
};

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const [totalBooks, missingEmbedding, recent] = await Promise.all([
    countBooks(),
    countBooksMissingEmbedding(),
    listRecentWithCategory(8),
  ]);

  return { totalBooks, missingEmbedding, recent };
}
