import type { Html } from "./html";

/**
 * Response construction and the headers every response carries.
 *
 * THIS ORIGIN IS NEVER INDEXED. A producer console has no business in search
 * results: its pages are either private or meaningless to a reader, and an
 * indexed sign-in page under the Counterscent name is a phishing template
 * somebody else gets to use. `X-Robots-Tag` is the instrument that does that
 * (see routes/robots.ts for why robots.txt is NOT, and why it says Allow).
 */
const COMMON_SECURITY_HEADERS: Record<string, string> = {
  // Both directives: `noindex` keeps it out of results, `nofollow` stops the
  // crawler walking into paths that will later be behind a session.
  "X-Robots-Tag": "noindex, nofollow",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

/**
 * The policy is written against what this origin does TODAY. Every directive
 * is a real constraint rather than a copied default.
 *
 *   `script-src 'self'` with no 'unsafe-inline' - the theme script is an
 *   external file for this reason. An inline <script> would have forced
 *   either 'unsafe-inline' (which gives up most of the policy) or a hash
 *   that silently rots the first time someone edits the script.
 *
 *   `form-action` is the one directive that now varies by page - see
 *   buildCsp() below for why.
 */
function buildCsp(opts: { allowForms: boolean }): string {
  return [
    "default-src 'none'",
    "script-src 'self'",
    "style-src 'self'",
    "font-src 'self'",
    "img-src 'self' data:",
    // 'none' until sign-in was built - there was nothing to submit anywhere
    // on this origin, so nothing COULD be submitted, at the browser level,
    // even if a future edit accidentally shipped a live <form>. Step 5 is
    // that deliberate widening, and only for the one page that has a real
    // <form> today: everything else still gets 'none', so the CSP keeps
    // matching what each page actually contains rather than the origin's
    // eventual shape.
    opts.allowForms ? "form-action 'self'" : "form-action 'none'",
    "base-uri 'none'",
    "frame-ancestors 'none'",
  ].join("; ");
}

/** The default headers: no live form on the page. */
export const SECURITY_HEADERS: Record<string, string> = {
  ...COMMON_SECURITY_HEADERS,
  "Content-Security-Policy": buildCsp({ allowForms: false }),
};

/** For the one page (today) with a real <form> that posts to this origin. */
export const SECURITY_HEADERS_WITH_FORMS: Record<string, string> = {
  ...COMMON_SECURITY_HEADERS,
  "Content-Security-Policy": buildCsp({ allowForms: true }),
};

/**
 * No caching on HTML, deliberately.
 *
 * Every page here currently says some version of "this is not open yet". The
 * worst thing this origin could do is serve a cached copy of that sentence to
 * a producer who has just been emailed to say it IS open. Revisit when there
 * is a page whose content does not depend on the programme's state.
 */
export function page(
  body: Html,
  status = 200,
  options: { allowForms?: boolean; headers?: Record<string, string> } = {},
): Response {
  return new Response(body.value, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      // `options.headers` is spread BEFORE the security set, not after, so a
      // caller adding a header (Retry-After on the 429 in routes/sign-in.ts is
      // the first) cannot overwrite the CSP or X-Robots-Tag by picking the
      // same name. Additive only, by construction rather than by convention.
      ...options.headers,
      ...(options.allowForms ? SECURITY_HEADERS_WITH_FORMS : SECURITY_HEADERS),
    },
  });
}

/**
 * A same-origin redirect (the PRG pattern - POST, then redirect to a GET -
 * used everywhere this origin processes a form, so refreshing the result
 * page never resubmits it). `setCookie` is applied with `Headers.append()`
 * rather than folded into an object spread, because a plain object can only
 * hold one value per key and a redirect that both sets a session cookie and
 * (hypothetically) another header under the same name would silently drop
 * one - `append()` is the one API that cannot do that.
 */
export function redirect(
  location: string,
  options: { status?: number; setCookie?: string | string[] } = {},
): Response {
  const headers = new Headers({ Location: location, ...SECURITY_HEADERS });
  // AN ARRAY IS ACCEPTED because one response genuinely needs two cookies: the
  // OAuth callback sets the session AND expires the in-flight __Host-oauth
  // cookie in the same redirect. Folding those into one header is not possible
  // and dropping either is a real bug - a session with a live flow cookie left
  // behind, or a cleared flow with nobody signed in. `append()` was already
  // the right API for this and now takes the whole list.
  if (options.setCookie) {
    const cookies = Array.isArray(options.setCookie) ? options.setCookie : [options.setCookie];
    for (const cookie of cookies) headers.append("Set-Cookie", cookie);
  }
  return new Response(null, { status: options.status ?? 302, headers });
}

export function text(body: string, contentType = "text/plain; charset=utf-8"): Response {
  return new Response(body, {
    headers: { "Content-Type": contentType, ...SECURITY_HEADERS },
  });
}

export function json(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...SECURITY_HEADERS,
    },
  });
}
