import { escape, html, raw, type Html } from "../lib/html";

/**
 * The small set of pieces every screen on this origin is built from.
 *
 * They are functions returning Html rather than a component framework because
 * nothing here needs client state. See src/index.ts for why this origin has no
 * framework at all.
 */

export function section(opts: { heading: string; lede?: Html; body: Html }): Html {
  return html`<section class="band">
    <h2>${opts.heading}</h2>
    ${opts.lede ? html`<p class="lede">${opts.lede}</p>` : ""}
    ${opts.body}
  </section>`;
}

export function card(body: Html, extraClass = ""): Html {
  return html`<div class="card ${extraClass}">${body}</div>`;
}

/**
 * A notice that something is not available, and why.
 *
 * `reason` is required and not optional on purpose. The house rule is that a
 * feature whose backing service does not exist must say so AT THE POINT OF
 * USE; a notice component that lets you omit the reason makes it one keystroke
 * to ship "coming soon" with no explanation.
 */
export function notShipped(opts: { what: string; reason: Html }): Html {
  return html`<div class="notice" role="note">
    <p class="notice-title">${opts.what}</p>
    <p>${opts.reason}</p>
  </div>`;
}

/* ------------------------------------------------------------------------ *
 * Listing state
 * ------------------------------------------------------------------------ */

/**
 * The states a listing can be in, named exactly as the database names them.
 *
 * Two enums, not one, and the UI must never collapse them:
 *   ApprovalStatus - what WE decided (PENDING, APPROVED, REJECTED,
 *   CHANGES_REQUESTED)
 *   PublishState   - where the listing actually IS (DRAFT, PENDING, LIVE,
 *   WITHDRAWN_BY_PRODUCER, REMOVED_BY_EDITOR)
 *
 * The pair that matters, and the reason the two enums exist, is
 * APPROVED + not-yet-LIVE. The public catalogue is a static export, so an
 * approved listing is a decision, not a page. It becomes a page at the next
 * build. PRODUCER-TERMS section 5 states this to the producer as a term; a
 * console that showed one "approved/live" state would be contradicting a term
 * we had them agree to.
 *
 * VISUAL ENCODING, and why it is this one: solid means published, outline
 * means not. That is the Counterscent mark's own geometry (a solid facet
 * beside an outlined one, the original and its counterpart held to the same
 * measure) reused as a status language rather than an arbitrary colour key.
 * Colour is never the only channel: every badge carries its own words, and
 * "approved" additionally carries a dashed edge, which reads as provisional
 * without relying on hue.
 */
export type ListingState =
  | "draft"
  | "in-review"
  | "approved"
  | "live"
  | "changes-requested"
  | "rejected"
  | "withdrawn"
  | "removed";

const STATE_LABEL: Record<ListingState, string> = {
  draft: "Draft",
  "in-review": "In review",
  approved: "Approved, not yet live",
  live: "Live",
  "changes-requested": "Changes requested",
  rejected: "Rejected",
  withdrawn: "Withdrawn by you",
  removed: "Removed by us",
};

/**
 * A listing's photograph, or an honest stand-in for the one it does not have.
 *
 * BUILT BEFORE THERE IS ANYTHING TO SHOW, deliberately. Photograph upload is
 * not written, so `imageUrl` is null on every row that exists. The founder's
 * instruction on 2026-09-18 was to wire and exercise the path now so that the
 * day a real producer supplies an image is not also the day we find out the
 * render breaks. Proven locally against a fixture asset.
 *
 * THE FALLBACK SURVIVES A BROKEN IMAGE WITH NO JAVASCRIPT. The obvious way to
 * handle a dead URL is an `onerror` attribute, and this origin's CSP forbids
 * inline handlers. So the tile is painted on the WRAPPER as a background plus a
 * letter, and the `<img>` sits on top of it: if the file 404s, is blocked, or is
 * never set, the tile underneath is what the producer sees. No script, no layout
 * shift, and the row stays readable.
 *
 * WHAT IT DOES NOT DO, stated because it was measured rather than assumed:
 * Chrome still paints its own small broken-image glyph over the tile when a URL
 * is set and fails. There is no CSS-only way to suppress that - `:broken` does
 * not exist - and the two alternatives are both worse here. A dynamic
 * `background-image` would need an inline `style` attribute, which `style-src
 * 'self'` blocks; dropping the width and height would trade the glyph for the
 * layout shift they exist to prevent. So the glyph stays, and it is arguably
 * the honest outcome: a dead imageUrl means OUR storage lost OUR file, and a
 * visible mark is better than silently showing a placeholder as though nothing
 * were wrong. A missing image, which is the common case, shows the clean tile
 * because no `<img>` is emitted at all.
 *
 * `width` and `height` are set on the element rather than only in CSS so the
 * row reserves its space before the image arrives. A table that reflows as
 * thumbnails load is the CLS problem, and it would arrive exactly when the
 * feature starts working.
 *
 * `alt=""` and `aria-hidden` are correct rather than lazy: the fragrance name
 * and brand sit immediately beside this, so announcing the picture as well
 * would read the same listing twice.
 */
