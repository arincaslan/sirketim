import { html, type Html } from "../lib/html";
import { page, redirect } from "../lib/http";
import { CATALOGUE, layout } from "../ui/layout";
import {
  button,
  card,
  csrfInput,
  datalist,
  errorSummary,
  field,
  formGroup,
  noteTier,
  notShipped,
  section,
  selectField,
  stateBadge,
  textareaField,
} from "../ui/components";
import type { Env } from "../lib/env";
import type { AuthUser, Sql } from "../lib/auth";
import { CSRF_FIELD, csrfToken, verifyCsrf } from "../lib/csrf";
import { quotaGate, type ProducerConsoleData, type QuotaVerdict } from "../lib/producer";
import {
  bumpRateLimit,
  PRODUCER_WRITE_MAX,
  PRODUCER_WRITE_WINDOW_SECONDS,
  producerWriteKey,
} from "../lib/rate-limit";
import {
  auditNotes,
  CONCENTRATION_SUGGESTIONS,
  emptyDraft,
  insertSubmission,
  loadSubmissionReceipt,
  MIN_DIFFERENCES_CHARS,
  readDraft,
  uniqueConflict,
  validateSubmission,
  type ActorContext,
  type FieldError,
  type SubmissionDraft,
  type SubmissionReceipt,
} from "../lib/submission";
import {
  NOTE_INPUTS_PER_TIER,
  NOTE_VOCABULARY,
  MAX_NOTES_PER_TIER,
  REFERENCES,
  SILLAGE_LABELS,
} from "../generated/catalogue";
import {
  csrfRefused,
  requireProducer,
  writeLimited,
  writeLimiterUnavailable,
  type GateCopy,
} from "./producer-gate";

/**
 * "/console/submit" - one POST is one submitted listing.
 *
 * ============================================================================
 * A SEPARATE ROUTE, NOT A MODAL AND NOT AN EXPANSION OF /console.
 * ============================================================================
 *
 * Three reasons, from CONSOLE-PLAN 4.2. There is no client JavaScript to open a
 * modal under this CSP posture. A form of this size wants its own URL for the
 * POST-then-redirect pattern this origin uses everywhere. And `form-action` is
 * granted per page rather than origin-wide, so a dedicated route keeps that
 * grant on a page that actually has a form.
 *
 * WHAT LANDS IN THE DATABASE: `publishState = PENDING`, `approvalStatus =
 * PENDING`, and a wait for a person. There is no auto-approval here and there
 * will not be one. Validation on this route is mechanical only - a missing
 * field, a number that is not a number, a link that is a shortener - which
 * stops a producer BEFORE the submission exists, so there is no verdict to
 * appeal, only an incomplete form. Whether a listing restates the original's
 * pyramid is a judgement call, it belongs to a reviewer, and nothing here
 * touches it.
 *
 * THERE IS NO "SAVE AS DRAFT". `publishState` defaults to DRAFT in the schema
 * and this route overrides it, because a half-finished listing nobody can see
 * is a feature with its own screens, its own resume path and its own answer to
 * "what happens to a draft when your allowance fills up". None of that is
 * built, so the honest shape is one form, one submission.
 */

const COPY: GateCopy = { verb: "submit a fragrance", title: "Submit a fragrance" };
const NOTE_LIST_ID = "note-vocabulary";
const CONCENTRATION_LIST_ID = "concentration-suggestions";

/* ======================================================================== *
 * GET
 * ======================================================================== */

export async function submitPage(request: Request, env: Env): Promise<Response> {
  const gate = await requireProducer(request, env, COPY);
  if (gate.kind === "refused") return gate.response;

  const url = new URL(request.url);
  const submitted = url.searchParams.get("submitted");

  if (submitted) {
    // Re-read the row rather than carrying anything across the redirect. The
    // query is keyed on the producer as well as the id, so a submission id
    // from somebody else's account simply does not come back.
    let receipt: SubmissionReceipt | null = null;
    try {
      receipt = await loadSubmissionReceipt(gate.sql, gate.data.producer.id, submitted);
    } catch {
      receipt = null;
    }
    if (receipt) return page(received(gate.auth, gate.data, receipt), 200);
    // Falls through to the form, with a notice. Not a 404: the overwhelmingly
    // likely cause is a bookmarked or edited address, and the useful thing to
    // put in front of somebody is the form they were trying to use.
    return renderForm(request, gate, { unknownReceipt: true });
  }

  return renderForm(request, gate, {});
}

