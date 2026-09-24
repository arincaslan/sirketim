import { html, type Html } from "../lib/html";

/**
 * The page shell: head, header, footer.
 *
 * WHY THE CATALOGUE'S IDENTITY IS REPRODUCED HERE BY HAND. This origin is a
 * separate Cloudflare Worker with a separate deploy and no build step, so it
 * cannot import anything from the Next project next door. The mark below and
 * the tokens in public/assets/console.css are copies, and the copy is the
 * point of failure to watch:
 *
 *   Source of truth for the mark:   fragrance-dupes/components/site/logo.tsx
 *   Source of truth for the tokens: fragrance-dupes/app/globals.css
 *
 * The alternative - a shared package, or a build step that reads the other
 * project - would couple two deploys that are deliberately independent, and
 * would reintroduce exactly the hermetic-build property the second origin
 * exists to protect. Explicit duplication with a named source beats implicit
 * coupling at this size.
 */

export const CATALOGUE = "https://counterscent.com";

/**
 * The Counterscent mark: one facet split down the middle, left half solid,
 * right half outline. Copied from the catalogue's logo.tsx, in `currentColor`
 * so it works in both themes without a second asset.
 */
const MARK = html`<svg viewBox="0 0 32 32" class="mark" fill="none" aria-hidden="true" focusable="false">
        <path d="M15 6.5 L5.5 16 L15 25.5 Z" fill="currentColor" />
        <path d="M17 6.5 L26.5 16 L17 25.5 Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
      </svg>`;

export interface PageOptions {
  /** The <title>. */
  title: string;
  /** The <h1>. Kept separate from `title` so the tab and the page can differ. */
  heading: string;
  /**
   * A status pill plus one sentence, above the heading.
   *
   * `tone` is the pill's fill, and it carries meaning rather than emphasis.
   * Outline is the default and means "not yet, or not you"; solid means the
   * surface in front of you is real and working. That is the same
   * solid-means-published geometry the listing badges use and the mark itself
   * is drawn from, so the console's status language and the listings' status
   * language are one language instead of two.
   *
   * It exists because every status strip on this origin rendered the same
   * outline pill, which made /console signed out and /console with a live
   * producer record look identical above the fold. Colour is never the only
   * channel - the label, the heading, the first block's shape and the presence
   * of a table all move as well - but this is the first of the four a reader
   * meets.
   */
  status?: { label: string; note: Html; tone?: "outline" | "solid" };
  /** One paragraph under the heading. */
  standfirst?: Html;
  body: Html;
  /** Off on the overview itself. */
  showBackLink?: boolean;
  /**
   * The signed-in navigation, or nothing.
   *
   * THE ORIGINAL OBJECTION IS HONOURED, NOT OVERRULED. The header carried a
   * comment saying a persistent nav was left out on purpose, because "Console"
   * and "Review" in a nav bar "would present two areas as places you can go and
   * work, which is the exact claim this origin must not make yet" - and it
   * ended "this is where real navigation goes ONCE THERE IS A SESSION TO RENDER
   * IT FOR". Sign-in, the console, submit and withdraw all shipped on
   * 2026-09-16, so that precondition is met. Passing no `nav` still renders no
   * nav, which is what every signed-out page does, so the claim is still not
   * made to a stranger.
   *
   * The founder's complaint on 2026-09-18 was the predicted consequence of
   * leaving it unrevisited: the only way between screens was a link in the
   * footer.
   */
  nav?: NavContext;
  /**
   * Whether there is a session behind this page. It decides where HOME is:
   * the lockup and the back-link point at /console for a signed-in reader
   * and at / for everybody else.
   *
   * IT IS SEPARATE FROM `nav` BECAUSE THE TWO QUESTIONS ARE GENUINELY
   * DIFFERENT, and console.ts proves it: noProducerAttached() deliberately
   * renders NO nav for a producer with no company, because both producer
   * items would bounce them back to the screen they are on - and that
   * reader is very much signed in. Deriving one from the other would send
   * exactly that person out to the signed-out explainer.
   *
   * Defaults to whether a nav was passed, so every page that already
   * renders one is correct without being touched.
   */
  signedIn?: boolean;
}

export interface NavContext {
  /** Which item is the current page. Drives `aria-current`. */
  current?: NavKey;
  /**
   * Whether to show the admin group.
   *
   * Set from `requireAdmin` having already succeeded, never from a guess. See
   * the comment on NAV_ITEMS: this hides links, it does not protect routes.
   */
  showAdmin?: boolean;
}

type NavKey = "listings" | "submit" | "plan" | "review" | "admin" | "queue" | "people";

