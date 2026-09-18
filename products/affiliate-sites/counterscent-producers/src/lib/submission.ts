import type { Sql } from "./auth";
import { generateId } from "./auth";
import { validateProducerLink } from "./producer-link";
import {
  CONCENTRATIONS,
  NOTE_INPUTS_PER_TIER,
  NOTE_VOCABULARY,
  REFERENCES,
  SILLAGE_LABELS,
} from "../generated/catalogue";

/**
 * Everything that turns a filled-in form into a row, and everything that
 * refuses to.
 *
 * Kept out of the route for the same reason src/lib/producer.ts is: the route
 * renders several screens and the rules below have to be the same rules on the
 * GET that shows the form and the POST that accepts it.
 *
 * ============================================================================
 * WHAT A PRODUCER SUPPLIES, AND WHAT THEY MUST NEVER SUPPLY
 * ============================================================================
 *
 * Never on this form, and the reason is structural rather than cautious: the
 * six facet fields, `family`, `verdict`, the match score, `verificationStatus`,
 * and `pyramidSource`.
 *
 * `affiliateLinkId` is no longer on this list because it is no longer on any
 * list: no tier takes commission since 2026-09-18, so nothing writes it at all.
 * The three `founderOverride*` fields left the same day, dropped outright
 * (migration 20260918120000_drop_founder_override) when the founder removed the
 * one exception to the 95% ceiling.
 *
 * The catalogue's copy-detection check flags a listing only when the notes AND
 * the facets both match the reference, and it has a second independent input
 * precisely because the facets are OURS. Hand the same party both and it is
 * defeated by construction: copy the reference's notes verbatim, nudge one
 * facet, and nothing fires while the note score sits at its ceiling. Every
 * producer could then reach the cap and rank first on their own reference,
 * which is rank purchasable in substance while remaining unpurchasable in
 * letter. The six sliders were removed from the catalogue's own
 * components/producers/submission-form.tsx for exactly this, and they do not
 * come back here, including as "optional".
 *
 * NOTHING IN THIS FILE RENDERS A VERDICT ON A SUBMISSION. Validation here is
 * mechanical only - a field is missing, a number is not a number, a link is a
 * shortener - which stops a producer BEFORE the submission exists, so there is
 * no wrong decision to appeal, only an incomplete form. Whether a listing is a
 * copy is a judgement call, it belongs to a person, and no function here is
 * allowed to pre-empt it.
 */

/* ---------------------------------------------------------------------- *
 * The sentinels
 * ---------------------------------------------------------------------- */

/**
 * ============================================================================
 * PLACEHOLDER DATA, LABELLED WHERE IT IS WRITTEN.
 * ============================================================================
 *
 * `family` and all six `facet*` columns are NOT NULL with no default
 * (prisma/migrations/20260914092338_init_producer_programme/migration.sql,
 * and confirmed against the live database's information_schema on 2026-09-16).
 * The producer must not supply them, nothing in this Worker can derive them,
 * and making them nullable would need a migration. So the insert has to write
 * something, and what it writes has to be impossible to mistake for a real
 * value.
 *
 * -1 IS OUT OF RANGE ON PURPOSE. The catalogue's facet scale is documented as
 * 0 to 10 in lib/types.ts, and the observed values across all 216 references
 * run 1 to 10 (measured by scripts/generate-constants.mjs, which prints the
 * range). -1 is outside both, so it cannot be read as a weak score, and it is
 * queryable: `WHERE "facetFreshness" < 0` finds every submission nobody has
 * scored yet.
 *
 * AN IN-RANGE DEFAULT WOULD BE WORSE. A 0 or a 5 looks like a derived number
 * and would be treated as one by the next person to read the table. A
 * plausible-looking fake is more dangerous than an obviously impossible one.
 *
 * WHAT WOULD MAKE THESE REAL: an editor setting the facets at review, from the
 * declared notes and concentration, the way the catalogue's own
 * lib/facet-derivation.ts does it. That is step 7 and it is not built. Until
 * it is, every row this file writes carries these values and the AuditEvent it
 * writes alongside says so explicitly.
 */
