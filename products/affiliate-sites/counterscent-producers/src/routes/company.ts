import { html, type Html } from "../lib/html";
import { page, redirect } from "../lib/http";
import { layout } from "../ui/layout";
import { button, csrfInput, errorSummary, field, section } from "../ui/components";
import { CSRF_FIELD, csrfToken, verifyCsrf } from "../lib/csrf";
import { db } from "../lib/db";
import { getAuthContext, generateId, type AuthUser } from "../lib/auth";
import {
  accountWriteKey,
  bumpRateLimit,
  PRODUCER_WRITE_MAX,
  PRODUCER_WRITE_WINDOW_SECONDS,
} from "../lib/rate-limit";
import type { Env } from "../lib/env";

/**
 * Create the company record a listing belongs to.
 *
 * ---------------------------------------------------------------------------
 * WHY THIS ROUTE HAD TO EXIST, AND WHAT IT REPLACES
 * ---------------------------------------------------------------------------
 *
 * Until 2026-09-19 NOTHING IN THIS WORKER COULD CREATE A `Producer` ROW.
 * `findOrCreateUser()` deliberately creates only a User; `/admin/people` can
 * only ATTACH an account to a producer that already exists; and no other
 * handler held an INSERT against that table. The consequence was not subtle:
 * production carried three accounts, zero producers and zero submissions, so
 * every person who signed in - including the founder - landed on a screen
 * reading "There is no company record attached to this account yet", whose
 * only way forward was an email address. The free tier's one-listing
 * allowance was real in `quotaGate` and unreachable by construction.
 *
 * The screen it replaces argued the case for a manual step: "attaching an
 * inbox to a real business is a decision about identity, so a person makes it
 * by hand". That reasoning is sound and is NOT being discarded - it is being
 * moved to where it already happens. **The listing queue is the identity
 * gate.** Nothing a producer writes reaches the catalogue until an admin
 * approves it in `/admin/queue`, and approval is a human reading a claim about
 * somebody else's product. Gating the ACCOUNT as well meant gating the same
 * decision twice, and the first gate had no one behind it.
 *
 * So: a signed-in address may create its own company and immediately use the
 * free tier's single listing. What it may NOT do is publish. That boundary is
 * unchanged, and it is the one that matters.
 *
 * WHAT THIS ROUTE DOES NOT DO, deliberately:
 *  - It does not set `isHouse`. That flag means "COUNTERSCENT's own line" and
 *    skips subscription and approval entirely; a self-serve form must never be
 *    able to set it, or the exception becomes the door.
 *  - It does not create a Subscription row. No row means the free tier, which
 *    `enforcedAllowance(null)` already answers as 1. Writing a "free"
 *    subscription would invent billing state for something nobody is billed
 *    for.
 *  - It does not let an account that already has a producer make a second one.
 */

interface FormError {
  field: string;
  label: string;
  message: string;
}

/** Company names we will not let a self-serve form claim, because they are
 *  ours. A producer calling itself Counterscent in the register would make the
 *  house/third-party distinction unreadable in the admin queue, which is the
 *  one screen that has to keep it straight. */
const RESERVED = ["counterscent", "sirketim", "admin", "house"];

/**
 * A URL-safe slug from a company name.
 *
 * Returns null when nothing survives, which is a real case rather than a
 * paranoid one: a name written entirely in a script this transform drops
 * leaves an empty string, and an empty slug would collide with itself on the
 * second such company. The caller turns that into a field error asking for
 * Latin characters, rather than inventing an identifier the producer never
 * chose and cannot recognise.
 */
export function slugify(name: string): string | null {
  const slug = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
    .replace(/-+$/g, "");
  return slug.length > 0 ? slug : null;
}

/* ---------------------------------------------------------------------- *
 * GET
 * ---------------------------------------------------------------------- */

export async function companyPage(request: Request, env: Env): Promise<Response> {
  const auth = await getAuthContext(request, env);
  if (!auth) return page(signedOut(), 401);

  // Already has one. Not an error and not a form - just the wrong screen, so
  // it sends them to the right one rather than offering a second company.
  if (auth.producerId) return redirect("/console");

  const token = await csrfToken(request, "create-company");
  return page(form(auth, token, [], {}), 200, { allowForms: true });
}

/* ---------------------------------------------------------------------- *
 * POST
 * ---------------------------------------------------------------------- */

