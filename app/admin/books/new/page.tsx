import { listCategories } from "@/server/repositories/categories-repository";

import { NewBookForm } from "./new-book-form";

export default async function AdminNewBookPage() {
  const categories = await listCategories();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">New book</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Ingest raw content, generate an AI summary, then publish to the
          catalog.
        </p>
      </div>
      <NewBookForm categories={categories} />
    </div>
  );
}