/* ======================================================================== *
 * POST
 * ======================================================================== */

export async function submitListing(request: Request, env: Env): Promise<Response> {
  const gate = await requireProducer(request, env, COPY);
  if (gate.kind === "refused") return gate.response;

  // PARSED IN A try/catch BECAUSE formData() THROWS ON A BODY IT CANNOT READ.
  // Unguarded, an absent or unparseable body answers with a generic 500, which
  // is the fake-failure shape this project's notShipped() ethos exists to
  // prevent. A browser cannot produce it; only a non-browser client can, and it
  // gets the same answer as a missing token below.
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return csrfRefused(COPY, "/console/submit");
  }

  // CSRF FIRST, because it costs no database round trip and a forged request
  // should not get to spend somebody else's rate-limit allowance.
  const token = form.get(CSRF_FIELD);
  if (!(await verifyCsrf(request, "submit-listing", typeof token === "string" ? token : null))) {
    return csrfRefused(COPY, "/console/submit");
  }

  const limit = await bumpRateLimit(gate.sql, {
    key: producerWriteKey(gate.data.producer.id),
    windowSeconds: PRODUCER_WRITE_WINDOW_SECONDS,
    limit: PRODUCER_WRITE_MAX,
  });
  if (limit.kind === "unavailable") return writeLimiterUnavailable(COPY, limit.reason);
  if (limit.kind === "limited") return writeLimited(COPY, limit.retryAfterSeconds);

  // THE QUOTA IS CHECKED AGAIN HERE, not only on the GET that rendered the
  // form. Quota enforcement that lives in a page is quota enforcement the
  // server does not do: a stale tab, a second window, or a request that never
  // came from our form would otherwise walk straight past a decision made at
  // render time.
  const quota = quotaGate({ tier: gate.data.producer.tier, inUse: gate.data.inUse });
  if (quota.kind !== "ok") return renderForm(request, gate, { quota });

  const draft = readDraft(form);
  const result = validateSubmission(draft);
  if (!result.ok) {
    // RE-RENDERED, NOT REDIRECTED. A redirect cannot carry a body, so it would
    // throw away everything the producer typed, and a form that discards what
    // somebody typed is worse than no form.
    return renderForm(request, gate, { draft, errors: result.errors });
  }

  const actor: ActorContext = {
    userId: gate.auth.id,
    producerId: gate.data.producer.id,
    tier: gate.data.producer.tier,
    status: gate.data.producer.status,
  };

  let created: { id: string; slug: string };
  try {
    created = await insertSubmission(gate.sql, actor, result.value);
  } catch (err) {
    const conflict = uniqueConflict(err);
    if (conflict === "slug") {
      return renderForm(request, gate, {
        draft,
        errors: [
          {
            field: "name",
            message:
              `You already have a listing whose name shortens to "${result.value.slug}", which is ` +
              "the address it would live at. Two of your products cannot share one. Give this " +
              "one a name that distinguishes it, or withdraw the other first.",
          },
        ],
      });
    }
    if (conflict === "reference") {
      return renderForm(request, gate, {
        draft,
        errors: [
          {
            field: "referenceSlug",
            message:
              "You already have a listing against this original. One listing per original per " +
              "producer, so the comparison on that page is between two products rather than " +
              "between several of yours.",
          },
        ],
      });
    }
    console.error("submitListing insert failed", err instanceof Error ? err.message : err);
    return page(writeFailed(gate.auth), 503);
  }

  // PRG, and a 303 rather than the 302 the rest of this origin uses: 303 is the
  // status that means "GET the result of what you just posted", so refreshing
  // the page that follows can never resubmit the form.
  return redirect(`/console/submit?submitted=${encodeURIComponent(created.id)}`, { status: 303 });
}

/* ======================================================================== *
 * The form
 * ======================================================================== */

interface FormState {
  draft?: SubmissionDraft;
  errors?: FieldError[];
  quota?: QuotaVerdict;
  unknownReceipt?: boolean;
}

/** Human labels for the error summary. One map, so a field cannot be called
 *  one thing beside its input and another thing in the list at the top. */
