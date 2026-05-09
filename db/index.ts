import { drizzle } from "drizzle-orm/node-postgres";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";

export type Schema = typeof schema;

let pool: Pool | undefined;
let db: NodePgDatabase<Schema> | undefined;

export function getDb(): NodePgDatabase<Schema> {
  if (!db) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is required for the database client");
    }
    pool ??= new Pool({ connectionString });
    db = drizzle(pool, { schema });
  }
  return db;
}