export function listingThumb(l: { name: string; imageUrl: string | null }): Html {
  const initial = (l.name.trim()[0] ?? "?").toUpperCase();
  return html`<span class="thumb" data-initial="${initial}" aria-hidden="true"
    >${
      l.imageUrl
        ? html`<img src="${l.imageUrl}" alt="" width="40" height="40" loading="lazy" decoding="async" />`
        : ""
    }</span
  >`;
}

export function stateBadge(state: ListingState): Html {
  return html`<span class="pill state state-${state}">${STATE_LABEL[state]}</span>`;
}
/**
 * The two database columns, as the one label a producer reads.
 *
 * IT LIVES HERE, BESIDE ListingState AND STATE_LABEL, BECAUSE TWO ROUTES NEED
 * IT AND ONLY ONE OF THEM HAD IT. While this was private to /console, the
 * withdraw page reached for `stateBadge(publishState as never)` instead - and
 * that cast is exactly why nobody noticed: publishState is the Postgres enum
 * (PENDING, WITHDRAWN_BY_PRODUCER), STATE_LABEL is keyed by the UI union
 * ("in-review", "withdrawn"), so the lookup returned undefined and the page
 * rendered an EMPTY badge next to a dangling separator. A cast to `never`
 * silences the one check that would have caught it.
 *
 * Both columns are Postgres enums, so an unrecognised value is not reachable
 * without a migration. The order of the tests is the part that matters: where
 * the two disagree, publishState wins, because it describes where the listing
 * actually IS, and an editorial decision that has not taken effect is exactly
 * what the "approved, not yet live" badge exists to say.
 */
export function listingStateFor(l: { approvalStatus: string; publishState: string }): ListingState {
  switch (l.publishState) {
    case "LIVE":
      return "live";
    case "WITHDRAWN_BY_PRODUCER":
      return "withdrawn";
    case "REMOVED_BY_EDITOR":
      return "removed";
    case "DRAFT":
      return l.approvalStatus === "CHANGES_REQUESTED" ? "changes-requested" : "draft";
    default:
      if (l.approvalStatus === "REJECTED") return "rejected";
      if (l.approvalStatus === "CHANGES_REQUESTED") return "changes-requested";
      if (l.approvalStatus === "APPROVED") return "approved";
      return "in-review";
  }
}

/** One row of the state reference: the badge, what it means, who moved it. */
export function stateRow(opts: {
  state: ListingState;
  meaning: Html;
  movedBy: string;
}): Html {
  return html`<div class="state-row">
    <div class="state-row-badge">${stateBadge(opts.state)}</div>
    <p class="state-row-meaning">${opts.meaning}</p>
    <p class="state-row-actor">${opts.movedBy}</p>
  </div>`;
}

/**
 * THE EIGHT STATES, ONCE. Every word a producer or an editor reads about what
 * a listing state means comes from this array.
 *
 * It was eight inline stateRow() calls in src/routes/overview.ts until
 * 2026-09-16, and /console was about to grow a second copy. Two copies of a
 * reference that must agree is a failure this repository has already paid for
 * more than once, and it is worse here than usual: the copies would not
 * disagree loudly, they would disagree by one clause, on the one page a
 * producer reads to find out what we have decided about their listing.
 *
 * Order is deliberate and is roughly the path a listing takes, not the
 * database's declaration order: started, sent, the two ways it can come back,
 * the two ways it goes up, the two ways it comes down.
 */