export const FACET_SENTINEL = -1;

/** Same reasoning, for `family`. The empty string is not a fragrance family
 *  and cannot be mistaken for one. */
export const FAMILY_SENTINEL = "";

/** The floor on the "what is genuinely different" answer, in characters.
 *
 *  DELIBERATELY LOW. The point is to catch an empty box and a stray keystroke,
 *  not to demand a paragraph: a terse honest answer ("Same accord, no oakmoss")
 *  is a better submission than three padded sentences, and a floor high enough
 *  to reject the first one teaches producers to pad. */
export const MIN_DIFFERENCES_CHARS = 20;

/* ---------------------------------------------------------------------- *
 * The slug
 * ---------------------------------------------------------------------- */

/**
 * THE SLUG IS DERIVED, NOT TYPED, and that overrules CONSOLE-PLAN 4.3, which
 * lists it among the producer-declared fields. Founder decision, 2026-09-16.
 *
 * The reasoning: a slug ends up in a public URL and in the `/go/` identifier.
 * A producer has no reason to care about it and every reason to get it wrong -
 * spaces, capitals, an accented character, their brand name repeated - and
 * every one of those is a field we would then have to explain, validate and
 * reject on. Deriving it removes the whole category. The derived value is
 * shown back on the success page, so nobody is surprised by it later.
 */
export function slugifyListingName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/* ---------------------------------------------------------------------- *
 * Notes against the catalogue's vocabulary
 * ---------------------------------------------------------------------- */

/** Lowercase spelling to the catalogue's own spelling, built once. */
const VOCABULARY_BY_LOWER = new Map<string, string>(
  NOTE_VOCABULARY.map((n) => [n.toLowerCase(), n]),
);
const VOCABULARY_EXACT = new Set<string>(NOTE_VOCABULARY);

export interface NoteAudit {
  /** Notes the catalogue has never recorded in any spelling. */
  offVocabulary: string[];
  /** Notes we do hold, spelled differently from how we hold them. */
  spelledDifferently: { typed: string; catalogue: string }[];
}

/**
 * Three honest buckets, and NONE of them rejects anything.
 *
 * A producer may legitimately declare a material our catalogue has never
 * recorded, and constraining them to our vocabulary would be constraining what
 * they are allowed to honestly say about their own product. So an
 * off-vocabulary note is accepted and flagged.
 *
 * FLAGGED HOW, AND EXPLICITLY NOT HOW. This does NOT set
 * `verificationStatus = FLAGGED`. That value belongs to the copy-detection
 * gate and is a hard publish gate; reusing it for "we have not heard of this
 * note" would be a lie about what the flag means to anyone reading the table
 * later. The finding goes in the AuditEvent payload and on the producer's
 * success page, neutrally, because it is not a problem with their submission.
 *
 * THE SECOND BUCKET IS THE ONE THAT EARNS ITS KEEP. The catalogue's own
 * spelling is what a match score is computed against, and this repository has
 * already recorded a real case of it deciding an outcome: a listing cleared the
 * copy gate only because the merchant wrote "Ice" and "Lotus" where the
 * catalogue records "Ice Accord" and "Lotus Flower". So a note we DO hold,
 * spelled differently, is worth telling a producer about. What this must not do
 * is quietly rewrite what they typed: the stored value is theirs, exactly as
 * entered, and the difference is reported rather than corrected.
 */
export function auditNotes(notes: string[]): NoteAudit {
  const offVocabulary: string[] = [];
  const spelledDifferently: { typed: string; catalogue: string }[] = [];
  for (const note of notes) {
    if (VOCABULARY_EXACT.has(note)) continue;
    const canonical = VOCABULARY_BY_LOWER.get(note.toLowerCase());
    if (canonical) spelledDifferently.push({ typed: note, catalogue: canonical });
    else offVocabulary.push(note);
  }
  return { offVocabulary, spelledDifferently };
}

