"use server";

import { requireAdmin } from "@/lib/admin/require-admin";
import {
  createCategoryFromAdmin,
  deleteCategoryFromAdmin,
  updateCategoryFromAdmin,
} from "@/server/categories/services/admin-categories-service";

export async function createCategoryAction(input: unknown) {
  await requireAdmin();
  return createCategoryFromAdmin(input);
}

export async function updateCategoryAction(input: unknown) {
  await requireAdmin();
  return updateCategoryFromAdmin(input);
}

export async function deleteCategoryAction(input: unknown) {
  await requireAdmin();
  return deleteCategoryFromAdmin(input);
}