const FIELD_LABELS: Record<string, string> = {
  referenceSlug: "The original",
  name: "Product name",
  brand: "Brand",
  concentration: "Concentration",
  priceUsd: "Price",
  bottleMl: "Bottle size",
  "notesTop-0": "Top notes",
  "notesHeart-0": "Heart notes",
  "notesBase-0": "Base notes",
  declaredDifferences: "What is different",
  storeUrl: "Link to the product on your store",
  longevityHoursMin: "Longevity, shortest",
  longevityHoursMax: "Longevity, longest",
  sillageLabel: "Sillage",
  pairingSource: "Who said it",
  pairingQuote: "The quote",
  pairingUrl: "Where it was said",
};

/** Originals grouped by house. 216 in one flat list is a wall; a producer
 *  already thinks in houses. */
const REFERENCE_GROUPS = (() => {
  const byBrand = new Map<string, { value: string; label: string }[]>();
  for (const r of REFERENCES) {
    const list = byBrand.get(r.brand) ?? [];
    list.push({ value: r.slug, label: r.name });
    byBrand.set(r.brand, list);
  }
  return [...byBrand.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([label, options]) => ({ label, options }));
})();

async function renderForm(
  request: Request,
  gate: { auth: AuthUser; sql: Sql; data: ProducerConsoleData },
  state: FormState,
): Promise<Response> {
  const { data } = gate;
  const quota = state.quota ?? quotaGate({ tier: data.producer.tier, inUse: data.inUse });

  if (quota.kind === "unknown-tier") {
    return page(unknownTier(gate.auth, data, quota.tier), 200);
  }
  if (quota.kind === "at-allowance") {
    return page(allowanceFull(gate.auth, data, quota.allowance), 200);
  }

  const token = await csrfToken(request, "submit-listing");
  if (!token) {
    // Unreachable: requireProducer() already proved there is a session cookie.
    // Rendering the form without a token would produce a submit button whose
    // POST is always refused, which is a fake success one click deep.
    return csrfRefused(COPY, "/console");
  }

  const draft = state.draft ?? emptyDraft();
  const errors = state.errors ?? [];
  const errorFor = (field: string) => errors.find((e) => e.field === field)?.message;
  const summary = errors.map((e) => ({
    field: e.field,
    label: FIELD_LABELS[e.field] ?? e.field,
    message: e.message,
  }));

  const body = html`
    ${
      state.unknownReceipt
        ? html`<div class="notice" role="note">
            <p class="notice-title">We could not find that submission on your record</p>
            <p>
              The address carried a submission id that does not belong to this producer, or no
              longer exists. Nothing was changed. Your listings are on
              <a href="/console">the console</a>.
            </p>
          </div>`
        : ""
    }

    ${errorSummary(summary)}

    ${section({
      heading: "What you fill in, and what we fill in",
      lede: html`Worth reading once before the form, because the shape of it is not an
        oversight.`,
      body: html`
        <div class="grid-2">
          ${card(html`
            <h3>Yours</h3>
            <p class="muted">
              Which original this is an alternative to, your product's name, price, size and
              concentration, its note pyramid as top, heart and base, what is genuinely
              different about it, and a link a reader can check it against.
            </p>
          `)}
          ${card(html`
            <h3>Ours, and not on this form</h3>
            <p class="muted">
              The six profile numbers, the family, the verdict and the match score. The six were
              once sliders on a form and were taken out on purpose: our copy-detection check
              compares your declared notes against those numbers, and handing the same party
              both inputs defeats it by construction. It is not a comment on your honesty, it is
              that a check only works while we author one side of it.
              <a href="${CATALOGUE}/about#methodology">How we score</a> is published in full.
            </p>
          `)}
        </div>
      `,
    })}

    ${section({
      heading: "The fragrance",
      lede: html`Everything is required unless it says Optional. Nothing is saved until you
        press submit at the bottom, and if something is wrong you get this page back with what
        you typed still in it.`,
      body: html`
        <form method="post" action="/console/submit" class="submit-form">
          ${csrfInput(CSRF_FIELD, token)}

          ${formGroup({
            legend: "The original it goes against",
            note: html`You choose from the originals we have already researched. You cannot add
              one: the comparison runs against a note pyramid we wrote up ourselves, so a
              fragrance we have not covered has nothing to be scored against, and we do not
              commit to a date for covering one.`,
            body: selectField({
              name: "referenceSlug",
              label: "The original",
              required: true,
              emptyLabel: "Choose an original",
              groups: REFERENCE_GROUPS,
              value: draft.referenceSlug,
              error: errorFor("referenceSlug"),
              hint: html`${String(REFERENCES.length)} originals, grouped by house. One listing
                per original per producer, so the page it lands on compares your product with
                the original rather than with several of yours.`,
            }),
          })}

          ${formGroup({
            legend: "Your product",
            body: html`
              ${field({
                name: "name",
                label: "Product name",
                required: true,
                value: draft.name,
                error: errorFor("name"),
                placeholder: "As it appears on your own store",
                hint: html`The web address for this listing is built from this name, lowercased
                  and hyphenated. You do not type that part and it is shown back to you once the
                  listing exists.`,
              })}
              ${field({
                name: "brand",
                label: "Brand",
                required: true,
                value: draft.brand,
                error: errorFor("brand"),
                hint: html`The trading identity this sells under. It has to be yours: listing
                  under a company you do not control is the one thing we enforce technically as
                  well as contractually.`,
              })}
              ${field({
                name: "concentration",
                label: "Concentration",
                required: true,
                value: draft.concentration,
                error: errorFor("concentration"),
                list: CONCENTRATION_LIST_ID,
                placeholder: "Eau de Parfum",
                hint: html`Start typing for the formats already in the catalogue. Type something
                  else if yours is not there: an oil, a solid, anything you actually sell.`,
              })}
              <div class="grid-2">
                ${field({
                  name: "priceUsd",
                  label: "Price, US dollars",
                  type: "number",
                  required: true,
                  min: "0",
                  step: "0.01",
                  inputMode: "decimal",
                  value: draft.priceUsd,
                  error: errorFor("priceUsd"),
                  hint: html`What you sell it for. The comparison on the public page is against
                    the retail price of the original, so this figure is doing real work.`,
                })}
                ${field({
                  name: "bottleMl",
                  label: "Bottle size, millilitres",
                  type: "number",
                  required: true,
                  min: "1",
                  step: "1",
                  inputMode: "numeric",
                  value: draft.bottleMl,
                  error: errorFor("bottleMl"),
                  hint: html`Whole millilitres. Price and size are compared together, so a
                    30ml is not read as being cheaper than a 100ml.`,
                })}
              </div>
            `,
          })}

          ${formGroup({
            legend: "The note pyramid",
            note: html`Three tiers, as you publish them. Start typing and the box suggests notes
              the catalogue already records, which is worth using: we compare your notes against
              the original's by name, so "Ice" and "Ice Accord" are two different materials as
              far as the arithmetic is concerned. You are not limited to the list. If your
              fragrance contains something we have never recorded, type it: it is accepted, a
              person looks at it, and it is never a reason to refuse a listing.`,
            body: html`
              <div class="note-tiers">
                ${noteTier({
                  name: "notesTop",
                  legend: "Top notes",
                  singular: "top note",
                  values: draft.notesTop,
                  listId: NOTE_LIST_ID,
                  error: errorFor("notesTop-0"),
                  hint: html`What it opens with. One is required, the rest are optional.`,
                })}
                ${noteTier({
                  name: "notesHeart",
                  legend: "Heart notes",
                  singular: "heart note",
                  values: draft.notesHeart,
                  listId: NOTE_LIST_ID,
                  error: errorFor("notesHeart-0"),
                  hint: html`What it settles into.`,
                })}
                ${noteTier({
                  name: "notesBase",
                  legend: "Base notes",
                  singular: "base note",
                  values: draft.notesBase,
                  listId: NOTE_LIST_ID,
                  error: errorFor("notesBase-0"),
                  hint: html`What is left at the end of the day.`,
                })}
              </div>
              <p class="field-hint">
                Six boxes per tier. The widest pyramid in our own catalogue holds
                ${String(MAX_NOTES_PER_TIER)}, so six is a limit on this form rather than a claim
                about what a pyramid may contain. If yours is longer, put the
                ${String(NOTE_INPUTS_PER_TIER)} that matter most and say so in the next field.
              </p>
            `,
          })}

          ${formGroup({
            legend: "What is different, and what is in it",
            body: html`
              ${textareaField({
                name: "declaredDifferences",
                label: "What is genuinely different from the original",
                required: true,
                rows: 4,
                value: draft.declaredDifferences,
                error: errorFor("declaredDifferences"),
                placeholder: "Same accord, no oakmoss. Drier and shorter on skin.",
                hint: html`Published as your own words, beside the verdict we write in ours. At
                  least ${String(MIN_DIFFERENCES_CHARS)} characters, which is a floor low enough
                  that a blunt honest answer passes. A padded one is worse, not better: this is
                  the field a reader checks against your own product page.`,
              })}
              ${textareaField({
                name: "ingredients",
                label: "Ingredient list",
                rows: 3,
                value: draft.ingredients,
                error: errorFor("ingredients"),
                placeholder: "alcohol, aqua, parfum, limonene",
                hint: html`Optional, and leaving it empty is genuinely safe: the formula falls
                  back to its other components rather than scoring a missing list as no overlap.
                  Commas or one per line. Do not reconstruct one from memory to fill the box.`,
              })}
            `,
          })}

          ${formGroup({
            legend: "Where a reader can check this",
            body: field({
              name: "storeUrl",
              label: "Link to this product on your store",
              type: "url",
              required: true,
              value: draft.storeUrl,
              error: errorFor("storeUrl"),
              placeholder: "https://",
              hint: html`Has to be https, cannot carry a username or password, and cannot be an
                affiliate, tracking or shortened link, including your own network's. A link
                whose destination can change after we have approved it is not a link we can
                publish. Campaign parameters are stripped before it is stored.`,
            }),
          })}

          ${formGroup({
            legend: "How it wears, as you describe it",
            note: html`These three are your claim about your own product and they are labelled
              as such wherever they appear. They feed no part of the match score: the longevity
              and sillage numbers in the profile are separate, they are ours, and they are not
              on this form.`,
            body: html`
              <div class="grid-2">
                ${field({
                  name: "longevityHoursMin",
                  label: "Longevity, shortest",
                  type: "number",
                  required: true,
                  min: "1",
                  step: "1",
                  inputMode: "numeric",
                  value: draft.longevityHoursMin,
                  error: errorFor("longevityHoursMin"),
                  hint: html`Whole hours on skin.`,
                })}
                ${field({
                  name: "longevityHoursMax",
                  label: "Longevity, longest",
                  type: "number",
                  required: true,
                  min: "1",
                  step: "1",
                  inputMode: "numeric",
                  value: draft.longevityHoursMax,
                  error: errorFor("longevityHoursMax"),
                  hint: html`Not smaller than the shortest.`,
                })}
              </div>
              ${selectField({
                name: "sillageLabel",
                label: "Sillage",
                required: true,
                emptyLabel: "Choose one",
                options: SILLAGE_LABELS.map((s) => ({ value: s, label: s })),
                value: draft.sillageLabel,
                error: errorFor("sillageLabel"),
                hint: html`The four the catalogue uses. A value outside them is one the public
                  site could not render, which is why this is a list rather than a box.`,
              })}
            `,
          })}

          ${formGroup({
            legend: "A quote, if somebody else has written about it",
            note: html`All optional, and all three or none of the first two. A quote with nobody
              attached to it is an unattributed claim, which is the one thing a quote must not
              be.`,
            body: html`
              ${field({
                name: "pairingSource",
                label: "Who said it",
                value: draft.pairingSource,
                error: errorFor("pairingSource"),
                placeholder: "A publication, a reviewer, a retailer",
                hint: html`Named, so a reader can go and check.`,
              })}
              ${textareaField({
                name: "pairingQuote",
                label: "The quote",
                rows: 2,
                value: draft.pairingQuote,
                error: errorFor("pairingQuote"),
                hint: html`Their words, not a summary of them.`,
              })}
              ${field({
                name: "pairingUrl",
                label: "Where it was said",
                type: "url",
                value: draft.pairingUrl,
                error: errorFor("pairingUrl"),
                placeholder: "https://",
                hint: html`A link to the page it is on.`,
              })}
            `,
          })}

          ${notShipped({
            what: "There is no way to upload the photograph, and a listing needs one",
            reason: html`Our own producer terms say a photograph is required and that a listing
              may not be published without one. There is no upload on this origin: no file
              storage, no rights declaration recorded against an image, and no path for getting
              a file into the catalogue's static build. So a submission made on this form is
              genuinely saved and genuinely goes to a person, and it cannot reach publication as
              those terms are written until you send us a photograph by email. Reply to whoever
              you have been corresponding with, or write to
              <a href="mailto:contact@counterscent.com">contact@counterscent.com</a> with the
              product name. We are telling you here rather than collecting a form we cannot
              honour.`,
          })}

          <div class="actions submit-actions">
            ${button("Submit this fragrance")}
            <p class="actions-note">
              This records the listing and puts it in front of a person. It does not publish
              anything, it does not score anything, and nothing here can be paid for.
            </p>
          </div>
        </form>

        ${datalist(NOTE_LIST_ID, NOTE_VOCABULARY)}
        ${datalist(CONCENTRATION_LIST_ID, CONCENTRATION_SUGGESTIONS)}
      `,
    })}

    ${section({
      heading: "What happens after you press submit",
      body: html`
        <ul class="plain-list">
          <li>
            It is recorded as ${stateBadge("in-review")} and waits for a person. Nothing is
            approved automatically, at any tier, and nothing ever will be.
          </li>
          <li>
            We do not tell you how long that takes. Nobody has been through it yet, so any
            figure would be invented, and our own terms commit us to publishing a review time
            only once we have measured real ones.
          </li>
          <li>
            Approving is not publishing. An approved listing joins the catalogue at the next
            site build, which is why ${stateBadge("approved")} is a state of its own.
          </li>
          <li>
            You can withdraw it at any point from ${raw2("the console")}, on any plan. Withdrawing
            frees your allowance slot and keeps the record.
          </li>
        </ul>
      `,
    })}
  `;

  return page(
    layout({
      title: COPY.title,
      heading: "Submit a fragrance",
      nav: { current: "submit", showReview: true },
      status: {
        label: errors.length ? "Not submitted" : "Console live",
        tone: errors.length ? "outline" : "solid",
        note: errors.length
          ? html`Nothing was saved. The list at the top says what needs fixing, and every box
              still holds what you typed.`
          : html`This form writes to your producer record, ${data.producer.name}. It saves a
              submission and sends it to a person; it does not publish anything.`,
      },
      standfirst: html`One listing, against one original we have already researched. Everything
        you enter is published as your own statement about your own product.`,
      body,
    }),
    errors.length ? 422 : 200,
    { allowForms: true },
  );
}

