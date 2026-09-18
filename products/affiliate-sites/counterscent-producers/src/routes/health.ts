import { json } from "../lib/http";
import { mailConfigured } from "../lib/mailer";
import type { Env } from "../lib/env";

/**
 * A trivial endpoint that proves the WORKER is what answered, rather than a
 * cached asset, a parked page, or a stale DNS answer pointing somewhere else
 * entirely. Worth having from day one: this origin gets checked from a
 * network that blocks workers.dev outright, and the repo's own history has
 * several "the site is down" reports that were a local resolver serving an
 * old IP. "Is it actually up" needs an answer that cannot be a false
 * positive.
 *
 * Updated for step 5 (2026-09-16): this Worker now does hold a database
 * connection (src/lib/db.ts) and account/sign-in flow (src/lib/auth.ts), so
 * `accounts` flips to true. `mailConfigured` is reported separately rather
 * than folded into `accounts`, because the two are independently true or
 * false - a Worker can have a database connection with no mail secret set,
 * which is an expected interim state, not a failure, and collapsing them
 * into one boolean would hide which half is missing.
 */
export function health(_request: Request, env: Env): Response {
  return json({
    ok: true,
    service: "counterscent-producers",
    // Honest, machine-readable version of what every page says in prose.
    programmeOpen: false,
    accounts: true,
    mailConfigured: mailConfigured(env),
    // TRUE SINCE 2026-09-16, and it read `false` until 2026-09-18. This is a
    // public, unauthenticated endpoint whose whole job is to be a
    // machine-readable version of what the pages say in prose, and it was
    // publishing a false capability claim: POST /console/submit calls
    // insertSubmission() and writes real Submission rows. The repo's rule cuts
    // both ways - never claim a feature works when it does not, and do not go
    // on denying one that does.
    submissions: true,
  });
}
