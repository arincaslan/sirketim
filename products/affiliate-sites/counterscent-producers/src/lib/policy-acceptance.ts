import type { Env } from "./env";
import { db } from "./db";
import { generateId, readSessionCookie, type Sql } from "./auth";
import { POLICY_VERSION } from "./legal";

/**
 * ============================================================================
 * HAS THIS ACCOUNT ACCEPTED THE CURRENT POLICIES? - 2026-11-01.
 * ============================================================================
 *
 * WHERE THE ANSWER LIVES: in AuditEvent, as an `account.policies_accepted`
 * row whose `after.policyVersion` equals POLICY_VERSION. No new column and no
 * migration, deliberately: an acceptance IS an event about an account - who
 * agreed to which text, and when - and that is exactly what the append-only
 * table exists to answer later. A boolean on User would say only that somebody
 * once ticked something, and would be overwritten by the next version.
 *
 * ONE ROUND TRIP. The router asks this before handing a /console request to
 * its handler, so it costs one extra query per console page. It joins the
 * session straight to the acceptance rather than calling getAuthContext()
 * and then asking again. The lookup is by action (indexed with createdAt) and
 * then actor; the table is small and an account accepts once per version.
 *
 * Deleting an account (routes/delete-account.ts) leaves the acceptance rows,
 * like every other audit row, and they identify nobody once the User is gone.
 */

export type PolicyGate = "no-session" | "accepted" | "pending" | "unavailable";

export const ACTION_POLICIES_ACCEPTED = "account.policies_accepted";

export async function policyGate(request: Request, env: Env): Promise<PolicyGate> {
  const token = readSessionCookie(request);
  if (!token) return "no-session";
  const sql = db(env);
  if (!sql) return "no-session";
  try {
    const rows = (await sql`
      SELECT
        EXISTS (
          SELECT 1 FROM "AuditEvent" a
          WHERE a.action = ${ACTION_POLICIES_ACCEPTED}
            AND a."actorId" = u.id
            AND a.after ->> 'policyVersion' = ${POLICY_VERSION}
        ) AS accepted
      FROM "Session" s
      JOIN "User" u ON u.id = s."userId"
      WHERE s."sessionToken" = ${token} AND s.expires > now()
    `) as { accepted: boolean }[];
    const row = rows[0];
    if (!row) return "no-session";
    return row.accepted ? "accepted" : "pending";
  } catch {
    return "unavailable";
  }
}

export async function hasAccepted(sql: Sql, userId: string): Promise<boolean> {
  const rows = (await sql`
    SELECT 1 FROM "AuditEvent"
    WHERE action = ${ACTION_POLICIES_ACCEPTED}
      AND "actorId" = ${userId}
      AND after ->> 'policyVersion' = ${POLICY_VERSION}
    LIMIT 1
  `) as unknown[];
  return rows.length > 0;
}

/**
 * Records one acceptance. What is stored is what was agreed to and nothing
 * else: the version, which statements were ticked, and the account and
 * company ids. NOT the email address and NOT the IP - neither is needed to
 * prove that this account accepted this text, and both are personal data.
 */
export async function recordAcceptance(
  sql: Sql,
  user: { id: string; producerId: string | null },
): Promise<void> {
  await sql`
    INSERT INTO "AuditEvent" (
      id, "submissionId", "producerId", action, "actorType", "actorId",
      channel, before, after, reason
    ) VALUES (
      ${generateId()}, NULL, ${user.producerId}, ${ACTION_POLICIES_ACCEPTED},
      'PRODUCER', ${user.id},
      'producer-console',
      NULL,
      ${JSON.stringify({
        userId: user.id,
        policyVersion: POLICY_VERSION,
        acceptedTerms: true,
        readPrivacyNotice: true,
        confirmedAdult: true,
      })}::jsonb,
      NULL
    )
  `;
}
