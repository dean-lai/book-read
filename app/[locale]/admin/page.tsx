import { Link } from "@/i18n/navigation";
import { Suspense } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAdminDashboardData } from "@/server/admin/services/admin-dashboard-service";
import { getTranslations } from "next-intl/server";

export default async function AdminDashboardPage() {
  const t = await getTranslations("admin");

  return (
    <Suspense
      fallback={
        <div className="text-brand-muted mx-auto max-w-4xl p-base text-body-sm">
          {t("dashboardFallback")}
        </div>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}

async function AdminDashboardContent() {
  const t = await getTranslations("admin");
  const { totalBooks, missingEmbedding, recent } =
    await getAdminDashboardData();

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("totalBooks")}</CardDescription>
            <CardTitle className="text-3xl tabular-nums">
              {totalBooks}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              {t("totalBooksHint")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("missingEmbedding")}</CardDescription>
            <CardTitle className="text-3xl tabular-nums">
              {missingEmbedding}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              {t("missingEmbeddingHint")}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("recentBooks")}</CardTitle>
          <CardDescription>{t("recentBooksHint")}</CardDescription>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="text-muted-foreground text-sm">
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
                {recent.map((row) => (
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
                    <TableCell className="text-muted-foreground text-right text-sm">
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