// ORDER IS THE PRODUCER'S SEQUENCE FIRST, then ours: look at what you have,
// add to it, then deal with what it costs - and only after all three, the
// administrative group. The two groups never interleave, so an admin reading
// this bar sees their producer tools and their house tools as two things
// rather than one mixed list.
const NAV_ITEMS: { key: NavKey; href: string; label: string; admin?: true; producerOnly?: true }[] = [
  { key: "listings", href: "/console", label: "Your listings" },
  { key: "submit", href: "/console/submit", label: "Submit a fragrance" },
  // PRODUCER-ONLY, AND ONLY THIS ONE. Founder instruction 2026-09-18: an
  // administrator should not be offered "Your plan", but should keep every
  // producer ability including submitting a fragrance of their own. Those two
  // sentences are the whole rule, and the distinction they draw is real - the
  // other producer items act on listings, which an admin genuinely has; this
  // one acts on a subscription tier, which an admin is not billed under and is
  // not capped by (see the `uncapped` argument to quotaGate). Offering it would
  // invite them to "move up a tier" from an allowance that is not being applied
  // to them in the first place.
  { key: "plan", href: "/console/plan", label: "Your plan", producerOnly: true },
  // THE ADMIN GROUP IS A NAVIGATION AFFORDANCE, NOT A GUARD. Hiding these
  // links protects nothing; what protects them is requireAdmin() inside each
  // route, which every one of them calls before reading anything. They are
  // hidden from non-admins only so the producer console does not advertise a
  // surface its reader cannot use. If this flag were ever the only thing
  // standing between a producer and the approve button, the bug would be in
  // the route, not here.
  { key: "admin", href: "/admin", label: "Admin", admin: true },
  { key: "queue", href: "/admin/queue", label: "Listing queue", admin: true },
  // "People" rather than "Producers and accounts": with the admin group shown
  // the bar carries six items, and the long label left 16px between the nav
  // and the header's own links at 1440px - clearance that disappears on any
  // narrower desktop. The page's own <h1> still says "Producers and accounts",
  // which is where the reader needs the full phrase.
  { key: "people", href: "/admin/people", label: "People", admin: true },
];

/**
 * LINKS ONLY, NO FORMS, and that is a CSP decision rather than a style one.
 * Sign-out is a POST, so putting it here would force a `form-action 'self'`
 * grant onto every page that renders a nav, including pages that have no
 * business accepting a form post. It stays on the console's account strip,
 * where the grant already exists and is already reasoned about.
 */
function navBar(ctx: NavContext): Html {
  const items = NAV_ITEMS.filter((i) => {
    if (i.admin) return ctx.showAdmin === true;
    if (i.producerOnly) return ctx.showAdmin !== true;
    return true;
  });
  // THE SEPARATOR IS THE COMMENT ON NAV_ITEMS, DRAWN. That comment claims the
  // producer group and the administrative group "never interleave, so an admin
  // reading this bar sees their producer tools and their house tools as two
  // things rather than one mixed list" - which was true of the ORDER and
  // invisible on the screen, because five evenly-spaced links read as one list
  // of five whatever order they are in. The rule for it had already been
  // written into console.css and never given any markup to style, so the
  // stylesheet carried a comment describing something that did not exist.
  //
  // aria-hidden: it is a visual grouping, and the nav is already one labelled
  // landmark. A screen reader gains nothing from a decorative rule.
  const firstAdmin = items.findIndex((i) => i.admin);
  return html`<nav class="site-nav" aria-label="Producer console">
      ${items.map(
        (i, n) => html`${n === firstAdmin && n > 0
          ? html`<span class="site-nav-sep" aria-hidden="true"></span>`
          : ""}<a
          class="site-nav-link${ctx.current === i.key ? " is-current" : ""}"
          href="${i.href}"
          ${ctx.current === i.key ? html`aria-current="page"` : ""}
          >${i.label}</a
        >`,
      )}
    </nav>`;
}

/**
 * The footer's funding line, named so this note can sit beside it.
 *
 * IT NEEDS THE WORD "RETAILERS" ON THIS ORIGIN, and did not have it - it read
 * "funded by affiliate commissions", copied from the catalogue. On the
 * catalogue that sentence is read by a shopper, for whom the only possible
 * counterparty is a shop. Here it is read by a producer who has just been told
 * we take no commission on their sales at any tier (founder decision,
 * 2026-09-18), so the unqualified version reads as the small print that takes
 * the promise back. Same fact, one clause, no ambiguity about whose sales pay
 * for the site.
 */
const FUNDING_LINE = html`Counterscent is a Sirketim product. Independent
  editorial, funded by commissions from the retailers we link to, never from a
  producer's own sales.`;

