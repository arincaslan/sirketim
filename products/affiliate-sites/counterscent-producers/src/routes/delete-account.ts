import { html, type Html } from "../lib/html";
import { page, redirect } from "../lib/http";
import { layout } from "../ui/layout";
import { button, card, checkboxField, csrfInput, emptyState, section } from "../ui/components";
import { CSRF_FIELD, csrfToken, verifyCsrf } from "../lib/csrf";
import { db } from "../lib/db";
import {
  clearSessionCookieHeader,
  generateId,
  getAuthContext,
  type AuthUser,
  type Sql,
} from "../lib/auth";
import { isAdminEmail } from "../lib/admin";
import { accountWriteKey, bumpRateLimit, PRODUCER_WRITE_MAX, PRODUCER_WRITE_WINDOW_SECONDS } from "../lib/rate-limit";
import type { Env } from "../lib/env";

/**
 * ============================================================================
 * DELETE YOUR ACCOUNT - the self-serve erasure route, 2026-11-01.
 * ============================================================================
 *
 * WHY IT EXISTS. KVKK Article 7 and Article 11, and GDPR Article 17, give a
 * person the right to have their personal data erased, and until this date the
 * only way to exercise it here was to write to us. That is lawful (a request by
 * email is a valid channel) but it is the same "easy in, hard out" asymmetry
 * the legal pass removed from withdrawal: an account is created by typing an
 * address and pressing one button, so it should be closable the same way. The
 * privacy notice on the catalogue links straight here.
 *
 * WHAT IS DELETED, IMMEDIATELY AND FOR GOOD:
 *  - the User row, which holds the email address and the Google name;
 *  - by cascade (prisma/schema.prisma, onDelete: Cascade), every Session and
 *    every linked sign-in method (Account rows);
 *  - every outstanding sign-in link for the address (VerificationToken, keyed
 *    by the address itself);
 *  - if this was the LAST account on its company: the company's contact
 *    address, and every listing still published is withdrawn.
 *
 * WHAT IS KEPT, AND WHY - THE PAGE SAYS THIS BEFORE THE BUTTON:
 *  - The company record and its listings, as withdrawn rows. Submission is
 *    ON DELETE RESTRICT and the listing history is the record the terms
 *    (section 10) promise to keep: a click inside a network's cookie window can
 *    still pay out after a listing is gone, and the history of what was listed
 *    is the honest answer to a later complaint. A withdrawn listing is not
 *    published anywhere. This is processing for establishing, exercising or
 *    defending legal claims (KVKK 5(2)(e)), disclosed in the privacy notice.
 *  - Past AuditEvent rows, which are append-only by design and can include the
 *    address used at the time. Same basis, same disclosure, and nothing in this
 *    project ever rewrites that table - including this route.
 *
 * WHAT IT REFUSES: an account whose company has a paid subscription in force.
 * Deleting the only account on a company that is being billed would leave a
 * subscription running with nobody able to sign in and cancel it, which is a
 * hidden fee manufactured by our own delete button. No paid plan can be bought
 * today, so this refusal is unreachable in practice; it is here so that it is
 * already true on the day billing opens.
 *
 * THE ORDER OF WRITES, AND WHY THE AUDIT ROW COMES FIRST. Same rule as every
 * other write on this origin: a logged change that did not happen is visible
 * and correctable, an unlogged one that did is neither. The audit row carries
 * the user id and producer id - both random identifiers - and NOT the email
 * address, because writing the address into an append-only table at the moment
 * of erasing it would defeat the erasure.
 *
 * NOT BATCHED INTO A TRANSACTION, for the reason routes/company.ts gives: the
 * steps that matter are conditional on earlier answers (is this the last
 * account?), which a non-interactive batch cannot branch on. Each step is
 * idempotent, so a failure part-way leaves a state the next attempt finishes:
 * the user row is deleted LAST, so until it is gone the person can sign in and
 * press the button again.
 */

const TITLE = "Delete your account";

/* ======================================================================== *
 * GET - what will happen, then the button
 * ======================================================================== */

export async function deleteAccountPage(request: Request, env: Env): Promise<Response> {
  const auth = await getAuthContext(request, env);
  if (!auth) return redirect("/sign-in");

  const sql = db(env);
  if (!sql) return page(unavailable(auth), 503);

  let facts: AccountFacts;
  try {
    facts = await loadFacts(sql, auth);
  } catch {
    return page(unavailable(auth), 503);
  }

  if (facts.paidInForce) return page(cancelFirst(auth, env), 409);

  const token = await csrfToken(request, "delete-account");
  if (!token) return redirect("/sign-in");

  return page(confirm(auth, env, facts, token, null), 200, { allowForms: true });
}

