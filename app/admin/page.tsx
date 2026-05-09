import Link from "next/link";

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
import { getAdminDashboardData } from "@/services/admin-dashboard-service";

export default async function AdminDashboardPage() {
  const { totalBooks, missingEmbedding, recent } =
    await getAdminDashboardData();

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total books</CardDescription>
            <CardTitle className="text-3xl tabular-nums">
              {totalBooks}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Summaries stored in the catalog
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Missing embedding</CardDescription>
            <CardTitle className="text-3xl tabular-nums">
              {missingEmbedding}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Not yet vector-indexed (optional RAG pipeline)
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent books</CardTitle>
          <CardDescription>Newest entries in the database</CardDescription>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No books yet.{" "}
              <Link
                href="/admin/books/new"
                className="text-primary font-medium underline-offset-4 hover:underline"
              >
                Create one
              </Link>
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Added</TableHead>
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