export function layout(options: PageOptions): Html {
  const { title, heading, standfirst, status, body, nav } = options;

  /**
   * WHERE HOME IS, AND WHY IT IS NOT ALWAYS `/`.
   *
   * FOUNDER, 2026-09-20: "when logged in as admin when i press the logo for
   * going the console we lose navigation". Exactly right, and the lockup was
   * the cause rather than the nav. It linked to `/` unconditionally; `/` is
   * the signed-out explainer and passes no nav, so pressing the logo from
   * anywhere inside the console dropped the reader out of the app shell
   * entirely. An admin notices first because they have the most to lose -
   * six items rather than three - but it happened to every signed-in
   * producer.
   *
   * In an app shell the lockup means "home", and home for somebody signed in
   * is their console, not the page explaining what the console will be. That
   * is also plainly what the founder expected: they pressed the logo in
   * order to GO to the console.
   *
   * THIS IS THE THIRD TIME THIS ORIGIN HAS LOST A WAY BACK, which is the
   * part worth remembering. The nav exists at all because the only route
   * between screens was a footer link (2026-09-18); showAdmin was then
   * threaded through the producer side because /admin was reachable only by
   * typing the URL (same day, see console.ts). Each fix corrected one exit
   * and left the others alone. The pattern is that an escape hatch added
   * before the shell existed keeps pointing where it pointed then.
   */
  const signedIn = options.signedIn ?? nav !== undefined;
  const home = signedIn ? "/console" : "/";

  // A nav makes the back-link redundant twice over: the lockup goes home
  // already, and a back-link inside an app shell reads as browser history
  // rather than as a place. Default it off wherever a nav renders, so a caller
  // adding nav does not have to remember to remove the other thing. Where it
  // DOES render - a signed-in screen with no nav - it now follows `home`
  // rather than pointing at the explainer, which was the same bug in
  // miniature.
  const showBackLink = options.showBackLink ?? !nav;

  return html`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<meta name="description" content="The Counterscent producer console. Sign-in, listings and submissions for producers we have already spoken to.">
<title>${title} | Counterscent producers</title>
<link rel="icon" href="/assets/icon.svg" type="image/svg+xml">
<link rel="preload" href="/assets/fonts/public-sans-latin-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/console.css">
${
  // The theme script is BLOCKING ON PURPOSE, not an oversight, and the reason
  // lives in public/assets/theme.js. It used to be an HTML comment, which
  // shipped the explanation to every reader of every page to tell them
  // something only we need to know. A note for us belongs in the source that
  // builds the page, not in the page.
  ""
}<script src="/assets/theme.js"></script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>

<header class="site-header">
  <div class="shell header-inner">
    <a class="lockup" href="${home}">
      ${MARK}
      <span class="lockup-text">
        <span class="wordmark">COUNTERSCENT</span>
        <span class="lockup-sub">Producer console</span>
      </span>
    </a>
    ${nav ? navBar(nav) : ""}
    <div class="header-actions">
      <a class="quiet-link" href="${CATALOGUE}">counterscent.com</a>
      <button type="button" id="theme-toggle" class="icon-button" hidden>Dark</button>
    </div>
  </div>
</header>

<main id="main">
  <div class="shell">
    ${showBackLink
      ? html`<a class="back-link" href="${home}"
          >${signedIn ? "Back to the console" : "Back to the overview"}</a
        >`
      : ""}
    ${
      status
        ? html`<div class="status-strip" role="note">
      <span class="pill ${status.tone === "solid" ? "pill-solid" : "pill-alert"}">${status.label}</span>
      <p>${status.note}</p>
    </div>`
        : ""
    }
    <h1>${heading}</h1>
    ${standfirst ? html`<p class="standfirst">${standfirst}</p>` : ""}
    ${body}
  </div>
</main>

<footer class="site-footer">
  <div class="shell footer-inner">
    <div>
      <p class="footer-lead">
        <a href="${CATALOGUE}">counterscent.com</a> is the public catalogue.
        This address is the console producers will work in.
      </p>
      <p class="muted">${FUNDING_LINE}</p>
    </div>
    <nav class="footer-links" aria-label="Counterscent">
      <a href="${CATALOGUE}/producers">List your fragrance</a>
      <a href="${CATALOGUE}/producers/pricing">Plans and pricing</a>
      <a href="${CATALOGUE}/about#methodology">How we score</a>
      ${
        // The three legal documents a merchant-of-record domain review looks
        // for, reachable from every page of the origin where the subscription
        // is actually bought. Refunds is local because it is about a
        // transaction that only happens here; terms and privacy live on the
        // catalogue, which is the one canonical copy of each.
        ""
      }
      <a href="/refunds">Refund policy</a>
      <a href="${CATALOGUE}/terms">Terms of service</a>
      <a href="${CATALOGUE}/privacy">Privacy policy</a>
      <a href="${CATALOGUE}/disclosure">Affiliate disclosure</a>
      <a href="mailto:contact@counterscent.com">contact@counterscent.com</a>
    </nav>
  </div>
</footer>
</body>
</html>
`;
}
