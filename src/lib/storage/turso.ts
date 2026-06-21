/**
 * Turso Database Helper
 * 
 * This module provides helper functions for interacting with Turso (libSQL).
 * Turso is an edge-hosted SQLite database with replication and serverless support.
 * Compatible with SQLite schema.
 */

import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from '../db/schema';

let client: ReturnType<typeof createClient> | null = null;

/**
 * Get Turso client instance
 */
function getTursoClient() {
  if (!client) {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url) {
      throw new Error('TURSO_DATABASE_URL is not set');
    }

    client = createClient({
      url,
      authToken,
    });
  }
  return client;
}

/**
 * Get Drizzle instance for Turso
 */
export function getTursoDb() {
  const client = getTursoClient();
  return drizzle({ client, schema });
}

/**
 * Check if Turso is configured
 */
export function isTursoConfigured(): boolean {
  return !!process.env.TURSO_DATABASE_URL;
}

/**
 * Get database connection info
 */
export function getTursoInfo() {
  return {
    isTurso: isTursoConfigured(),
    url: process.env.TURSO_DATABASE_URL ? '***configured***' : 'not configured',
    hasAuthToken: !!process.env.TURSO_AUTH_TOKEN,
  };
}

/**
 * Close Turso client connection
 */
export function closeTursoClient(): void {
  if (client) {
    client.close();
    client = null;
  }
}