const LISTING_STATE_REFERENCE: { state: ListingState; meaning: Html; movedBy: string }[] = [
  {
    state: "draft",
    meaning: html`Started and not sent. Never exported, never seen by us.`,
    movedBy: "The producer",
  },
  {
    state: "in-review",
    meaning: html`Sent, waiting for a person. Automated checks may already have
      flagged it, and a flag can stop it here.`,
    movedBy: "The producer",
  },
  {
    state: "changes-requested",
    meaning: html`We read it and need something fixed before it can be approved.
      This is us asking them, which is the opposite direction from a producer
      asking us for an edit.`,
    movedBy: "An editor",
  },
  {
    state: "rejected",
    meaning: html`Not publishable, with the reason given. Common reasons: the
      original is not in our catalogue, the declared data contradicts the
      producer's own public product page, or the pyramid restates the original's.`,
    movedBy: "An editor",
  },
  {
    state: "approved",
    meaning: html`Decided, and not on the site. It joins the catalogue at the
      next build.`,
    movedBy: "An editor",
  },
  {
    state: "live",
    meaning: html`In the build that is currently serving. This is the only state
      the public site knows about.`,
    movedBy: "A site build",
  },
  {
    state: "withdrawn",
    meaning: html`The producer took it down. It leaves the catalogue at the next
      build and its link stops resolving. The record stays.`,
    movedBy: "The producer",
  },
  {
    state: "removed",
    meaning: html`We took it down, and we say which reason: a breach, a rights
      complaint, a dead link, or data we cannot reconcile.`,
    movedBy: "An editor",
  },
];

/**
 * The state reference, in one of two densities.
 *
 * `full` is the eight-row explanation: the overview's version, and the one to
 * link to. `specimen` is the eight badges as badges and nothing else, for a
 * page that needs the reader to recognise the vocabulary rather than learn it.
 * Both read the same array, so a specimen row can never show a state the
 * reference does not explain.
 */
export function listingStates(opts: { detail?: "full" | "specimen" } = {}): Html {
  if (opts.detail === "specimen") {
    return html`<ul class="state-specimen">
      ${LISTING_STATE_REFERENCE.map((s) => html`<li>${stateBadge(s.state)}</li>`)}
    </ul>`;
  }
  return html`<div class="state-list">
    ${LISTING_STATE_REFERENCE.map((s) => stateRow(s))}
  </div>`;
}

/* ------------------------------------------------------------------------ *
 * Identity and allowance
 * ------------------------------------------------------------------------ */

/**
 * Several short facts on one row: who this account belongs to, which plan is
 * on file, how much of it is used.
 *
 * Nothing else in this vocabulary carries facts side by side - card() is the
 * only container and it stacks, which is right for a paragraph and wrong for
 * four values of three words each. This is the one place on the origin where
 * density rises, and it rises because it is the answer to the first question
 * an attached producer has when the page loads.
 *
 * A <dl>, not a row of <div>s: each value has a label, that is what a
 * description list is, and it is the difference between "Free" being read out
 * as a word and being read out as the plan.
 */
export function identityBar(opts: {
  facts: { label: string; value: Html }[];
  /** Trailing control, today the sign-out form. */
  action?: Html;
  /**
   * A panel on the right of the strip.
   *
   * ADDED because the strip was mostly empty. Four facts sat crammed against
   * the left edge of an 1104px card with 115px of nothing before the sign-out
   * button, which read as a rendering fault rather than as breathing room. The
   * fix is not to shrink the card: it is to put the reader's plan and their
   * remaining allowance in the space, which is the question they come to this
   * screen with. Facts that belong to the plan move OUT of `facts` and into
   * here, so the strip does not say the same thing twice.
   */
  aside?: Html;
}): Html {
  return html`<div class="identity-bar${opts.aside ? " has-aside" : ""}">
    <div class="identity-main">
      <dl class="identity-facts">
        ${opts.facts.map(
          (f) => html`<div class="identity-fact">
          <dt>${f.label}</dt>
          <dd>${f.value}</dd>
        </div>`,
        )}
      </dl>
      ${opts.action ? html`<div class="identity-action">${opts.action}</div>` : ""}
    </div>
    ${opts.aside ? html`<div class="identity-aside">${opts.aside}</div>` : ""}
  </div>`;
}