/* ---------------------------------------------------------------------- *
 * The form, as typed
 * ---------------------------------------------------------------------- */

/** Exactly what came off the form, unvalidated, so a failed POST can put every
 *  character back where the producer left it. A form that discards what
 *  somebody typed is worse than no form. */
export interface SubmissionDraft {
  referenceSlug: string;
  name: string;
  brand: string;
  concentration: string;
  priceUsd: string;
  bottleMl: string;
  notesTop: string[];
  notesHeart: string[];
  notesBase: string[];
  ingredients: string;
  declaredDifferences: string;
  storeUrl: string;
  longevityHoursMin: string;
  longevityHoursMax: string;
  sillageLabel: string;
  pairingSource: string;
  pairingQuote: string;
  pairingUrl: string;
}

export function emptyDraft(): SubmissionDraft {
  const blanks = () => Array.from({ length: NOTE_INPUTS_PER_TIER }, () => "");
  return {
    referenceSlug: "",
    name: "",
    brand: "",
    concentration: "",
    priceUsd: "",
    bottleMl: "",
    notesTop: blanks(),
    notesHeart: blanks(),
    notesBase: blanks(),
    ingredients: "",
    declaredDifferences: "",
    storeUrl: "",
    longevityHoursMin: "",
    longevityHoursMax: "",
    sillageLabel: "",
    pairingSource: "",
    pairingQuote: "",
    pairingUrl: "",
  };
}

