// Drizzle ORM Database (Server Only)
import { createClient } from '@libsql/client';
import Database from 'better-sqlite3';
import { drizzle as drizzleBetterSqlite3 } from 'drizzle-orm/better-sqlite3';
import { drizzle as drizzleLibsql } from 'drizzle-orm/libsql';

import * as schema from './schema';

// Check environment
const isTurso = !!process.env.TURSO_DATABASE_URL;

// Initialize database client lazily (only when first accessed)
let dbInstance: ReturnType<typeof drizzleLibsql> | ReturnType<typeof drizzleBetterSqlite3> | null = null;

export function getDb() {
  if (dbInstance) return dbInstance;

  if (isTurso) {
    // Production: Turso (Edge SQLite)
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!,
    });
    dbInstance = drizzleLibsql(client, { schema });
  } else {
    // Development: Local SQLite
    const sqlite = new Database('./sym_data/sym_sql/allusers.db');
    dbInstance = drizzleBetterSqlite3(sqlite, { schema });
  }

  return dbInstance;
}

// For backward compatibility
export const db = getDb();

// Export schema for easier access
export * from './schema';
