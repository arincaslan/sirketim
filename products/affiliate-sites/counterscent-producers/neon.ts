/**
 * Neon project configuration as code — WHICH SERVICES ARE ON, not what tables
 * exist. Applied with `neon deploy` (shorthand for `neon config apply`).
 *
 * THE SCHEMA IS NOT MANAGED HERE. Tables, columns and enums belong to
 * prisma/schema.prisma and reach the database only through a versioned
 * migration in prisma/migrations/. Two tools that both believe they own the
 * schema is the failure this repo keeps paying for; the split is deliberate:
 *
 *   neon.ts            -> which Neon services the project has turned on
 *   schema.prisma      -> the shape of the data
 *
 * MOVED HERE FROM fragrance-dupes/neon.ts on 2026-09-16, as part of build
 * step 5. This file's own comment used to say it would move "when the
 * console is built" — that origin (this project) now exists and its first
 * database-connected code (src/lib/db.ts) lives here, so this is where the
 * Neon config belongs too. It is NOT at the repo root, for the same reason it
 * was never at the repo root before: the root package.json is a Cloudflare
 * deploy shim with deliberately zero dependencies, and `neon config init`
 * installs two (`@neon/config`, `@neon/env`, both moved to this project's
 * package.json alongside it).
 */

import { defineConfig } from "@neon/config/v1";

export default defineConfig({
  /**
   * Neon Auth (Managed Better Auth) stays OFF. Step 5 is exactly the point
   * this comment used to say the decision would get made "on purpose" rather
   * than by accident — it has now been made, in src/lib/auth.ts in this
   * project: hand-rolled sessions directly on the already-migrated
   * User/Account/Session/VerificationToken tables, not Neon Auth and not
   * `@auth/core`. See that file's own decision comment for the reasoning.
   *
   * Turning Neon Auth on now would put a second, competing answer to "who is
   * this producer" in the same database, with neither side aware of the
   * other — the exact failure this file's own top comment names for the
   * schema split. It can still be switched on later by flipping this flag if
   * the hand-rolled approach is ever outgrown; nothing about leaving it off
   * today is hard to reverse.
   */
  auth: false,

  /**
   * Per-branch policy. `production` is the default branch and takes project
   * defaults; anything else is a short-lived working copy.
   *
   * The 7-day TTL on new branches is a cost and clutter guard, and it is safe
   * precisely because it cannot touch the default branch: `branch.isDefault`
   * returns first. A branch holding real producer data would be the default
   * one, not a checkout.
   */
  branch: (branch) => {
    if (branch.isDefault) return {};
    if (!branch.exists) return { ttl: "7d" };
    return {};
  },
});
