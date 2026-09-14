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
 * WHY THIS FILE LIVES IN THE CATALOGUE PROJECT, which has nothing to do with
 * Neon: the producer console does not exist yet, and prisma/schema.prisma is
 * already here for the same reason. When the console is built on its own
 * origin (HANDOFF.md, "The architecture answer"), this file and the Prisma
 * schema move there together. It is NOT at the repo root because the root
 * package.json is a Cloudflare deploy shim with deliberately zero
 * dependencies, and `neon config init` installs two.
 */

import { defineConfig } from "@neon/config/v1";

export default defineConfig({
  /**
   * Neon Auth (Managed Better Auth) stays OFF, and is declared rather than
   * left to a default so the decision is visible where it is made.
   *
   * prisma/schema.prisma already carries the Auth.js adapter tables — User,
   * Account, Session, VerificationToken. Turning this on would put a second
   * answer to "who is this producer" in the same database, with neither side
   * aware of the other. Auth is build step 5 and the choice between Auth.js
   * and Neon Auth gets made there, on purpose; enabling it here would make
   * that choice by accident.
   *
   * It can be switched on later from the console or by flipping this flag —
   * nothing about leaving it off today is hard to reverse.
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
