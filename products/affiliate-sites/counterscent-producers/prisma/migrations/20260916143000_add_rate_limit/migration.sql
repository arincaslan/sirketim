-- Rate-limit counters for POST /sign-in. Additive only: one new table, and
-- nothing existing is altered or dropped.
--
-- HAND-WRITTEN, NOT GENERATED. The session that added it had no database
-- credentials, and `prisma migrate dev` needs a live connection plus a shadow
-- database to emit this file. It is written to match exactly what Prisma's
-- generator produces for the `RateLimit` model in ../../schema.prisma, so a
-- later `prisma migrate dev` sees no drift.
--
-- APPLIED 2026-09-16 to the Neon `production` branch, before the Worker that
-- expects it shipped - POST /sign-in refuses to send mail when its limit table
-- is missing (it fails closed rather than sending unthrottled), so the reverse
-- order would have meant sign-in answering 503 to everyone until it ran.
--
-- This comment previously read "NOT APPLIED AS OF 2026-09-16" and stayed that
-- way after the migration ran. It then misled a subagent the same day into
-- reporting an unapplied migration as a deploy blocker, because an agent with
-- no database access has nothing to check it against. Confirm with
-- `npx prisma migrate status`, or query `_prisma_migrations` - never this line.

-- CreateTable
CREATE TABLE "RateLimit" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "windowStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "RateLimit_windowStart_idx" ON "RateLimit"("windowStart");
