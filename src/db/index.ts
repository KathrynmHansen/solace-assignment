import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Import your tables if you have them
import { advocates } from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

// Initialize Postgres client
const sql = postgres(process.env.DATABASE_URL);

// Create Drizzle instance
const db = drizzle(sql, { schema: { advocates } }); // optional schema mapping

export default db;