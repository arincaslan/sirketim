import { json } from "../lib/http";

/**
 * A trivial endpoint that proves the WORKER is what answered, rather than a
 * cached asset, a parked page, or a stale DNS answer pointing somewhere else
 * entirely. Worth having from day one: this origin gets checked from a
 * network that blocks workers.dev outright, and the repo's own history has
 * several "the site is down" reports that were a local resolver serving an
 * old IP. "Is it actually up" needs an answer that cannot be a false
 * positive.
 *
 * Deliberately says nothing about the database, because this Worker has no
 * database connection. A health check that reports on a dependency it does
 * not have is worse than none.
 */
export function health(): Response {
  return json({
    ok: true,
    service: "counterscent-producers",
    // Honest, machine-readable version of what every page says in prose.
    programmeOpen: false,
    accounts: false,
    submissions: false,
  });
}