/**
 * "0 of 1 listing used", and the three other things that sentence has to be
 * able to say instead.
 *
 * WHY THIS IS A FUNCTION AND NOT AN INLINE TERNARY. There are four honest
 * cases and each of them is a different claim:
 *
 *   `allowance: null`      No Subscription row exists. This is EVERY producer
 *                          at launch. It must not render "Free plan": absence
 *                          of a row is not a free plan, and printing one
 *                          asserts a record that is not there. Subscription
 *                          .tier also defaults to "free", so a free producer
 *                          is representable two ways and only one of them is
 *                          a fact.
 *   `allowance: "unknown"` There is a row and its tier is a string this
 *                          console does not recognise. `Subscription.tier` is
 *                          deliberately a free string in the schema, so this
 *                          is reachable by a business decision rather than a
 *                          bug, and guessing an allowance for it would be
 *                          inventing a limit.
 *   `allowance: "uncapped"` A tier with no cap. There is no figure to be "of".
 *   `allowance: <number>`  The ordinary case, and the one place a producer is
 *                          told they are full.
 *
 * Branching this inline in a route is how /console and the future submit page
 * end up phrasing the same fact two ways.
 *
 * Phrasing content only (spans, no <p>), because its first caller renders it
 * inside a <dd> in the identity bar.
 */
export function quotaLine(opts: {
  used: number;
  allowance: number | "uncapped" | "unknown" | null;
  /** The tier string as stored, for the case where we do not recognise it. */
  tier?: string;
}): Html {
  const listings = opts.used === 1 ? "1 listing" : `${opts.used} listings`;

  if (opts.allowance === null) {
    return html`<span class="quota">
      <span class="quota-figure">No plan on file</span>
      <span class="quota-note">
        No subscription record exists for this producer. Until one does, the free
        allowance of one active listing is what we enforce. ${listings} on file.
      </span>
    </span>`;
  }

  if (opts.allowance === "unknown") {
    return html`<span class="quota">
      <span class="quota-figure">Allowance not known here</span>
      <span class="quota-note">
        The plan on file is recorded as "${opts.tier ?? ""}", which this console has no
        allowance for. We will not guess one. ${listings} on file.
      </span>
    </span>`;
  }

  if (opts.allowance === "uncapped") {
    return html`<span class="quota">
      <span class="quota-figure">${listings}</span>
      <span class="quota-note">This plan sets no cap on how many.</span>
    </span>`;
  }

  const full = opts.used >= opts.allowance;
  return html`<span class="quota">
    <span class="quota-figure">${String(opts.used)} of ${String(opts.allowance)} used</span>
    <span class="quota-note">
      ${
        full
          ? html`The allowance on this plan is full. A withdrawn listing frees its slot.`
          : html`Withdrawn and removed listings do not count against it.`
      }
    </span>
  </span>`;
}

/* ------------------------------------------------------------------------ *
 * Form fields that cannot accept input
 * ------------------------------------------------------------------------ */

/**
 * A field rendered in its real shape and structurally incapable of taking a
 * value.
 *
 * THE RULE THIS IMPLEMENTS: a form that discards what someone typed is worse
 * than no form. So these are not styled to look disabled, they ARE disabled,
 * and the callers wrap them in a <fieldset disabled> as well. Three layers,
 * because each covers a different failure:
 *
 *   1. `disabled` on the control - the browser will not focus it, will not
 *      let it take a value, and will not submit it.
 *   2. `<fieldset disabled>` around the group - one attribute disables every
 *      descendant control, so adding a field later cannot accidentally add a
 *      live one.
 *   3. No <form> element anywhere on this origin, plus
 *      `form-action 'none'` in the CSP - there is no target to post to and the
 *      browser would refuse even if there were.
 *
 * `hint` is required. A disabled field with no stated reason is a dead end.
 */
