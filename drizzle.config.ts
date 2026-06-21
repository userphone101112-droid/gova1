import type { Config } from 'drizzle-kit';

const isPostgres = process.env.POSTGRES_URL ? true : false;
const isTurso = process.env.TURSO_DATABASE_URL ? true : false;

// For Turso, we need to include authToken in the URL
const getTursoUrl = () => {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (url && authToken) {
    return `${url}?authToken=${authToken}`;
  }
  return url || '';
};

export default {
  schema: isPostgres ? './src/lib/db/schema.postgres.ts' : './src/lib/db/schema.ts',
  out: './database/migrations',
  dialect: isPostgres ? 'postgresql' : 'sqlite',
  dbCredentials: isPostgres
    ? {
        url: process.env.POSTGRES_URL!,
      }
    : isTurso
    ? {
        url: getTursoUrl(),
      }
    : {
        url: './sym_data/sym_sql/allusers.db',
      },
} satisfies Config;