export async function createCompany(request: Request, env: Env): Promise<Response> {
  const auth = await getAuthContext(request, env);
  if (!auth) return page(signedOut(), 401);
  if (auth.producerId) return redirect("/console");

  const body = await request.formData();
  // Read explicitly rather than via Object.fromEntries: that returns an index
  // signature, so every field read below would be `string | undefined` and the
  // length checks would need a non-null assertion each. Three named reads are
  // shorter than three assertions and cannot silently gain a fourth field.
  const read = (k: string) => String(body.get(k) ?? "").trim();
  const submitted = {
    name: read("name"),
    contactEmail: read("contactEmail"),
    blurb: read("blurb"),
  };

  const csrf = body.get(CSRF_FIELD);
  if (!(await verifyCsrf(request, "create-company", typeof csrf === "string" ? csrf : null))) {
    return page(staleForm(auth), 403);
  }

  const sql = db(env);
  if (!sql) return page(noDatabase(auth), 503);

  const errors: FormError[] = [];
  if (submitted.name.length < 2) {
    errors.push({ field: "name", label: "Company name", message: "Give the name buyers would recognise" });
  } else if (submitted.name.length > 80) {
    errors.push({ field: "name", label: "Company name", message: "80 characters or fewer" });
  } else if (RESERVED.includes(submitted.name.toLowerCase().trim())) {
    errors.push({ field: "name", label: "Company name", message: "That name is reserved. Use your own trading name" });
  }
  if (submitted.contactEmail && !/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(submitted.contactEmail)) {
    errors.push({ field: "contactEmail", label: "Contact address", message: "That does not look like an email address" });
  }
  if (submitted.blurb.length > 300) {
    errors.push({ field: "blurb", label: "One line about you", message: "300 characters or fewer" });
  }

  const base = errors.length === 0 ? slugify(submitted.name) : null;
  if (errors.length === 0 && base === null) {
    errors.push({
      field: "name",
      label: "Company name",
      message: "We need at least some Latin letters or digits to build a web address from",
    });
  }

  if (errors.length > 0) {
    const token = await csrfToken(request, "create-company");
    return page(form(auth, token, errors, submitted), 422, { allowForms: true });
  }

  // THE LIMIT IS CHECKED AFTER VALIDATION AND BEFORE THE WRITE. Counting a
  // request that was going to be rejected for a typo would let a fumbled form
  // burn an allowance the producer never spent.
  const limit = await bumpRateLimit(sql, {
    key: accountWriteKey(auth.id),
    limit: PRODUCER_WRITE_MAX,
    windowSeconds: PRODUCER_WRITE_WINDOW_SECONDS,
  });
  if (limit.kind === "limited") return page(limited(auth, limit.retryAfterSeconds), 429);
  if (limit.kind === "unavailable") return page(limiterDown(auth), 503);

  const producerId = generateId();
  try {
    // UNIQUENESS IS THE DATABASE'S JOB, NOT A PRE-CHECK'S. `Producer.slug` is
    // `@unique`, and a SELECT-then-INSERT is a race with a window: two
    // producers with the same trading name posting at once both read "free"
    // and one INSERT then fails anyway. The loop asks the constraint and lets
    // it answer, which is the same answer without the window. Bounded, so a
    // genuinely stuck case surfaces as an error rather than spinning.
    let slug = base as string;
    let created = false;
    for (let attempt = 0; attempt < 12 && !created; attempt++) {
      if (attempt > 0) slug = `${(base as string).slice(0, 44)}-${attempt + 1}`;
      try {
        await sql`
          INSERT INTO "Producer" (id, slug, name, blurb, "isHouse", "contactEmail", "updatedAt")
          VALUES (
            ${producerId}, ${slug}, ${submitted.name}, ${submitted.blurb},
            false, ${submitted.contactEmail || null}, now()
          )
        `;
        created = true;
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        // 23505 is unique_violation. Anything else is a real failure and must
        // not be retried under a different slug as though it were a collision.
        if (!/23505|duplicate key|unique/i.test(message)) throw e;
      }
    }
    if (!created) return page(writeFailed(auth), 503);

    // The audit row BEFORE the attach, same ordering as every other write on
    // this origin: a logged change that did not happen is visible and
    // correctable, an unlogged change that did is neither. submissionId is
    // NULL because this event is about an account, not a listing.
    await sql`
      INSERT INTO "AuditEvent" (
        id, "submissionId", "producerId", action, "actorType", "actorId",
        channel, before, after, reason
      ) VALUES (
        ${generateId()}, NULL, ${producerId}, 'account.company_created',
        'PRODUCER', ${auth.id},
        'producer-console',
        ${JSON.stringify({ userId: auth.id, email: auth.email, producerId: null })}::jsonb,
        ${JSON.stringify({ userId: auth.id, email: auth.email, producerId, slug, name: submitted.name })}::jsonb,
        NULL
      )
    `;

    // `AND "producerId" IS NULL` re-checks in the WHERE clause what the guard
    // at the top of this handler checked in application code, so two tabs
    // posting at once cannot move an already-attached account onto a second
    // company. If it matches nothing, the producer row is orphaned rather than
    // wrongly attached - the safe direction, and visible in the register.
    const rows = (await sql`
      UPDATE "User" SET "producerId" = ${producerId}
      WHERE id = ${auth.id} AND "producerId" IS NULL
      RETURNING id
    `) as { id: string }[];
    if (rows.length === 0) return redirect("/console");
  } catch {
    return page(writeFailed(auth), 503);
  }

  // Straight to the form they came here to reach, rather than to /console.
  // Creating a company is not the thing anybody wanted to do; listing is.
  return redirect("/console/submit?welcome=1");
}

/* ---------------------------------------------------------------------- *
 * Screens
 * ---------------------------------------------------------------------- */

