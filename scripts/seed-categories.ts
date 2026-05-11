/**
 * Seeds initial book categories. Safe to re-run: skips slugs that already exist.
 *
 * Usage: pnpm seed:categories
 * Requires DATABASE_URL (e.g. from .env.local — loaded below).
 */

import { config } from "dotenv";
import { resolve } from "path";

import {
  insertCategory,
  isSlugTaken,
} from "../server/categories/repositories/categories-repository";
import { slugify } from "../lib/slugify";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

/** Starter taxonomy aligned with nonfiction summaries / phase-2 examples */
const CATEGORY_NAMES = [
  "Technology",
  "Business",
  "Psychology",
  "Poker",
  "Game Design",
  "Productivity",
  "History",
  "Biography",
  "Science",
  "Writing",
] as const;

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set. Add it to .env.local or the environment.");
    process.exit(1);
  }

  let inserted = 0;
  let skipped = 0;

  for (const name of CATEGORY_NAMES) {
    const slug = slugify(name);
    if (!slug) {
      console.warn(`Skipping empty slug for name: ${name}`);
      continue;
    }

    const taken = await isSlugTaken(slug);
    if (taken) {
      skipped += 1;
      console.log(`Skip (exists): ${name} (${slug})`);
      continue;
    }

    await insertCategory({ name, slug });
    inserted += 1;
    console.log(`Inserted: ${name} (${slug})`);
  }

  console.log(`Done. Inserted ${inserted}, skipped ${skipped}.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
