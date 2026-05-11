import { drizzle } from "drizzle-orm/node-postgres";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";

export type Schema = typeof schema;

let pool: Pool | undefined;
let db: NodePgDatabase<Schema> | undefined;

/**
 * Supabase "Session" pooler enforces a low max concurrent clients per project.
 * Default `pg` pool max (10) plus parallel RSC/API routes can hit
 * `(EMAXCONNSESSION) max clients reached in session mode`. Keep this small;
 * use the Transaction pooler (port 6543) for higher concurrency if needed.
 */
function resolvePoolMax(): number {
  const raw = process.env.DATABASE_POOL_MAX?.trim();
  if (!raw) {
    return 5;
  }
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) {
    return 5;
  }
  return Math.min(n, 20);
}

export function getDb(): NodePgDatabase<Schema> {
  if (!db) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is required for the database client");
    }
    pool ??= new Pool({
      connectionString,
      max: resolvePoolMax(),
      idleTimeoutMillis: 15_000,
      connectionTimeoutMillis: 15_000,
    });
    db = drizzle(pool, { schema });
  }
  return db;
}
