/**
 * PostgreSQL Helper
 * 
 * This module provides helper functions for interacting with PostgreSQL.
 * Used for database operations in production environment.
 * Supports standard PostgreSQL connections.
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from '../db/schema.postgres';

const { Pool } = pg;

let pool: pg.Pool | null = null;

/**
 * Get PostgreSQL connection pool
 */
function getPool(): pg.Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.POSTGRES_URL,
    });
  }
  return pool;
}

/**
 * Get Drizzle instance for PostgreSQL
 */
export function getPostgresClient() {
  const pool = getPool();
  return drizzle({ client: pool, schema });
}

/**
 * Check if PostgreSQL is configured
 */
export function isPostgresConfigured(): boolean {
  return !!process.env.POSTGRES_URL;
}

/**
 * Get database connection info
 */
export function getDatabaseInfo() {
  return {
    isPostgres: isPostgresConfigured(),
    url: process.env.POSTGRES_URL ? '***configured***' : 'not configured',
  };
}

/**
 * Close database connection pool
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

/**
 * Get PostgreSQL client instance (alias for getPostgresClient)
 */
export function getPostgresDb() {
  return getPostgresClient();
}