/** A link inside a list item, where the html`` tag is already nesting. Kept as
 *  a tiny helper so the anchor is not repeated three times. */
function raw2(label: string): Html {
  return html`<a href="/console">${label}</a>`;
}

/* ======================================================================== *
 * The screens that replace the form
 * ======================================================================== */

/**
 * The allowance is full.
 *
 * NO SUBSCRIBE BUTTON, and that is the whole point of this screen existing in
 * its own function. This is the single most likely place this product fakes
 * success: it is the exact moment a subscription flow wants a button, and the
 * button would do nothing. There is no checkout on this origin, no payment
 * provider connected to it, and no way for anyone to take money today.
 */
function allowanceFull(auth: AuthUser, data: ProducerConsoleData, allowance: number): Html {
  const lead =
    allowance === 1
      ? html`The free tier covers one active listing and you have it.`
      : html`The plan on file covers ${String(allowance)} listings and all of them are in use.`;

  return layout({
    title: COPY.title,
    heading: allowance === 1 ? "Your free listing is in use" : "This plan's listings are all in use",
    nav: { current: "submit", showReview: true },
    status: {
      label: "Allowance full",
      tone: "outline",
      note: html`Nothing is wrong with your account. There is simply no slot for another
        listing on it today.`,
    },
    standfirst: html`${data.producer.name} has ${String(data.inUse)} of
      ${String(allowance)} counting against the allowance.`,
    body: html`
      <div class="stack">
        ${notShipped({
          what: "A second listing needs a paid tier, and no paid tier is open",
          reason: html`${lead} There is no checkout on this site, no payment provider connected
            to it, and no way for anyone to take money from you today. We are not showing you a
            Subscribe button that does nothing, because a button that cannot work is a slower
            way of saying this.`,
        })}
        <p>
          <strong>What actually moves this:</strong> write to
          <a href="mailto:contact@counterscent.com">contact@counterscent.com</a> and tell us how
          many fragrances you would list and which originals they go against. A person reads it.
          What the paid tiers cost and contain is waiting on exactly that, because nobody has
          listed here yet and we would rather price against real catalogues than a guess. We
          cannot give you a date and we will not invent one.
        </p>
        <p>
          <strong>What you can do on your own:</strong> withdrawing a listing frees its slot
          immediately, on every plan including this one. A withdrawn listing keeps its record and
          its click history; withdrawal is a change of state, never a deletion. The control is in
          the row of the listing it acts on, on <a href="/console">the console</a>.
        </p>
        <p class="muted">Signed in as <span class="wrap-anywhere">${auth.email}</span>.</p>
      </div>
    `,
  });
}

