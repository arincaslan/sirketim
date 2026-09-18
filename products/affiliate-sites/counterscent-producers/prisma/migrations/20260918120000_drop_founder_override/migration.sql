-- Drops the founder-override columns from "Submission". Founder decision,
-- 2026-09-18: the mechanism is removed, so the 95% structural ceiling in the
-- catalogue's lib/verification.ts now has no exceptions at all.
--
-- DESTRUCTIVE, AND VERIFIED HARMLESS BEFORE IT WAS WRITTEN. A DROP COLUMN
-- cannot be undone by re-adding the column, so the counts were taken first,
-- on both branches, rather than assumed from "nobody ever used it":
--
--   production (ep-broad-wave-*) : 0 submissions, 0 rows with any value set
--   local-dev  (ep-noisy-bread-*): 2 submissions, 0 rows with any value set
--
-- Re-run that check before applying this anywhere else:
--   SELECT COUNT(*), COUNT("founderOverrideScore"), COUNT("founderOverrideNote"),
--          COUNT("founderOverrideDate") FROM "Submission";
-- If the last three are not all zero, STOP - a real override exists somewhere
-- and this migration would delete the written justification along with the
-- number, which is the one part that could not be reconstructed.
--
-- HAND-WRITTEN, NOT GENERATED, matching the house pattern set by
-- 20260916143000_add_rate_limit: written to be exactly what `prisma migrate dev`
-- would emit for this schema change, so a later run sees no drift.
--
-- APPLIED 2026-09-18 to the Neon `local-dev` branch only. NOT applied to
-- production as of this writing - that is a deploy step and needs the founder's
-- go-ahead. Do not trust this line to tell you the current state: confirm with
-- `npx prisma migrate status`, or query `_prisma_migrations`. The rate-limit
-- migration's own comment went stale exactly this way and misled a subagent
-- into reporting an applied migration as a deploy blocker.
--
-- Safe to apply before or after the Worker deploys: no code path reads or
-- writes these columns any more, on either side of the change.

-- DropColumn
ALTER TABLE "Submission"
  DROP COLUMN "founderOverrideScore",
  DROP COLUMN "founderOverrideNote",
  DROP COLUMN "founderOverrideDate";