function form(auth: AuthUser, token: string | null, errors: FormError[], values: Record<string, string>): Html {
  return layout({
    title: "Set up your company",
    heading: "Set up your company",
    nav: { current: "listings" },
    standfirst: html`A listing belongs to a company rather than to an inbox, so this is the one
      thing we need before you can list. It takes a minute and nothing here is billed.`,
    body: html`
      ${errorSummary(errors)}
      <form method="post" action="/console/company" class="stack">
        ${token ? csrfInput(CSRF_FIELD, token) : ""}
        ${field({
          name: "name",
          label: "Company name",
          required: true,
          autoFocus: true,
          value: values.name ?? "",
          error: errors.find((e) => e.field === "name")?.message,
          hint: html`The name a buyer would recognise on a bottle. This is what shows on your
            listings, and we build your web address from it.`,
        })}
        ${field({
          name: "contactEmail",
          label: "Contact address",
          type: "email",
          value: values.contactEmail ?? "",
          error: errors.find((e) => e.field === "contactEmail")?.message,
          hint: html`Optional, and only used if we need to ask you something about a listing.
            Leave it blank and we will write to
            <span class="wrap-anywhere">${auth.email}</span>.`,
        })}
        ${field({
          name: "blurb",
          label: "One line about you",
          value: values.blurb ?? "",
          error: errors.find((e) => e.field === "blurb")?.message,
          hint: html`Optional. One sentence, not a pitch. You can change it later.`,
        })}
        ${button("Create the company")}
      </form>
      ${section({
        heading: "What happens after this",
        body: html`
          <ol class="plain-list">
            <li>You get the free tier: <strong>one listing</strong>, no card, no trial clock.</li>
            <li>You submit a fragrance. It joins the review queue.</li>
            <li>
              We read it and approve or refuse it. Nothing reaches
              <a href="https://counterscent.com">counterscent.com</a> until that happens, and we
              take no commission on your sales at any tier.
            </li>
          </ol>
        `,
      })}
    `,
  });
}

function signedOut(): Html {
  return layout({
    title: "Set up your company",
    heading: "Sign in first",
    standfirst: html`Setting up a company attaches it to an account, so we need to know which
      account.`,
    body: section({
      heading: "Nothing was saved",
      body: html`<p><a href="/sign-in">Request a sign-in link</a>, then come back here.</p>`,
    }),
  });
}

function staleForm(auth: AuthUser): Html {
  return layout({
    title: "Set up your company",
    heading: "That form had gone stale",
    status: { label: "Not saved", tone: "outline", note: html`No company was created.` },
    standfirst: html`You are signed in as <span class="wrap-anywhere">${auth.email}</span>. The
      form you posted was minted for a different session, which usually means it sat open while
      you signed in somewhere else.`,
    body: section({
      heading: "Open it again",
      body: html`<p><a href="/console/company">Start over</a>. Nothing was written.</p>`,
    }),
  });
}

function noDatabase(auth: AuthUser): Html {
  return layout({
    title: "Set up your company",
    heading: "This cannot be saved right now",
    status: { label: "Unavailable", tone: "outline", note: html`Nothing was created.` },
    standfirst: html`You are signed in as <span class="wrap-anywhere">${auth.email}</span>, and
      this deployment has no database connection configured.`,
    body: section({
      heading: "Nothing was written",
      body: html`<p>This is ours to fix, not yours. Try again shortly.</p>`,
    }),
  });
}

function writeFailed(auth: AuthUser): Html {
  return layout({
    title: "Set up your company",
    heading: "We could not create the company",
    status: { label: "Not saved", tone: "outline", note: html`Nothing was created.` },
    standfirst: html`You are signed in as <span class="wrap-anywhere">${auth.email}</span>, and
      the write did not go through.`,
    body: section({
      heading: "Nothing was written",
      body: html`
        <p>
          <a href="/console/company">Try again</a>. If it keeps failing, write to
          <a href="mailto:contact@counterscent.com">contact@counterscent.com</a> and we will set
          it up by hand.
        </p>
      `,
    }),
  });
}

function limited(auth: AuthUser, retryAfterSeconds: number): Html {
  const minutes = Math.max(1, Math.ceil(retryAfterSeconds / 60));
  return layout({
    title: "Set up your company",
    heading: "That is more writes than this account is allowed in an hour",
    status: { label: "Rate limited", tone: "outline", note: html`Nothing was created.` },
    standfirst: html`Signed in as <span class="wrap-anywhere">${auth.email}</span>.`,
    body: section({
      heading: `Try again in about ${minutes === 1 ? "a minute" : `${minutes} minutes`}`,
      body: html`<p><a href="/console">Back to the console</a>.</p>`,
    }),
  });
}

function limiterDown(auth: AuthUser): Html {
  return layout({
    title: "Set up your company",
    heading: "This cannot be saved right now",
    status: { label: "Write unavailable", tone: "outline", note: html`Nothing was created.` },
    standfirst: html`Signed in as <span class="wrap-anywhere">${auth.email}</span>. The limit
      that protects this route could not be checked, so the write was refused rather than run
      unthrottled.`,
    body: section({
      heading: "Nothing was written",
      body: html`<p>This is usually momentary. <a href="/console/company">Try again</a>.</p>`,
    }),
  });
}
