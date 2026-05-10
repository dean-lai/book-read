"use server";

import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/admin/require-admin";
import {
  createBookAndIngestFromAdmin,
  createBookFromAdmin,
  deleteBookFromAdmin,
  extractBookTextForAdmin,
  generateSummaryForAdmin,
  ingestBookRagForAdmin,
  updateBookFromAdmin,
} from "@/server/services/admin-books-service";

export async function generateSummaryAction(input: unknown) {
  await requireAdmin();
  return generateSummaryForAdmin(input);
}

export async function extractBookTextAction(formData: FormData) {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false as const, message: "Please choose an ebook file first." };
  }
  return extractBookTextForAdmin({ file });
}

export async function saveBookAction(input: unknown) {
  await requireAdmin();
  const result = await createBookFromAdmin(input);
  if (!result.ok) {
    return result;
  }
  redirect("/admin/books");
}

export async function saveBookWithFileAction(formData: FormData) {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false as const, message: "Ebook file is required." };
  }
  const result = await createBookAndIngestFromAdmin({
    title: String(formData.get("title") ?? ""),
    author: String(formData.get("author") ?? ""),
    summaryContent: String(formData.get("summaryContent") ?? ""),
    categoryId: String(formData.get("categoryId") ?? ""),
    file,
  });
  if (!result.ok) {
    return result;
  }
  redirect("/admin/books");
}

export async function ingestBookRagAction(input: unknown) {
  await requireAdmin();
  return ingestBookRagForAdmin(input);
}

export async function updateBookAction(input: unknown) {
  await requireAdmin();
  const result = await updateBookFromAdmin(input);
  if (!result.ok) {
    return result;
  }
  redirect("/admin/books");
}

export async function deleteBookAction(input: unknown) {
  await requireAdmin();
  return deleteBookFromAdmin(input);
}