export function deadField(opts: {
  label: string;
  hint: Html;
  placeholder?: string;
  kind?: "text" | "email" | "textarea";
}): Html {
  const id = "f-" + opts.label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const kind = opts.kind ?? "text";
  const control =
    kind === "textarea"
      ? html`<textarea id="${id}" rows="3" disabled placeholder="${opts.placeholder ?? ""}"></textarea>`
      : html`<input id="${id}" type="${kind}" disabled placeholder="${opts.placeholder ?? ""}">`;

  return html`<div class="field">
    <span class="field-label-row">
      <label for="${id}">${opts.label}</label>
      <span class="tag-off">Disabled</span>
    </span>
    ${control}
    <p class="field-hint">${opts.hint}</p>
  </div>`;
}

/**
 * A button that is present so the screen reads correctly, and does nothing.
 *
 * `reason` IS REQUIRED, and that is the point of this signature rather than a
 * detail of it. notShipped() requires `reason`, deadField() requires `hint`,
 * emptyState() requires `because` - and this function used to require nothing,
 * which left the most clickable-looking dead object on the page as the only
 * one exempt from the house rule. A disabled button with no stated reason is a
 * dead end, and the reader's guess ("I must not be allowed") is usually the
 * wrong one: on this origin the usual answer is that the form behind it has
 * not been built yet, which is about us and not about them.
 *
 * ONE REASON PER BUTTON, NOT ONE PER ROW. The three verbs on /console are
 * disabled for two different reasons - the submit form does not exist, and the
 * other two have nothing to act on - and a single note under a row of buttons
 * cannot carry two. The reason renders under its own button and is wired to it
 * with `aria-describedby`, so the association survives for a reader who is not
 * looking at the layout.
 */
export function deadButton(
  label: string,
  opts: { variant?: "primary" | "ghost"; reason: Html },
): Html {
  const variant = opts.variant ?? "primary";
  const id = "why-" + label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return html`<span class="dead-action">
    <button type="button" class="btn btn-${variant}" disabled aria-describedby="${id}">${label}</button>
    <span class="dead-action-why" id="${id}">${opts.reason}</span>
  </span>`;
}

/* ------------------------------------------------------------------------ *
 * Live form fields
 * ------------------------------------------------------------------------ *
 * The counterpart to deadField()/deadButton() above, for the one form on
 * this origin that is real: /sign-in (src/routes/sign-in.ts). Kept in this
 * file rather than a separate one because a page should never be able to
 * reach for "a field" without also seeing the disabled version sitting right
 * next to it - the choice between them is meant to be visible at the call
 * site, not buried in an import path.
 */

/**
 * A field that can actually take a value. `hint` stays required, same as
 * deadField() - a form asking for something has to say why.
 *
 * THE ORDER IS LABEL, CONTROL, ERROR, HINT, and it is the same in every field
 * function below. A label under its input is read after the thing it names; an
 * error under the hint is read after the reader has already moved on. Both are
 * wired to the control with `aria-describedby`, so the association survives for
 * somebody who is not looking at the layout.
 *
 * REQUIRED IS UNMARKED AND OPTIONAL IS MARKED, which is the opposite of the
 * usual asterisk. On the submit form all but four fields are required, so
 * marking the required ones would put a badge on almost every row and mark
 * nothing out at all. The form says once, above the first group, that
 * everything is required unless it says otherwise.
 */
export function field(opts: {
  name: string;
  label: string;
  hint: Html;
  type?: "text" | "email" | "url" | "number";
  placeholder?: string;
  required?: boolean;
  autoFocus?: boolean;
  autoComplete?: string;
  /** What the producer already typed, put back after a failed POST. */
  value?: string;
  error?: string;
  /** The id of a <datalist> to back this input with native typeahead. */
  list?: string;
  min?: string;
  max?: string;
  step?: string;
  inputMode?: string;
}): Html {
  const id = "f-" + opts.name;
  return html`<div class="field">
    ${fieldLabel(id, opts.label, opts.required)}
    <input
      id="${id}"
      name="${opts.name}"
      type="${opts.type ?? "text"}"
      value="${opts.value ?? ""}"
      placeholder="${opts.placeholder ?? ""}"
      autocomplete="${opts.autoComplete ?? "off"}"
      ${opts.list ? raw(`list="${escape(opts.list)}"`) : ""}
      ${opts.min !== undefined ? raw(`min="${escape(opts.min)}"`) : ""}
      ${opts.max !== undefined ? raw(`max="${escape(opts.max)}"`) : ""}
      ${opts.step ? raw(`step="${escape(opts.step)}"`) : ""}
      ${opts.inputMode ? raw(`inputmode="${escape(opts.inputMode)}"`) : ""}
      ${opts.error ? raw(`aria-invalid="true"`) : ""}
      aria-describedby="${describedBy(id, opts.error)}"
      ${opts.required ? "required" : ""}
      ${opts.autoFocus ? "autofocus" : ""}
    >
    ${fieldError(id, opts.error)}
    <p class="field-hint" id="${id}-hint">${opts.hint}</p>
  </div>`;
}

