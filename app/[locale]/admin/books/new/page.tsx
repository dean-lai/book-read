import { listCategories } from "@/server/categories/repositories/categories-repository";
import { getTranslations } from "next-intl/server";

import { NewBookForm } from "./new-book-form";

export default async function AdminNewBookPage() {
  const categories = await listCategories();
  const t = await getTranslations("admin");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          {t("newBookPageTitle")}
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          {t("newBookPageDescription")}
        </p>
      </div>
      <NewBookForm categories={categories} />
    </div>
  );
}