/* ======================================================================== *
 * POST - the act
 * ======================================================================== */

export async function deleteAccountSubmit(request: Request, env: Env): Promise<Response> {
  const auth = await getAuthContext(request, env);
  if (!auth) return redirect("/sign-in", { status: 303 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return redirect("/console/delete", { status: 303 });
  }

  // CSRF before anything else, so a forged request can neither delete nor
  // spend this account's write allowance.
  const token = form.get(CSRF_FIELD);
  if (!(await verifyCsrf(request, "delete-account", typeof token === "string" ? token : null))) {
    return redirect("/console/delete", { status: 303 });
  }

  const sql = db(env);
  if (!sql) return page(unavailable(auth), 503);

  let facts: AccountFacts;
  try {
    facts = await loadFacts(sql, auth);
  } catch {
    return page(unavailable(auth), 503);
  }

  if (form.get("confirmDelete") !== "yes") {
    const fresh = await csrfToken(request, "delete-account");
    if (!fresh) return redirect("/sign-in", { status: 303 });
    return page(
      confirm(auth, env, facts, fresh, "Tick the box to confirm you understand what deleting does"),
      422,
      { allowForms: true },
    );
  }

  // Checked again on the POST: the GET is not the only way to reach this.
  if (facts.paidInForce) return page(cancelFirst(auth, env), 409);

  const limit = await bumpRateLimit(sql, {
    key: accountWriteKey(auth.id),
    windowSeconds: PRODUCER_WRITE_WINDOW_SECONDS,
    limit: PRODUCER_WRITE_MAX,
  });
  if (limit.kind !== "allowed") return page(unavailable(auth), limit.kind === "limited" ? 429 : 503);

  try {
    await eraseAccount(sql, auth, facts);
  } catch (err) {
    console.error("deleteAccountSubmit failed", err instanceof Error ? err.message : err);
    return page(failed(auth), 503);
  }

  // Not a redirect: the confirmation has to be served on the same response
  // that clears the cookie, because after it there is no session to carry a
  // flash message on, and a query-string "deleted=1" page would claim a
  // deletion to anybody who typed the URL.
  const response = page(done(), 200);
  response.headers.append("Set-Cookie", clearSessionCookieHeader());
  return response;
}

/* ======================================================================== *
 * What the account is attached to
 * ======================================================================== */

interface AccountFacts {
  /** Other accounts on the same company. Zero means this is the last one. */
  otherUsers: number;
  /** Listings that are still published or waiting, which deleting the last
   *  account withdraws. */
  liveListings: number;
  /** Whether the company has a paid subscription in force. */
  paidInForce: boolean;
}

async function loadFacts(sql: Sql, auth: AuthUser): Promise<AccountFacts> {
  if (!auth.producerId) return { otherUsers: 0, liveListings: 0, paidInForce: false };

  const others = (await sql`
    SELECT count(*)::int AS n FROM "User"
    WHERE "producerId" = ${auth.producerId} AND id <> ${auth.id}
  `) as { n: number }[];

  const live = (await sql`
    SELECT count(*)::int AS n FROM "Submission"
    WHERE "producerId" = ${auth.producerId}
      AND "publishState" NOT IN ('WITHDRAWN_BY_PRODUCER', 'REMOVED_BY_EDITOR')
  `) as { n: number }[];

  // IN FORCE means the same thing here as in lib/producer.ts entitlementOf():
  // a paid tier, an active-ish status, and a period end that has not passed,
  // computed in SQL so the zoneless-TIMESTAMP trap cannot apply. A cancelled or
  // lapsed subscription does not block deletion.
  const paid = (await sql`
    SELECT 1 FROM "Subscription"
    WHERE "producerId" = ${auth.producerId}
      AND tier <> 'free'
      AND status IN ('ACTIVE', 'TRIALING', 'PAST_DUE')
      AND ("currentPeriodEnd" IS NULL OR "currentPeriodEnd" > now())
    LIMIT 1
  `) as unknown[];

  return {
    otherUsers: others[0]?.n ?? 0,
    liveListings: live[0]?.n ?? 0,
    paidInForce: paid.length > 0,
  };
}

async function eraseAccount(sql: Sql, auth: AuthUser, facts: AccountFacts): Promise<void> {
  const lastOnCompany = auth.producerId !== null && facts.otherUsers === 0;

  // 1. THE RECORD THAT IT HAPPENED, first, and without the email address.
  await sql`
    INSERT INTO "AuditEvent" (
      id, "submissionId", "producerId", action, "actorType", "actorId",
      channel, before, after, reason
    ) VALUES (
      ${generateId()}, NULL, ${auth.producerId}, 'account.deleted',
      'PRODUCER', ${auth.id},
      'producer-console',
      NULL,
      ${JSON.stringify({
        userId: auth.id,
        producerId: auth.producerId,
        lastAccountOnCompany: lastOnCompany,
        listingsWithdrawn: lastOnCompany ? facts.liveListings : 0,
        emailRetained: false,
      })}::jsonb,
      NULL
    )
  `;

  if (lastOnCompany && auth.producerId) {
    // 2. Nobody is left to answer for the company's listings, so none of them
    //    stays published. One audit row per listing, the same shape a producer
    //    pressing Withdraw produces, so the listing history reads the same way
    //    whichever route took it down.
    const rows = (await sql`
      SELECT id, "publishState" FROM "Submission"
      WHERE "producerId" = ${auth.producerId}
        AND "publishState" NOT IN ('WITHDRAWN_BY_PRODUCER', 'REMOVED_BY_EDITOR')
    `) as { id: string; publishState: string }[];
    for (const row of rows) {
      await sql`
        INSERT INTO "AuditEvent" (
          id, "submissionId", "producerId", action, "actorType", "actorId",
          channel, before, after, reason
        ) VALUES (
          ${generateId()}, ${row.id}, ${auth.producerId}, 'submission.withdrawn',
          'PRODUCER', ${auth.id},
          'producer-console',
          ${JSON.stringify({ publishState: row.publishState })}::jsonb,
          ${JSON.stringify({
            publishState: "WITHDRAWN_BY_PRODUCER",
            recordRetained: true,
            clickHistoryRetained: true,
            cause: "account.deleted",
          })}::jsonb,
          NULL
        )
      `;
    }
    await sql`
      UPDATE "Submission"
      SET "publishState" = 'WITHDRAWN_BY_PRODUCER', "updatedAt" = now()
      WHERE "producerId" = ${auth.producerId}
        AND "publishState" NOT IN ('WITHDRAWN_BY_PRODUCER', 'REMOVED_BY_EDITOR')
    `;

    // 3. The company's contact address is a person's address as often as not,
    //    and nobody is left to be contacted at it.
    await sql`
      UPDATE "Producer" SET "contactEmail" = NULL, "updatedAt" = now()
      WHERE id = ${auth.producerId}
    `;
  }

  // 4. Outstanding sign-in links for the address. Keyed by the address itself,
  //    so they would otherwise outlive the account they were issued for.
  await sql`DELETE FROM "VerificationToken" WHERE identifier = ${auth.email}`;

  // 5. LAST: the account. Cascades to Session and Account. Until this runs the
  //    person can still sign in and press the button again, which is what
  //    makes a failure part-way through recoverable rather than stranded.
  await sql`DELETE FROM "User" WHERE id = ${auth.id}`;
}

/* ======================================================================== *
 * Screens
 * ======================================================================== */

function confirm(auth: AuthUser, env: Env, facts: AccountFacts, token: string, error: string | null): Html {
  const last = auth.producerId !== null && facts.otherUsers === 0;
  return layout({
    title: TITLE,
    heading: "Delete your account?",
    nav: { showAdmin: isAdminEmail(auth.email, env) },
    status: {
      label: "Nothing has happened yet",
      tone: "outline",
      note: html`This page has changed nothing.`,
    },
    standfirst: html`You are signed in as <span class="wrap-anywhere">${auth.email}</span>.
      <span lang="tr">Hesabınızı buradan silebilirsiniz; ne silinip neyin saklandığı aşağıda
      yazıyor.</span>`,
    body: html`
      ${card(html`
        <h3>Deleted immediately, and for good</h3>
        <ul>
          <li>Your account: your email address and, if you used Google, your name.</li>
          <li>Every sign-in method connected to it, and every session, on every device.</li>
          <li>Any sign-in link we have sent to this address that is still waiting to be used.</li>
          ${last
            ? html`<li>
                The company's contact address, because nobody else is left on this company.
              </li>`
            : ""}
        </ul>
      `)}
      ${card(html`
        <h3>Kept, and why</h3>
        <ul>
          ${auth.producerId === null
            ? html`<li>Nothing about a company: this account has none.</li>`
            : last
              ? html`<li>
                  <strong>Your company's listings are withdrawn, not erased.</strong>
                  ${facts.liveListings === 0
                    ? "None is published or waiting right now."
                    : `${facts.liveListings === 1 ? "One listing" : `${String(facts.liveListings)} listings`} will stop being published.`}
                  The records stay, marked withdrawn, because the terms promise to keep listing
                  history and because a click can still pay a retailer's commission after a
                  listing is gone.
                </li>`
              : html`<li>
                  Your company and its listings are untouched: other accounts still manage them.
                </li>`}
          <li>
            The record of past changes, which can include the address that made them. We keep it
            for as long as needed to deal with a legal claim, and no longer than ten years.
          </li>
        </ul>
        <p class="muted">
          The <a href="https://counterscent.com/privacy/">privacy notice</a>
          (<a href="https://counterscent.com/tr/gizlilik/" lang="tr" hreflang="tr">Türkçe</a>)
          explains this in full. To ask us to remove anything else, write to
          <a href="mailto:contact@counterscent.com">contact@counterscent.com</a>.
        </p>
      `)}
      <form method="post" action="/console/delete" class="stack">
        ${csrfInput(CSRF_FIELD, token)}
        ${checkboxField({
          name: "confirmDelete",
          error: error ?? undefined,
          label: html`I understand this cannot be undone. Signing in again later starts a new,
            empty account. <span lang="tr">(Bunun geri alınamayacağını anlıyorum.)</span>`,
        })}
        <div class="btn-row">
          ${button("Delete my account", { variant: "primary" })}
          <a class="btn btn-ghost" href="/console">Keep it, take me back</a>
        </div>
      </form>
    `,
  });
}

function done(): Html {
  return layout({
    title: TITLE,
    heading: "Your account has been deleted",
    status: {
      label: "Deleted",
      tone: "solid",
      note: html`You have been signed out.`,
    },
    standfirst: html`Your email address, sign-in methods and sessions are gone.
      <span lang="tr">Hesabınız silindi; oturumunuz kapatıldı.</span>`,
    body: section({
      heading: "What happens now",
      body: html`
        <p>
          Nothing else is needed from you. If you sign in again with the same address, that
          creates a new account with no company attached.
        </p>
        <p><a href="https://counterscent.com/">Go to counterscent.com</a></p>
      `,
    }),
  });
}

function cancelFirst(auth: AuthUser, env: Env): Html {
  return layout({
    title: TITLE,
    heading: "Cancel the subscription first",
    nav: { showAdmin: isAdminEmail(auth.email, env) },
    status: { label: "Nothing was changed", tone: "outline", note: html`Your account is untouched.` },
    standfirst: html`You are signed in as <span class="wrap-anywhere">${auth.email}</span>.`,
    body: emptyState({
      headline: "This company has a paid subscription running.",
      because: html`Deleting the last way into the account would leave it being billed with nobody
        able to stop it, so we will not do that. Cancel the subscription, or write to
        <a href="mailto:contact@counterscent.com">contact@counterscent.com</a> and a person will
        cancel it and delete the account together.`,
    }),
  });
}

function unavailable(auth: AuthUser): Html {
  return layout({
    title: TITLE,
    heading: "This cannot be done right now",
    status: { label: "Nothing was changed", tone: "outline", note: html`Your account is untouched.` },
    standfirst: html`You are signed in as <span class="wrap-anywhere">${auth.email}</span>.`,
    body: emptyState({
      headline: "Nothing was deleted.",
      because: html`We could not reach the database, or this account has made too many changes in
        the last hour. Try again later from <a href="/console/delete">this page</a>, or write to
        <a href="mailto:contact@counterscent.com">contact@counterscent.com</a> and a person will
        delete it for you.`,
    }),
  });
}

function failed(auth: AuthUser): Html {
  return layout({
    title: TITLE,
    heading: "We could not finish deleting it",
    status: { label: "Not finished", tone: "outline", note: html`You are still signed in.` },
    standfirst: html`Signed in as <span class="wrap-anywhere">${auth.email}</span>.`,
    body: emptyState({
      headline: "Part of this may have happened, and the account itself still exists.",
      because: html`The account row is always removed last, so you can press the button again from
        <a href="/console/delete">this page</a> and it will finish the job. If it keeps failing,
        write to <a href="mailto:contact@counterscent.com">contact@counterscent.com</a>.`,
    }),
  });
}
