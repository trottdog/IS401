/**
 * Database client. Uses the same schema as db/schema.sql.
 * Set DATABASE_URL in .env (e.g. postgresql://user:pass@localhost:5432/byuconnect).
 */
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema.js";

const connectionString = process.env.DATABASE_URL;

function getDb() {
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  const pool = new pg.Pool({ connectionString });
  return drizzle(pool, { schema });
}

let db: ReturnType<typeof getDb> | null = null;

export function getDatabase() {
  if (!db) {
    db = getDb();
  }
  return db;
}

export { schema };
