import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import type { Env } from "./env";

/**
 * ============================================================================
 * DECISION: raw SQL over @neondatabase/serverless, NOT Prisma Client.
 * ============================================================================
 *
 * This is the second of the two architecture calls step 5 was asked to make
 * (the first is in src/lib/auth.ts). Both options were real:
 *
 * PRISMA CLIENT (rejected). Prisma Client cannot run in a Worker at all
 * without `@prisma/adapter-neon` on top of it - the generated client's
 * default query engine is a native binary, which Workers cannot execute.
 * With the adapter it becomes: `@prisma/client` (generated, non-trivial:
 * every model and its relations get emitted as TypeScript even though this
 * Worker only ever touches four tables) + `@prisma/adapter-neon` + a
 * `prisma generate` build step wrangler would have to run before bundling.
 * That is real, measurable weight on a project whose own file header (see
 * src/index.ts) already rejected a framework for this exact reason - "a
 * framework would add a build step and several hundred transitive
 * dependencies to a repository the founder reviews by hand" - and this
 * project currently has ZERO dependencies beyond wrangler's own bundling.
 * Prisma Client would also not have made the code meaningfully safer: step
 * 5 needs five queries (write a token, consume it once, upsert a user,
 * write a session, read a session, delete a session), not a query builder
 * for arbitrary joins across ten tables.
 *
 * RAW SQL OVER @neondatabase/serverless (chosen). The `neon()` tagged-
 * template client speaks Neon's HTTP endpoint - `fetch()` under the hood,
 * no TCP, no WebSocket, no node-compat flag - which is the same reason
 * SUBSCRIPTION-PROGRESS.md gives for choosing Neon over Supabase in the
 * first place ("a Worker cannot open an ordinary Postgres connection").
 * It is one dependency, no code generation, and every query below is
 * parameterised (the tagged template escapes values itself; nothing here
 * ever string-concatenates user input into SQL).
 *
 * The cost of this choice, named rather than hidden: there is no compile-time
 * check that a query's shape matches the schema, and an id Prisma would have
 * generated for us via `@default(cuid())` has to be generated here instead -
 * that default lives in Prisma's query engine, not in a Postgres `DEFAULT`
 * expression (confirmed against prisma/migrations/20260914092338_init_producer_programme/migration.sql:
 * every `id` column is `TEXT NOT NULL` with no default). See generateId() in
 * auth.ts - a `crypto.randomUUID()`, not a hand-rolled cuid. A UUID is not
 * the same shape cuid() would have produced, and that is a deliberate,
 * acceptable trade: nothing in the migrated schema validates the *format* of
 * an id column, only that one is present and unique, and a bespoke cuid
 * implementation would be exactly the kind of hand-maintained complexity this
 * decision was trying to avoid adding.
 *
 * Prisma is NOT gone from this project - schema.prisma and prisma/migrations/
 * still live here (moved from fragrance-dupes/ alongside neon.ts, see both
 * files' own headers) and `prisma migrate` / `prisma validate` are still how
 * the schema changes. What Prisma Client would have added on top of that is
 * what got rejected: a second, heavier way to say the same five queries.
 */

/** A tagged-template SQL function bound to this request's DATABASE_URL, or
 *  `null` when the secret is not configured. `null` rather than throwing:
 *  every caller already has to handle "not configured" as a real state (the
 *  house rule - see notShipped() in src/ui/components.ts), and a thrown
 *  exception would make that a try/catch everywhere instead of one `if`. */
export function db(env: Env): NeonQueryFunction<false, false> | null {
  if (!env.DATABASE_URL) return null;
  return neon(env.DATABASE_URL);
}
