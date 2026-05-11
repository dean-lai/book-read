import { NextResponse } from "next/server";

import { listBooksWithCategory } from "@/server/books/repositories/books-repository";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("q") ?? "";
  if (raw.length > 200) {
    return NextResponse.json({ error: "query_too_long" }, { status: 400 });
  }

  try {
    const books = await listBooksWithCategory({ search: raw });
    return NextResponse.json({
      books: books.map((b) => ({
        ...b,
        createdAt: b.createdAt.toISOString(),
      })),
    });
  } catch {
    return NextResponse.json({ error: "unavailable", books: [] }, { status: 503 });
  }
}
