import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("Set DATABASE_URL (e.g. in .env) before running db commands");
}

export default defineConfig({
  out: "./migrations",
  schema: "./schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