/** Several sentences of prose, which is what "what is genuinely different"
 *  and an ingredient list both are. */
export function textareaField(opts: {
  name: string;
  label: string;
  hint: Html;
  rows?: number;
  placeholder?: string;
  required?: boolean;
  value?: string;
  error?: string;
}): Html {
  const id = "f-" + opts.name;
  return html`<div class="field">
    ${fieldLabel(id, opts.label, opts.required)}
    <textarea
      id="${id}"
      name="${opts.name}"
      rows="${String(opts.rows ?? 4)}"
      placeholder="${opts.placeholder ?? ""}"
      ${opts.error ? raw(`aria-invalid="true"`) : ""}
      aria-describedby="${describedBy(id, opts.error)}"
      ${opts.required ? "required" : ""}
    >${opts.value ?? ""}</textarea>
    ${fieldError(id, opts.error)}
    <p class="field-hint" id="${id}-hint">${opts.hint}</p>
  </div>`;
}

/**
 * A closed set of choices.
 *
 * USED WHERE THE VALUE MUST COME FROM OUR VOCABULARY AND NOWHERE ELSE: the
 * original a listing is compared against, and the sillage label. A <select>
 * cannot express a value that is not in it, so "you cannot invent an original"
 * stops being a rule the server has to enforce against a text box and becomes a
 * property of the control. The server still checks, because a POST does not
 * have to come from our form.
 *
 * Optional groups, because 216 originals in one flat list is a wall. Grouping
 * by house matches how a producer already thinks about them.
 */
export function selectField(opts: {
  name: string;
  label: string;
  hint: Html;
  required?: boolean;
  value?: string;
  error?: string;
  /** The first, empty option. Not a placeholder standing in for a label. */
  emptyLabel: string;
  options?: { value: string; label: string }[];
  groups?: { label: string; options: { value: string; label: string }[] }[];
}): Html {
  const id = "f-" + opts.name;
  const option = (o: { value: string; label: string }) =>
    html`<option value="${o.value}"${opts.value === o.value ? raw(" selected") : ""}>${o.label}</option>`;

  return html`<div class="field">
    ${fieldLabel(id, opts.label, opts.required)}
    <select
      id="${id}"
      name="${opts.name}"
      ${opts.error ? raw(`aria-invalid="true"`) : ""}
      aria-describedby="${describedBy(id, opts.error)}"
      ${opts.required ? "required" : ""}
    >
      <option value="">${opts.emptyLabel}</option>
      ${(opts.options ?? []).map(option)}
      ${(opts.groups ?? []).map(
        (g) => html`<optgroup label="${g.label}">${g.options.map(option)}</optgroup>`,
      )}
    </select>
    ${fieldError(id, opts.error)}
    <p class="field-hint" id="${id}-hint">${opts.hint}</p>
  </div>`;
}