function str(form: FormData, key: string): string {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function tier(form: FormData, key: string): string[] {
  const out: string[] = [];
  for (let i = 0; i < NOTE_INPUTS_PER_TIER; i++) out.push(str(form, `${key}-${i}`));
  return out;
}

export function readDraft(form: FormData): SubmissionDraft {
  return {
    referenceSlug: str(form, "referenceSlug"),
    name: str(form, "name"),
    brand: str(form, "brand"),
    concentration: str(form, "concentration"),
    priceUsd: str(form, "priceUsd"),
    bottleMl: str(form, "bottleMl"),
    notesTop: tier(form, "notesTop"),
    notesHeart: tier(form, "notesHeart"),
    notesBase: tier(form, "notesBase"),
    ingredients: str(form, "ingredients"),
    declaredDifferences: str(form, "declaredDifferences"),
    storeUrl: str(form, "storeUrl"),
    longevityHoursMin: str(form, "longevityHoursMin"),
    longevityHoursMax: str(form, "longevityHoursMax"),
    sillageLabel: str(form, "sillageLabel"),
    pairingSource: str(form, "pairingSource"),
    pairingQuote: str(form, "pairingQuote"),
    pairingUrl: str(form, "pairingUrl"),
  };
}

/* ---------------------------------------------------------------------- *
 * Validation
 * ---------------------------------------------------------------------- */

/** An error and the field it belongs to. Attached to the control rather than
 *  listed at the top alone, so a reader who is not looking at the layout still
 *  learns which box is wrong. */
export interface FieldError {
  field: string;
  message: string;
}

/** What the insert actually writes. Every value here has been through a check. */
export interface ValidSubmission {
  referenceSlug: string;
  slug: string;
  name: string;
  brand: string;
  concentration: string;
  priceUsd: number;
  bottleMl: number;
  notesTop: string[];
  notesHeart: string[];
  notesBase: string[];
  ingredients: string[];
  declaredDifferences: string;
  storeUrl: string;
  longevityHoursMin: number;
  longevityHoursMax: number;
  sillageLabel: string;
  pairingSource: string | null;
  pairingQuote: string | null;
  pairingUrl: string | null;
}

const REFERENCE_SLUGS = new Set(REFERENCES.map((r) => r.slug));
const SILLAGE_SET = new Set(SILLAGE_LABELS);

/** Postgres INTEGER. A value past this is a database error rather than a
 *  judgement about the product, which is why checking it is mechanical. */
const INT_MAX = 2_147_483_647;

function wholeNumber(raw: string): number | null {
  if (!/^\d+$/.test(raw)) return null;
  const n = Number(raw);
  if (!Number.isSafeInteger(n) || n > INT_MAX) return null;
  return n;
}

export function validateSubmission(
  draft: SubmissionDraft,
): { ok: true; value: ValidSubmission } | { ok: false; errors: FieldError[] } {
  const errors: FieldError[] = [];
  const add = (field: string, message: string) => errors.push({ field, message });

  if (!draft.referenceSlug) {
    add("referenceSlug", "Choose the original this is an alternative to.");
  } else if (!REFERENCE_SLUGS.has(draft.referenceSlug)) {
    // Not reachable from the <select>, which is why this is phrased as our
    // problem rather than theirs. It is here because a POST does not have to
    // come from our form.
    add(
      "referenceSlug",
      "That original is not in our catalogue. You can only compare against one we have " +
        "already researched, and you cannot add one here.",
    );
  }

  if (!draft.name) add("name", "Your product needs a name.");
  if (!draft.brand) add("brand", "Say which of your brands this sells under.");
  if (!draft.concentration) {
    add("concentration", "Say what this is: an eau de parfum, an extrait, an oil.");
  }

  const slug = slugifyListingName(draft.name);
  if (draft.name && !slug) {
    add(
      "name",
      "We build the web address for this listing out of its name, and this name leaves " +
        "nothing to build one from. Add at least one letter or number.",
    );
  }

  const price = Number(draft.priceUsd);
  if (!draft.priceUsd) add("priceUsd", "Add what you sell this for, in US dollars.");
  else if (!Number.isFinite(price) || price <= 0) {
    add("priceUsd", "That is not a price. Use digits, above zero, without a currency symbol.");
  } else if (price > 1_000_000) {
    add("priceUsd", "That price is outside what this field can store. Check the figure.");
  }

  const ml = wholeNumber(draft.bottleMl);
  if (!draft.bottleMl) add("bottleMl", "Add the bottle size in millilitres.");
  else if (ml === null || ml <= 0) {
    add("bottleMl", "Bottle size has to be a whole number of millilitres, above zero.");
  }

  // Keyed to the three note tiers rather than `keyof SubmissionDraft`, so the
  // record below is exhaustive by type. With noUncheckedIndexedAccess on, a
  // Record<string, string[]> would hand back `string[] | undefined` at every
  // read site even though this loop always fills all three.
  type NoteTier = "notesTop" | "notesHeart" | "notesBase";
  const tiers: [NoteTier, string, string][] = [
    ["notesTop", "notesTop-0", "top"],
    ["notesHeart", "notesHeart-0", "heart"],
    ["notesBase", "notesBase-0", "base"],
  ];
  const cleaned: Record<NoteTier, string[]> = { notesTop: [], notesHeart: [], notesBase: [] };
  for (const [key, firstField, label] of tiers) {
    const values = (draft[key] as string[]).map((v) => v.trim()).filter(Boolean);
    // Deduplicate within a tier: the same note twice in one tier is a slip,
    // and silently storing it would double its weight in a comparison.
    const seen = new Set<string>();
    const unique: string[] = [];
    for (const v of values) {
      const k = v.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      unique.push(v);
    }
    cleaned[key] = unique;
    if (unique.length === 0) add(firstField, `Add at least one ${label} note.`);
  }

  if (!draft.declaredDifferences) {
    add("declaredDifferences", "Say what is genuinely different about yours.");
  } else if (draft.declaredDifferences.length < MIN_DIFFERENCES_CHARS) {
    add(
      "declaredDifferences",
      `A few more words, please: at least ${MIN_DIFFERENCES_CHARS} characters. This can be ` +
        "short and blunt, and a short honest answer is better than a padded one.",
    );
  }

  const link = validateProducerLink(draft.storeUrl);
  if (!link.ok) add("storeUrl", link.message ?? "That link cannot be used.");

  const low = wholeNumber(draft.longevityHoursMin);
  const high = wholeNumber(draft.longevityHoursMax);
  if (!draft.longevityHoursMin || low === null || low <= 0) {
    add("longevityHoursMin", "Whole hours, above zero.");
  }
  if (!draft.longevityHoursMax || high === null || high <= 0) {
    add("longevityHoursMax", "Whole hours, above zero.");
  }
  if (low !== null && high !== null && low > 0 && high > 0 && low > high) {
    add("longevityHoursMax", "The longest figure cannot be smaller than the shortest one.");
  }

  if (!draft.sillageLabel) add("sillageLabel", "Pick the one that fits best.");
  else if (!SILLAGE_SET.has(draft.sillageLabel)) {
    add("sillageLabel", "Pick one of the listed options.");
  }

  // Optional, and the pairing is all-or-nothing: a quote with nobody attached
  // to it is an unattributed claim, which is the one thing a quote must not be.
  const pairingFilled = [draft.pairingSource, draft.pairingQuote].filter(Boolean).length;
  if (pairingFilled === 1) {
    add(
      draft.pairingQuote ? "pairingSource" : "pairingQuote",
      "A quote needs both the words and who said them. Fill in both, or leave both empty.",
    );
  }
  if (draft.pairingUrl) {
    try {
      const u = new URL(draft.pairingUrl);
      if (u.protocol !== "https:" && u.protocol !== "http:") throw new Error("scheme");
    } catch {
      add("pairingUrl", "That is not a full web address. Leave it empty if you do not have one.");
    }
  }

  if (errors.length) return { ok: false, errors };

  return {
    ok: true,
    value: {
      referenceSlug: draft.referenceSlug,
      slug,
      name: draft.name,
      brand: draft.brand,
      concentration: draft.concentration,
      priceUsd: price,
      bottleMl: ml as number,
      notesTop: cleaned.notesTop,
      notesHeart: cleaned.notesHeart,
      notesBase: cleaned.notesBase,
      ingredients: parseIngredients(draft.ingredients),
      declaredDifferences: draft.declaredDifferences,
      storeUrl: link.url as string,
      longevityHoursMin: low as number,
      longevityHoursMax: high as number,
      sillageLabel: draft.sillageLabel,
      pairingSource: draft.pairingSource || null,
      pairingQuote: draft.pairingQuote || null,
      pairingUrl: draft.pairingUrl || null,
    },
  };
}

/** Commas or line breaks, whichever the producer used. EMPTY IS MEANINGFUL AND
 *  SAFE: the catalogue's formula falls back to its pre-ingredient weighting
 *  rather than scoring a missing list as zero overlap, so leaving this blank
 *  costs nothing and inventing entries to fill it would cost a lot. */
export function parseIngredients(raw: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of raw.split(/[\n,;]+/)) {
    const value = part.trim();
    if (!value) continue;
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(value);
  }
  return out;
}

