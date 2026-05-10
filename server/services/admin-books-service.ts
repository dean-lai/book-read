import { z } from "zod";

import * as booksRepository from "@/server/repositories/books-repository";
import { summarizeBookContent } from "@/server/services/ai-service";

const generateSummarySchema = z.object({
  rawText: z.string().min(1, "Paste some raw content"),
  titleHint: z.string().optional(),
  authorHint: z.string().optional(),
});

const saveBookSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  summaryContent: z.string().min(1, "Summary is required"),
  categoryId: z.string().optional(),
});

const updateBookSchema = saveBookSchema.extend({
  id: z.string().uuid(),
});

const deleteBookSchema = z.object({
  id: z.string().uuid(),
});

function parseCategoryId(
  raw: string | undefined,
): { ok: true; id: string | null } | { ok: false; message: string } {
  if (raw === undefined || raw === "" || raw === "__none__") {
    return { ok: true, id: null };
  }
  const parsed = z.string().uuid().safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: "Invalid category" };
  }
  return { ok: true, id: parsed.data };
}

function basicMarkdownCheck(text: string): boolean {
  const t = text.trim();
  return (
    t.includes("#") &&
    (t.includes("Summary") ||
      t.includes("summary") ||
      t.includes("Key Takeaways") ||
      t.includes("Detailed Analysis"))
  );
}

function formatZodMessage(error: z.ZodError): string {
  return error.issues.map((e) => e.message).join("; ");
}

export async function generateSummaryForAdmin(input: unknown) {
  const parsed = generateSummarySchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      message: formatZodMessage(parsed.error),
    };
  }

  try {
    const { summary } = await summarizeBookContent({
      rawText: parsed.data.rawText,
      titleHint: parsed.data.titleHint,
      authorHint: parsed.data.authorHint,
    });

    if (!basicMarkdownCheck(summary)) {
      return {
        ok: false as const,
        message:
          "The model output did not look like the expected Markdown sections. Try again or edit manually.",
      };
    }

    return { ok: true as const, summary };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Summary generation failed.";
    return { ok: false as const, message };
  }
}

export async function createBookFromAdmin(input: unknown) {
  const parsed = saveBookSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      message: formatZodMessage(parsed.error),
    };
  }

  const cat = parseCategoryId(parsed.data.categoryId);
  if (!cat.ok) {
    return { ok: false as const, message: cat.message };
  }

  try {
    await booksRepository.insertBook({
      title: parsed.data.title.trim(),
      author: parsed.data.author.trim(),
      description: parsed.data.summaryContent.trim(),
      categoryId: cat.id,
    });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Could not save the book.";
    return { ok: false as const, message };
  }

  return { ok: true as const };
}

export async function updateBookFromAdmin(input: unknown) {
  const parsed = updateBookSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      message: formatZodMessage(parsed.error),
    };
  }

  const cat = parseCategoryId(parsed.data.categoryId);
  if (!cat.ok) {
    return { ok: false as const, message: cat.message };
  }

  try {
    await booksRepository.updateBook(parsed.data.id, {
      title: parsed.data.title.trim(),
      author: parsed.data.author.trim(),
      description: parsed.data.summaryContent.trim(),
      categoryId: cat.id,
    });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Could not update the book.";
    return { ok: false as const, message };
  }

  return { ok: true as const };
}

export async function deleteBookFromAdmin(input: unknown) {
  const parsed = deleteBookSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      message: formatZodMessage(parsed.error),
    };
  }

  try {
    await booksRepository.deleteBook(parsed.data.id);
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Could not delete the book.";
    return { ok: false as const, message };
  }

  return { ok: true as const };
}
