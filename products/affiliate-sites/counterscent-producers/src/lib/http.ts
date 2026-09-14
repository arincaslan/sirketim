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
export const SECURITY_HEADERS: Record<string, string> = {
  // Both directives: `noindex` keeps it out of results, `nofollow` stops the
  // crawler walking into paths that will later be behind a session.
  "X-Robots-Tag": "noindex, nofollow",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",

  /**
   * The policy is written against what this origin does TODAY, which is serve
   * HTML, one stylesheet, one 300-byte theme script and two fonts, all
   * same-origin. Every directive below is therefore a real constraint rather
   * than a copied default.
   *
   * Two of them are load-bearing for the house rule that nothing may claim to
   * work that does not:
   *
   *   `form-action 'none'` - there is nothing to submit anywhere on this
   *   origin, so nothing CAN be submitted, at the browser level, even if a
   *   future edit accidentally ships a live <form>. When sign-in is actually
   *   built this has to be widened to 'self' deliberately, which is the point.
   *
   *   `script-src 'self'` with no 'unsafe-inline' - the theme script is an
   *   external file for this reason. An inline <script> would have forced
   *   either 'unsafe-inline' (which gives up most of the policy) or a hash
   *   that silently rots the first time someone edits the script.
   */
  "Content-Security-Policy": [
    "default-src 'none'",
    "script-src 'self'",
    "style-src 'self'",
    "font-src 'self'",
    "img-src 'self' data:",
    "form-action 'none'",
    "base-uri 'none'",
    "frame-ancestors 'none'",
  ].join("; "),
};

/**
 * No caching on HTML, deliberately.
 *
 * Every page here currently says some version of "this is not open yet". The
 * worst thing this origin could do is serve a cached copy of that sentence to
 * a producer who has just been emailed to say it IS open. Revisit when there
 * is a page whose content does not depend on the programme's state.
 */
export function page(body: Html, status = 200): Response {
  return new Response(body.value, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      ...SECURITY_HEADERS,
    },
  });
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