/**
 * There is a Subscription row and its tier is a string this console has never
 * heard of.
 *
 * WE WILL NOT GUESS AN ALLOWANCE. `Subscription.tier` is a free string in the
 * schema on purpose, because tier names are a business decision still open, so
 * this is reachable by somebody renaming a plan rather than only by a bug.
 * Guessing low would tell a paying producer they are full; guessing high would
 * let them past a limit they are paying to have raised.
 */
function unknownTier(auth: AuthUser, data: ProducerConsoleData, tier: string): Html {
  return layout({
    title: COPY.title,
    heading: "We do not know what your plan allows",
    nav: { current: "submit", showReview: true },
    status: {
      label: "Allowance not known",
      tone: "outline",
      note: html`Nothing was saved. This is ours to clear, not yours.`,
    },
    standfirst: html`${data.producer.name} has a subscription on file recorded as
      "<span class="wrap-anywhere">${tier}</span>", and this console has no allowance for that
      name.`,
    body: section({
      heading: "Why this refuses rather than picking a number",
      body: html`
        <div class="stack">
          ${notShipped({
            what: "The submit form is not shown until we know how many listings your plan covers",
            reason: html`Guessing in either direction is worse than stopping. Guessing low would
              tell you that you are full when you may not be; guessing high would let you past a
              limit you are paying to have raised. Neither is a thing to do quietly to somebody's
              account.`,
          })}
          <p>
            Write to <a href="mailto:contact@counterscent.com">contact@counterscent.com</a> and
            quote the plan name above. It is specific enough for us to find and fix in one go.
          </p>
          <p class="muted">Signed in as <span class="wrap-anywhere">${auth.email}</span>.</p>
          <p><a href="/console">Back to the console</a>.</p>
        </div>
      `,
    }),
  });
}

