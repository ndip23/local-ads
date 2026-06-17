import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
  __arenaNextJsDrizzle?: NodePgDatabase<typeof schema>;
};

function getPool(): Pool {
  if (globalForDb.__arenaNextJsPostgresqlPool) {
    return globalForDb.__arenaNextJsPostgresqlPool;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  const max = Number(process.env.DATABASE_POOL_MAX || 5);
  const p = new Pool({
    connectionString: databaseUrl,
    max: Number.isFinite(max) && max > 0 ? max : 5,
    idleTimeoutMillis: Number(process.env.DATABASE_IDLE_TIMEOUT_MS || 30_000),
    connectionTimeoutMillis: Number(process.env.DATABASE_CONNECTION_TIMEOUT_MS || 10_000),
  });

  // Vercel can reuse warm serverless instances. Caching the pool prevents a new
  // pool from being constructed on every hot invocation and reduces Supabase
  // connection churn.
  globalForDb.__arenaNextJsPostgresqlPool = p;
  return p;
}

function getDb(): NodePgDatabase<typeof schema> {
  if (globalForDb.__arenaNextJsDrizzle) {
    return globalForDb.__arenaNextJsDrizzle;
  }

  const d = drizzle(getPool(), { schema });
  globalForDb.__arenaNextJsDrizzle = d;
  return d;
}

// Lazy proxies: pool and db are only created on first actual use at runtime,
// never at import/build time.  This lets `npm run build` succeed without
// DATABASE_URL being set.

export const pool: Pool = new Proxy({} as Pool, {
  get(_target, prop, receiver) {
    const real = getPool();
    const value = Reflect.get(real, prop, receiver);
    return typeof value === "function" ? value.bind(real) : value;
  },
});

export const db: NodePgDatabase<typeof schema> = new Proxy(
  {} as NodePgDatabase<typeof schema>,
  {
    get(_target, prop, receiver) {
      const real = getDb();
      const value = Reflect.get(real, prop, receiver);
      return typeof value === "function" ? value.bind(real) : value;
    },
  }
);