/**
 * One tier of a note pyramid: several inputs sharing one vocabulary.
 *
 * THE SELECTOR IS A <datalist>, WHICH IS NATIVE TYPEAHEAD AT ZERO JAVASCRIPT.
 * CONSOLE-PLAN 4.4 ranked the options by cost and this is the cheapest that
 * works: the browser filters as you type, and where it is not supported the
 * control degrades to a plain text box rather than to nothing. A <select
 * multiple> over 286 notes is unusable, and a progressive-enhancement script
 * is more machinery than this has earned.
 *
 * FREE TEXT REMAINS POSSIBLE, ON PURPOSE. A producer may legitimately declare a
 * material our catalogue has never recorded, and a control that refused one
 * would be constraining what they are allowed to honestly say about their own
 * product. An off-vocabulary note is accepted and flagged for a person.
 *
 * ONE VISIBLE LABEL PER TIER, NOT SIX. The legend names the tier and the first
 * box carries a visible label; boxes two onward carry visually-hidden ones
 * ("Top note 2"), so every control has an accessible name without printing
 * eighteen labels on the densest screen on this origin. That is a deliberate
 * departure from label-above-every-input, and it is the standard treatment for
 * a repeated homogeneous list.
 */
export function noteTier(opts: {
  name: string;
  legend: string;
  /** Singular, lowercase, for the hidden labels: "top note". */
  singular: string;
  hint: Html;
  values: string[];
  listId: string;
  /** Attached to the first input, which is the required one. */
  error?: string;
}): Html {
  return html`<fieldset class="note-tier">
    <legend>${opts.legend}</legend>
    <p class="field-hint">${opts.hint}</p>
    <div class="note-inputs">
      ${opts.values.map((value, i) => {
        const id = `f-${opts.name}-${i}`;
        const first = i === 0;
        return html`<div class="note-input">
          ${
            first
              ? html`<label for="${id}">First ${opts.singular}</label>`
              : html`<label for="${id}" class="visually-hidden"
                  >${opts.legend} ${String(i + 1)}</label
                >`
          }
          <input
            id="${id}"
            name="${opts.name}-${String(i)}"
            type="text"
            list="${opts.listId}"
            value="${value}"
            autocomplete="off"
            ${first && opts.error ? raw(`aria-invalid="true"`) : ""}
            ${first && opts.error ? raw(`aria-describedby="${escape(id)}-error"`) : ""}
            ${first ? "required" : ""}
          >
          ${first ? fieldError(id, opts.error) : ""}
        </div>`;
      })}
    </div>
  </fieldset>`;
}

/** The shared vocabulary, rendered once per page rather than once per input.
 *  Three tiers times six boxes would otherwise be eighteen copies of 286
 *  options in one document. */
export function datalist(id: string, values: readonly string[]): Html {
  return html`<datalist id="${id}">
    ${values.map((v) => html`<option value="${v}"></option>`)}
  </datalist>`;
}

/**
 * The errors, once, at the top, each linking to the control it belongs to.
 *
 * A dense form scrolls, so an error two groups down is an error nobody finds.
 * `role="alert"` and `tabindex="-1"` are what let the page move focus here on
 * a failed submit without JavaScript: the browser focuses the fragment, and a
 * screen reader announces the whole list.
 */
export function errorSummary(items: { field: string; label: string; message: string }[]): Html {
  if (items.length === 0) return html``;
  return html`<div class="error-summary" role="alert" tabindex="-1" autofocus id="errors">
    <p class="error-summary-title">
      ${items.length === 1
        ? "One thing needs fixing before this can be submitted"
        : `${String(items.length)} things need fixing before this can be submitted`}
    </p>
    <p class="field-hint">
      Nothing was saved and nothing was sent. Everything you typed is still below.
    </p>
    <ul class="error-summary-list">
      ${items.map(
        (e) => html`<li><a href="#f-${e.field}">${e.label}: ${e.message}</a></li>`,
      )}
    </ul>
  </div>`;
}

/** A named part of a long form. A submit form is the densest screen on this
 *  origin and eighteen controls in one run is a wall; these are the seams. */
export function formGroup(opts: { legend: string; note?: Html; body: Html }): Html {
  return html`<fieldset class="form-group">
    <legend>${opts.legend}</legend>
    ${opts.note ? html`<p class="form-group-note">${opts.note}</p>` : ""}
    ${opts.body}
  </fieldset>`;
}

/** The CSRF token, in the one field name every handler reads. See
 *  src/lib/csrf.ts for why this is derived rather than stored. */
export function csrfInput(name: string, token: string): Html {
  return html`<input type="hidden" name="${name}" value="${token}">`;
}