/* ---------------------------------------------------------------------- *
 * Suggestions the form renders
 * ---------------------------------------------------------------------- */

export const CONCENTRATION_SUGGESTIONS = CONCENTRATIONS;

/* ---------------------------------------------------------------------- *
 * Writing
 * ---------------------------------------------------------------------- */

/** Who is acting, and what their plan was at the moment they acted. */
export interface ActorContext {
  userId: string;
  producerId: string;
  /** Null when no Subscription row exists, which is every producer today. */
  tier: string | null;
  status: string | null;
}

/** Stable machine codes, not sentences. The console maps them to readable
 *  labels for the "Last change" column and falls back to the raw code for
 *  anything it does not recognise, so a new verb shows up in the table
 *  rather than disappearing from it. */
export const ACTION_SUBMITTED = "submission.created";
export const ACTION_WITHDRAWN = "submission.withdrawn";

/** Which surface the actor used. One value today; it exists because "who
 *  changed this and how" is the question the audit table is for. */
const CHANNEL = "producer-console";

export type UniqueConflict = "slug" | "reference";

/**
 * Postgres 23505, unique_violation, mapped to the two constraints this insert
 * can actually collide with.
 *
 * Checked by code AND by message for the same reason src/lib/rate-limit.ts
 * checks 42P01 both ways: the HTTP driver copies the server's fields onto its
 * error object, but a thrown value that is merely Error-shaped would lose
 * `.code`, and a 500 here would be a blank page where a producer needed a
 * sentence about their own second product having the same name.
 */
