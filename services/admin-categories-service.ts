import { z } from "zod";

import * as categoriesRepository from "@/repositories/categories-repository";
import { slugify } from "@/lib/slugify";

const createSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

const updateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Name is required"),
});

const deleteSchema = z.object({
  id: z.string().uuid(),
});

function formatZodMessage(error: z.ZodError): string {
  return error.issues.map((e) => e.message).join("; ");
}

async function uniqueSlug(
  baseSlug: string,
  excludeCategoryId?: string,
): Promise<string> {
  let slug = baseSlug || "category";
  let suffix = 0;
  while (true) {
    const candidate = suffix === 0 ? slug : `${slug}-${suffix}`;
    const taken = await categoriesRepository.isSlugTaken(
      candidate,
      excludeCategoryId,
    );
    if (!taken) {
      return candidate;
    }
    suffix += 1;
  }
}

export async function createCategoryFromAdmin(input: unknown) {
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      message: formatZodMessage(parsed.error),
    };
  }

  const name = parsed.data.name.trim();
  const base = slugify(name);
  const slug = await uniqueSlug(base);

  try {
    await categoriesRepository.insertCategory({ name, slug });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Could not create category.";
    return { ok: false as const, message };
  }

  return { ok: true as const };
}

export async function updateCategoryFromAdmin(input: unknown) {
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      message: formatZodMessage(parsed.error),
    };
  }

  const name = parsed.data.name.trim();
  const base = slugify(name);
  const slug = await uniqueSlug(base, parsed.data.id);

  try {
    await categoriesRepository.updateCategory(parsed.data.id, { name, slug });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Could not update category.";
    return { ok: false as const, message };
  }

  return { ok: true as const };
}

export async function deleteCategoryFromAdmin(input: unknown) {
  const parsed = deleteSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      message: formatZodMessage(parsed.error),
    };
  }

  try {
    await categoriesRepository.deleteCategory(parsed.data.id);
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Could not delete category.";
    return { ok: false as const, message };
  }

  return { ok: true as const };
}
