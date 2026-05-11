import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "@/i18n/navigation";
import { listBooksWithCategory } from "@/server/books/repositories/books-repository";
import { getTranslations } from "next-intl/server";

export default async function AdminBooksPage() {
  const t = await getTranslations("admin");
  const books = await listBooksWithCategory();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-sans text-title-md font-semibold tracking-tight text-ink">
            {t("booksHeading")}
          </h2>
          <p className="mt-xs text-body-sm text-brand-muted">
            {t("booksSubtitle")}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/books/new">{t("addBook")}</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("library")}</CardTitle>
          <CardDescription>
            {t("libraryDescriptionBefore")}
            <Link
              href="/admin/books/new"
              className="text-primary font-medium underline-offset-4 hover:underline"
            >
              {t("newBook")}
            </Link>
            {t("libraryDescriptionAfter")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {books.length === 0 ? (
            <p className="text-body-sm text-brand-muted">
              {t("noBooksYet")}{" "}
              <Link
                href="/admin/books/new"
                className="text-primary font-medium underline-offset-4 hover:underline"
              >
                {t("createOne")}
              </Link>
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("tableTitle")}</TableHead>
                  <TableHead>{t("tableAuthor")}</TableHead>
                  <TableHead>{t("tableCategory")}</TableHead>
                  <TableHead className="text-right">{t("tableAdded")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {books.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/admin/books/${row.id}/edit`}
                        className="hover:underline"
                      >
                        {row.title}
                      </Link>
                    </TableCell>
                    <TableCell>{row.author}</TableCell>
                    <TableCell>{row.categoryName ?? "—"}</TableCell>
                    <TableCell className="text-right text-body-sm text-brand-muted">
                      {row.createdAt.toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
