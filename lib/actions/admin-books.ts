"use server";

import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/admin/require-admin";
import {
  createBookFromAdmin,
  deleteBookFromAdmin,
  generateSummaryForAdmin,
  updateBookFromAdmin,
} from "@/services/admin-books-service";

export async function generateSummaryAction(input: unknown) {
  await requireAdmin();
  return generateSummaryForAdmin(input);
}

export async function saveBookAction(input: unknown) {
  await requireAdmin();
  const result = await createBookFromAdmin(input);
  if (!result.ok) {
    return result;
  }
  redirect("/admin/books");
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
