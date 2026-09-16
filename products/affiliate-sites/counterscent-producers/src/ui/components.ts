import { html, type Html } from "../lib/html";

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

export function stateBadge(state: ListingState): Html {
  return html`<span class="pill state state-${state}">${STATE_LABEL[state]}</span>`;
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

/** A button that is present so the screen reads correctly, and does nothing. */
export function deadButton(label: string, variant: "primary" | "ghost" = "primary"): Html {
  return html`<button type="button" class="btn btn-${variant}" disabled>${label}</button>`;
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

/** A field that can actually take a value. `hint` stays required, same as
 *  deadField() - a form asking for something has to say why. */
export function field(opts: {
  name: string;
  label: string;
  hint: Html;
  type?: "text" | "email";
  placeholder?: string;
  required?: boolean;
  autoFocus?: boolean;
  autoComplete?: string;
}): Html {
  const id = "f-" + opts.name;
  return html`<div class="field">
    <label for="${id}">${opts.label}</label>
    <input
      id="${id}"
      name="${opts.name}"
      type="${opts.type ?? "text"}"
      placeholder="${opts.placeholder ?? ""}"
      autocomplete="${opts.autoComplete ?? "off"}"
      ${opts.required ? "required" : ""}
      ${opts.autoFocus ? "autofocus" : ""}
    >
    <p class="field-hint">${opts.hint}</p>
  </div>`;
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

/**
 * A table plus its empty state, in a region that scrolls sideways on a narrow
 * viewport instead of widening the document.
 *
 * `tabindex="0"` is not decoration. An overflow container that can only be
 * scrolled by dragging is unreachable from a keyboard, which is the usual
 * cost of "just make the table scroll".
 */
export function tableBlock(opts: { label: string; columns: string[]; empty: Html }): Html {
  return html`<div class="table-scroll" tabindex="0" role="region" aria-label="${opts.label}">
    <table class="data-table">
      <thead>
        <tr>
          ${opts.columns.map((c) => html`<th scope="col">${c}</th>`)}
        </tr>
      </thead>
    </table>
  </div>
  ${opts.empty}`;
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