export function uniqueConflict(err: unknown): UniqueConflict | null {
  const e = err as { code?: unknown; constraint?: unknown } | null | undefined;
  const message = err instanceof Error ? err.message : String(err);
  const isUnique = e?.code === "23505" || /duplicate key value/i.test(message);
  if (!isUnique) return null;
  const where = `${String(e?.constraint ?? "")} ${message}`;
  if (/producerId_slug/i.test(where)) return "slug";
  if (/producerId_referenceSlug/i.test(where)) return "reference";
  return null;
}

/**
 * Insert the row, PENDING, and write the AuditEvent that says how it got here.
 *
 * STATE IS SET EXPLICITLY. `publishState` defaults to DRAFT in the schema and a
 * submitted listing is not a draft: there is no "save as draft" in this phase,
 * so one POST is one submitted listing and the row has to say so. `approvalStatus`
 * is set to PENDING for the same reason - it happens to be the default, and
 * relying on a default for a value this load-bearing is how a later schema edit
 * silently changes what a submission means.
 *
 * `pyramidSource` KEEPS ITS `DECLARED` DEFAULT and is deliberately not set here.
 * Filling in three separate tier fields IS declaring your own split, which is
 * what that value records. It is also not a field a producer may choose, for
 * the same reason the facets are not: the catalogue penalises an imputed
 * pyramid, and letting the submitter pick would let them waive their own
 * penalty.
 *
 * `updatedAt` IS COMPUTED BY THE DATABASE. It is `TIMESTAMP(3)` with no time
 * zone and no default, and Prisma's `@updatedAt` is applied by Prisma Client,
 * which this Worker does not use. Writing a JavaScript Date into a zoneless
 * column is the bug that once expired every magic link on this origin; see the
 * long explanation in src/lib/auth.ts. `now()` in SQL, on both sides, always.
 */
