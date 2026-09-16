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
}

export function layout(options: PageOptions): Html {
  const { title, heading, standfirst, status, body, showBackLink = true } = options;

  return html`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<meta name="description" content="The Counterscent producer console. The programme is not open and there are no accounts.">
<title>${title} | Counterscent producers</title>
<link rel="icon" href="/assets/icon.svg" type="image/svg+xml">
<link rel="preload" href="/assets/fonts/public-sans-latin-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/console.css">
<!-- Blocking on purpose, not deferred. See public/assets/theme.js. -->
<script src="/assets/theme.js"></script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>

<header class="site-header">
  <div class="shell header-inner">
    <a class="lockup" href="/">
      ${MARK}
      <span class="lockup-text">
        <span class="wordmark">COUNTERSCENT</span>
        <span class="lockup-sub">Producer console</span>
      </span>
    </a>
    <div class="header-actions">
      <!--
        No navigation items, on purpose. "Console" and "Review" in a
        persistent nav would present two areas as places you can go and work,
        which is the exact claim this origin must not make yet. They are
        reachable from the overview and labelled there as layout previews.
        This is where real navigation goes once there is a session to render
        it for.
      -->
      <a class="quiet-link" href="${CATALOGUE}">counterscent.com</a>
      <button type="button" id="theme-toggle" class="icon-button" hidden>Dark</button>
    </div>
  </div>
</header>

<main id="main">
  <div class="shell">
    ${showBackLink ? html`<a class="back-link" href="/">Back to the overview</a>` : ""}
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
      <p class="muted">
        Counterscent is a Sirketim product. Independent editorial, funded by
        affiliate commissions.
      </p>
    </div>
    <nav class="footer-links" aria-label="Counterscent">
      <a href="${CATALOGUE}/producers">List your fragrance</a>
      <a href="${CATALOGUE}/producers/pricing">Plans and pricing</a>
      <a href="${CATALOGUE}/about#methodology">How we score</a>
      <a href="${CATALOGUE}/disclosure">Affiliate disclosure</a>
      <a href="mailto:contact@counterscent.com">contact@counterscent.com</a>
    </nav>
  </div>
</footer>
</body>
</html>
`;
}
