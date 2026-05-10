import { listCategories } from "@/server/repositories/categories-repository";

import { CategoriesManager } from "./categories-manager";

export default async function AdminCategoriesPage() {
  const categories = await listCategories();

  return <CategoriesManager initialCategories={categories} />;
}