export async function insertSubmission(
  sql: Sql,
  actor: ActorContext,
  value: ValidSubmission,
): Promise<{ id: string; slug: string }> {
  const id = generateId();

  await sql`
    INSERT INTO "Submission" (
      id, "producerId", "referenceSlug", slug, name, brand, concentration,
      "priceUsd", "bottleMl", family,
      "notesTop", "notesHeart", "notesBase", ingredients,
      "facetFreshness", "facetSweetness", "facetWarmth",
      "facetWoodyDepth", "facetLongevity", "facetSillage",
      "longevityHoursMin", "longevityHoursMax", "sillageLabel",
      "declaredDifferences", "storeUrl",
      "pairingSource", "pairingQuote", "pairingUrl",
      "approvalStatus", "publishState", "updatedAt"
    ) VALUES (
      ${id}, ${actor.producerId}, ${value.referenceSlug}, ${value.slug},
      ${value.name}, ${value.brand}, ${value.concentration},
      ${value.priceUsd}, ${value.bottleMl},
      -- PLACEHOLDER. Not a fragrance family: an editor sets this at review.
      -- See FAMILY_SENTINEL at the top of this file.
      ${FAMILY_SENTINEL},
      ${value.notesTop}::text[], ${value.notesHeart}::text[], ${value.notesBase}::text[],
      ${value.ingredients}::text[],
      -- PLACEHOLDER, SIX TIMES. -1 is outside the catalogue's 0 to 10 facet
      -- scale, so it cannot be read as a weak score, and a WHERE clause on
      -- "facetFreshness" < 0 finds every submission nobody has scored yet.
      -- The producer is never asked for these and never may be: the
      -- copy-detection check works only while we author one side of it.
      ${FACET_SENTINEL}, ${FACET_SENTINEL}, ${FACET_SENTINEL},
      ${FACET_SENTINEL}, ${FACET_SENTINEL}, ${FACET_SENTINEL},
      ${value.longevityHoursMin}, ${value.longevityHoursMax}, ${value.sillageLabel},
      ${value.declaredDifferences}, ${value.storeUrl},
      ${value.pairingSource}, ${value.pairingQuote}, ${value.pairingUrl},
      'PENDING', 'PENDING', now()
    )
  `;

  const notes = [...value.notesTop, ...value.notesHeart, ...value.notesBase];
  const audit = auditNotes(notes);

  await writeAuditEvent(sql, {
    submissionId: id,
    actor,
    action: ACTION_SUBMITTED,
    before: null,
    after: {
      approvalStatus: "PENDING",
      publishState: "PENDING",
      referenceSlug: value.referenceSlug,
      slug: value.slug,
      name: value.name,
      brand: value.brand,
      concentration: value.concentration,
      priceUsd: value.priceUsd,
      bottleMl: value.bottleMl,
      notesTop: value.notesTop,
      notesHeart: value.notesHeart,
      notesBase: value.notesBase,
      ingredientCount: value.ingredients.length,
      storeUrl: value.storeUrl,
      // THE POINT OF RECORDING THIS: months from now, the six facet columns on
      // this row will hold -1 or they will hold real numbers, and this line is
      // what says the producer never supplied either.
      facetsSuppliedByProducer: false,
      facetsWrittenAsSentinel: FACET_SENTINEL,
      familyWrittenAsSentinel: true,
      // Neither rejects anything. Recorded so a reviewer can see them without
      // re-deriving them, and so "we flagged this" is a fact with a timestamp.
      notesOffVocabulary: audit.offVocabulary,
      notesSpelledDifferently: audit.spelledDifferently,
      // PRODUCER-TERMS section 6 requires a photograph and there is no upload.
      // Recorded rather than left implicit, so a row that reached publication
      // without one is visible as such.
      photographSupplied: false,
    },
    reason: null,
  });

  return { id, slug: value.slug };
}

/**
 * Withdraw: a CHANGE OF STATE, never a row delete.
 *
 * Deleting the row would destroy ClickEvent history that may still pay out
 * inside a network's cookie window, destroy the record of a listing pulled
 * after a complaint, and hide the one pattern most worth being able to see -
 * withdrawal after a bad score. PRODUCER-TERMS section 10 states all of that to
 * the producer as a term, so a delete here would break a term they agreed to.
 *
 * The UPDATE is guarded on the current state as well as on ownership, so two
 * concurrent confirmations cannot both write, and a listing an editor removed a
 * second earlier cannot be overwritten as producer-withdrawn. Returns false
 * when nothing moved, which the route turns into an honest page rather than a
 * success.
 *
 * NO `removedAt` IS SET. That column and `removedReason` belong to an editor's
 * removal, which is a different act with a different actor. When this happened
 * lives in the AuditEvent and in `updatedAt`.
 */
export async function withdrawListing(
  sql: Sql,
  actor: ActorContext,
  listing: { id: string; publishState: string },
): Promise<boolean> {
  const rows = (await sql`
    UPDATE "Submission"
    SET "publishState" = 'WITHDRAWN_BY_PRODUCER', "updatedAt" = now()
    WHERE id = ${listing.id}
      AND "producerId" = ${actor.producerId}
      AND "publishState" NOT IN ('WITHDRAWN_BY_PRODUCER', 'REMOVED_BY_EDITOR')
    RETURNING id
  `) as { id: string }[];

  if (rows.length === 0) return false;

  await writeAuditEvent(sql, {
    submissionId: listing.id,
    actor,
    action: ACTION_WITHDRAWN,
    before: { publishState: listing.publishState },
    after: { publishState: "WITHDRAWN_BY_PRODUCER", recordRetained: true, clickHistoryRetained: true },
    // NULL, on purpose. The console does not ask a producer why they are
    // withdrawing and must not invent an answer into an append-only table.
    reason: null,
  });

  return true;
}