/** The insert itself failed for a reason that is not a duplicate. Nothing was
 *  written, and saying so is the whole content of the page. */
function writeFailed(auth: AuthUser): Html {
  return layout({
    title: COPY.title,
    heading: "That did not save",
    nav: { current: "submit", showReview: true },
    status: {
      label: "Not saved",
      tone: "outline",
      note: html`The database refused the write. Nothing was recorded.`,
    },
    standfirst: html`You are signed in as <span class="wrap-anywhere">${auth.email}</span>, and
      the submission was not created.`,
    body: section({
      heading: "What to do",
      body: html`
        <div class="stack">
          <p>
            Open <a href="/console/submit">the form</a> again and resubmit. We would rather ask
            you to retype it than tell you it saved when it did not.
          </p>
          <p>
            If it happens twice, write to
            <a href="mailto:contact@counterscent.com">contact@counterscent.com</a> with the
            product name and roughly when, which is enough for us to find it in the logs.
          </p>
        </div>
      `,
    }),
  });
}

/* ======================================================================== *
 * The receipt
 * ======================================================================== */

/**
 * What actually happened, and nothing more.
 *
 * NO REVIEW-TIME PROMISE, not even a soft one. PRODUCER-TERMS section 5 commits
 * us to publishing a review time only once real ones exist, and none do. NO
 * QUEUE POSITION either, because there is no queue: submissions wait for a
 * person and that person is one person.
 */