function fieldLabel(id: string, label: string, required?: boolean): Html {
  return html`<span class="field-label-row">
    <label for="${id}">${label}</label>
    ${required ? "" : html`<span class="field-optional">Optional</span>`}
  </span>`;
}

function fieldError(id: string, error?: string): Html {
  if (!error) return html``;
  return html`<p class="field-error" id="${id}-error">${error}</p>`;
}

function describedBy(id: string, error?: string): string {
  return error ? `${id}-error ${id}-hint` : `${id}-hint`;
}

/** A button that actually submits or actually does something - the live
 *  counterpart to deadButton(). Defaults to `type="submit"` because every
 *  live button on this origin so far is inside exactly one <form>. */
export function button(
  label: string,
  opts: { variant?: "primary" | "ghost"; type?: "submit" | "button" } = {},
): Html {
  const variant = opts.variant ?? "primary";
  const type = opts.type ?? "submit";
  return html`<button type="${type}" class="btn btn-${variant}">${label}</button>`;
}

/* ------------------------------------------------------------------------ *
 * Empty states
 * ------------------------------------------------------------------------ */

/** One cell. `rowHeader` renders `<th scope="row">`, which is what makes a
 *  table whose first column labels the row readable out loud rather than a
 *  grid of unlabelled values. */
export interface TableCell {
  content: Html;
  rowHeader?: boolean;
  colSpan?: number;
}

export interface TableRow {
  cells: TableCell[];
  /** A heavier top border. For the row that starts a new part of a table -
   *  the "no tier buys" block under the plan comparison, today's only one. */
  rule?: boolean;
}

/**
 * A table plus its empty state, in a region that scrolls sideways on a narrow
 * viewport instead of widening the document.
 *
 * `tabindex="0"` is not decoration. An overflow container that can only be
 * scrolled by dragging is unreachable from a keyboard, which is the usual
 * cost of "just make the table scroll".
 *
 * THIS RENDERS BODY ROWS, AND THAT IS WHY THERE IS NO SECOND TABLE FUNCTION.
 * It could not render one until 2026-09-16, which made a `planTable()` beside
 * it look like the cheap option. Two table functions drift: the second one
 * gets the scroll region and the first one keeps the keyboard fix, or the
 * other way round, and nobody notices because each is only ever read next to
 * its own caller. One function, two callers.
 *
 * The options type is a union so the empty state cannot be forgotten. A table
 * built from a literal list of rows (the plan comparison) is never empty and
 * does not need one; a table built from a query (the listing table) is empty
 * on the day it ships and must say why.
 */
export type TableBlockOptions = { label: string; columns: string[] } & (
  | { rows: [TableRow, ...TableRow[]]; empty?: Html }
  | { rows?: TableRow[]; empty: Html }
);

export function tableBlock(opts: TableBlockOptions): Html {
  const rows = opts.rows ?? [];

  const cell = (c: TableCell): Html => {
    const span = c.colSpan && c.colSpan > 1 ? html` colspan="${String(c.colSpan)}"` : "";
    return c.rowHeader
      ? html`<th scope="row"${span}>${c.content}</th>`
      : html`<td${span}>${c.content}</td>`;
  };

  return html`<div class="table-scroll" tabindex="0" role="region" aria-label="${opts.label}">
    <table class="data-table">
      <thead>
        <tr>
          ${opts.columns.map((c) => html`<th scope="col">${c}</th>`)}
        </tr>
      </thead>
      ${
        rows.length
          ? html`<tbody>
        ${rows.map((r) => html`<tr class="${r.rule ? "row-rule" : ""}">${r.cells.map(cell)}</tr>`)}
      </tbody>`
          : ""
      }
    </table>
  </div>
  ${rows.length ? "" : (opts.empty ?? "")}`;
}

/**
 * What a table shows when it has nothing in it.
 *
 * Every list on this origin is empty and will be until step 6 of the build
 * order. `because` is required for the same reason `hint` is: "No listings
 * yet" invites a producer to wonder what they did wrong.
 */
export function emptyState(opts: { headline: string; because: Html }): Html {
  return html`<div class="empty">
    <p class="empty-head">${opts.headline}</p>
    <p>${opts.because}</p>
  </div>`;
}