/**
 * One AuditEvent. APPEND ONLY: nothing in this project updates or deletes a
 * row in this table, and nothing should.
 *
 * `tierAtEvent` AND `statusAtEvent` ARE THE COLUMNS THAT MATTER MOST. They are
 * the only thing that will ever let anyone answer "do we approve payers
 * differently", which is the whole of the conflict this programme creates. A
 * tier read at reporting time instead of at event time would answer a different
 * question, because a producer's tier changes.
 *
 * WHEN THERE IS NO Subscription ROW they are written as NULL, not as "free".
 * Absence of a row is not the free tier - Subscription.tier also DEFAULTS to
 * "free", so the two are genuinely different facts and writing one as the other
 * would destroy the difference permanently in an append-only table. To keep
 * NULL from being read later as "the writer did not bother", this function
 * always writes both columns and the `after` payload carries an explicit
 * `subscriptionOnFile` flag alongside.
 *
 * NOT NULL COLUMNS WITH NO DEFAULT on this table, checked against the migration
 * SQL and against the live database's information_schema on 2026-09-16: id,
 * submissionId, producerId, action, actorType, actorId. All six are supplied
 * below. Everything else is nullable or defaulted.
 */
export async function writeAuditEvent(
  sql: Sql,
  opts: {
    submissionId: string;
    actor: ActorContext;
    action: string;
    before: Record<string, unknown> | null;
    after: Record<string, unknown> | null;
    reason: string | null;
  },
): Promise<void> {
  const after =
    opts.after === null
      ? null
      : { ...opts.after, subscriptionOnFile: opts.actor.tier !== null };

  await sql`
    INSERT INTO "AuditEvent" (
      id, "submissionId", "producerId", action, "actorType", "actorId",
      channel, before, after, reason, "tierAtEvent", "statusAtEvent"
    ) VALUES (
      ${generateId()}, ${opts.submissionId}, ${opts.actor.producerId}, ${opts.action},
      'PRODUCER', ${opts.actor.userId},
      ${CHANNEL},
      ${opts.before === null ? null : JSON.stringify(opts.before)}::jsonb,
      ${after === null ? null : JSON.stringify(after)}::jsonb,
      ${opts.reason},
      ${opts.actor.tier}, ${opts.actor.status}
    )
  `;
}

/* ---------------------------------------------------------------------- *
 * Reading one submission back
 * ---------------------------------------------------------------------- */

export interface SubmissionReceipt {
  id: string;
  name: string;
  brand: string;
  slug: string;
  referenceSlug: string;
  approvalStatus: string;
  publishState: string;
  notesTop: string[];
  notesHeart: string[];
  notesBase: string[];
}

/**
 * The row behind the success page.
 *
 * KEYED ON BOTH id AND producerId, so ownership is structural rather than
 * checked: a submission id from somebody else's account does not come back at
 * all, and there is no branch that could forget to compare them.
 */
export async function loadSubmissionReceipt(
  sql: Sql,
  producerId: string,
  id: string,
): Promise<SubmissionReceipt | null> {
  const rows = (await sql`
    SELECT id, name, brand, slug, "referenceSlug",
           "approvalStatus"::text AS "approvalStatus",
           "publishState"::text   AS "publishState",
           "notesTop", "notesHeart", "notesBase"
    FROM "Submission"
    WHERE id = ${id} AND "producerId" = ${producerId}
  `) as SubmissionReceipt[];
  return rows[0] ?? null;
}
