import Link from "next/link";

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
import { listBooksWithCategory } from "@/server/repositories/books-repository";

export default async function AdminBooksPage() {
  const books = await listBooksWithCategory();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Books</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            All summaries in the catalog
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/books/new">Add book</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Library</CardTitle>
          <CardDescription>
            Newest first. Open an entry from the dashboard or use{" "}
            <Link
              href="/admin/books/new"
              className="text-primary font-medium underline-offset-4 hover:underline"
            >
              New book
            </Link>{" "}
            to add more.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {books.length === 0 ? (
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