function received(auth: AuthUser, data: ProducerConsoleData, receipt: SubmissionReceipt): Html {
  const notes = [
    ...(receipt.notesTop ?? []),
    ...(receipt.notesHeart ?? []),
    ...(receipt.notesBase ?? []),
  ];
  const audit = auditNotes(notes);
  const reference = REFERENCES.find((r) => r.slug === receipt.referenceSlug);

  return layout({
    title: "Submitted",
    heading: "Recorded, and waiting for a person",
    nav: { current: "listings", showReview: true },
    status: {
      label: "Console live",
      tone: "solid",
      note: html`This is a real record in our database, not a confirmation screen with nothing
        behind it.`,
    },
    standfirst: html`<strong>${receipt.name}</strong> by ${receipt.brand}, against
      ${reference ? html`${reference.name} by ${reference.brand}` : html`${receipt.referenceSlug}`}.`,
    body: html`
      ${section({
        heading: "Where it is now",
        body: html`
          <div class="stack">
            <div class="grid-2">
              ${card(html`
                <h3>State</h3>
                <p>${stateBadge("in-review")}</p>
                <p class="muted">
                  It waits for a person. Nothing is approved automatically, at any tier. Approving
                  is not publishing either: an approved listing joins the catalogue at the next
                  site build, which is why ${stateBadge("approved")} is a state of its own.
                </p>
              `)}
              ${card(html`
                <h3>Its address</h3>
                <p><code class="wrap-anywhere">${receipt.slug}</code></p>
                <p class="muted">
                  Built from the name you gave, lowercased and hyphenated. You did not type it
                  and you are seeing it now so that it is not a surprise later. It is also the
                  reason two of your products cannot share a name.
                </p>
              `)}
            </div>

            <p>
              <strong>No date, and no position in a queue.</strong> There is no queue: this goes
              in front of a person and that is the whole mechanism. Our own terms commit us to
              publishing a review time only once we have measured real ones, and nobody has been
              through this yet, so any figure we gave you now would be invented.
            </p>

            <p>
              <strong>Nothing has been scored.</strong> The match score is computed by the
              catalogue's own build from the notes you declared and the profile numbers we
              derive, and neither exists for this listing yet.
            </p>
          </div>
        `,
      })}

      ${
        audit.offVocabulary.length || audit.spelledDifferently.length
          ? section({
              heading: "Two things we noticed in your notes",
              lede: html`Neither is a problem with your submission and neither holds it up. They
                are recorded against it so the person reading it can see them, and you are being
                told the same thing they are.`,
              body: html`
                <div class="stack">
                  ${
                    audit.offVocabulary.length
                      ? card(html`
                          <h3>Notes we have never recorded</h3>
                          <p>${audit.offVocabulary.join(", ")}</p>
                          <p class="muted">
                            Our catalogue has no entry for
                            ${audit.offVocabulary.length === 1 ? "that one" : "those"}, in any
                            spelling. That is allowed: you may declare a material we have never
                            written up, and constraining you to our vocabulary would be
                            constraining what you are allowed to say about your own product. A
                            person looks at it.
                          </p>
                        `)
                      : ""
                  }
                  ${
                    audit.spelledDifferently.length
                      ? card(html`
                          <h3>Notes we spell differently</h3>
                          <ul class="plain-list">
                            ${audit.spelledDifferently.map(
                              (s) =>
                                html`<li>
                                  You wrote <strong>${s.typed}</strong>, we record it as
                                  <strong>${s.catalogue}</strong>.
                                </li>`,
                            )}
                          </ul>
                          <p class="muted">
                            We stored exactly what you typed and did not change it. It is worth
                            knowing because notes are compared by name: a difference in spelling
                            is a difference in the arithmetic, not a difference in wording. Tell
                            us if you would rather it matched ours.
                          </p>
                        `)
                      : ""
                  }
                </div>
              `,
            })
          : ""
      }

      ${section({
        heading: "The photograph is still outstanding",
        body: notShipped({
          what: "This listing cannot be published until we have a photograph, and there is nowhere here to upload one",
          reason: html`Our producer terms require a photograph and there is no upload on this
            origin: no file storage, no rights declaration recorded against an image, and no path
            for getting a file into the catalogue's static build. Send it by email, to
            <a href="mailto:contact@counterscent.com">contact@counterscent.com</a>, with the
            product name. Saying this twice is deliberate: it was on the form and it is here,
            because a submission that cannot publish and does not say so is the fake success this
            console exists not to produce.`,
        }),
      })}

      ${section({
        heading: "What you can do now",
        body: html`
          <ul class="plain-list">
            <li>
              <a href="/console">Your listings</a> shows this one in the table, with its state and
              the record of this submission.
            </li>
            <li>
              You can withdraw it at any point, on any plan, from the row it sits in. Withdrawing
              frees your allowance slot immediately and keeps the record.
            </li>
            <li>
              ${
                data.producer.tier === null
                  ? html`There is no subscription record on this producer, so the console shows
                      no plan. For counting purposes the free allowance of one active listing
                      applies.`
                  : html`Your plan is recorded as
                      <span class="wrap-anywhere">${data.producer.tier}</span>.`
              }
            </li>
          </ul>
          <p class="muted">Signed in as <span class="wrap-anywhere">${auth.email}</span>.</p>
        `,
      })}
    `,
  });
}
