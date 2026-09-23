import { getImage, isMediaConfigured } from "../lib/media";
import { SECURITY_HEADERS } from "../lib/http";
import type { Env } from "../lib/env";

/**
 * Serves a producer's uploaded photograph.
 *
 * ================== THIS ROUTE IS DELIBERATELY UNAUTHENTICATED ============
 * and that is the decision most worth arguing with, so here is the argument.
 *
 * A listing's photograph has to end up on counterscent.com, which is a STATIC
 * export with no server and no session. It cannot present a cookie, so an
 * image behind `requireSession` could never be shown where the photograph is
 * actually for. Requiring a session here would mean building a second, public
 * copy of every approved image later - two stores, and a window where they
 * disagree.
 *
 * WHAT PROTECTS AN UNPUBLISHED PHOTO IS THE KEY, and nothing else. The key
 * carries a v4 UUID (lib/media.ts, newImageKey) so it cannot be guessed or
 * walked; a stranger who has not been given the URL cannot reach the image,
 * and nothing on this origin or the catalogue links to an unapproved one.
 * That is "unlisted", not "private", and the difference is real: anyone the
 * producer forwards the URL to can open it, forever, whether or not the
 * listing is ever approved.
 *
 * WHY THAT IS ACCEPTABLE HERE: the content is a photograph of a bottle that
 * the producer is actively asking us to publish. It is not correspondence and
 * not personal data by intent. If this route is ever reused for something a
 * producer would not publish - an invoice, an ID document, a trade-secret
 * formulation - this reasoning does not transfer and the route needs a
 * session.
 *
 * WHAT IS STILL MISSING, said plainly rather than left to be discovered: EXIF
 * is not stripped, so a photograph taken on a phone can carry GPS coordinates
 * and we serve them untouched. Stripping requires decoding the image, which
 * the 10ms CPU budget does not allow (see lib/media.ts). Until that is solved
 * the submit form has to WARN the producer rather than quietly publish their
 * location - routes/submit.ts carries that notice.
 */
export async function mediaObject(request: Request, env: Env): Promise<Response> {
  if (!isMediaConfigured(env)) {
    // House rule: a feature whose backing service is not configured says so
    // with a reason. Never a fake 404, which would read as "no such image"
    // and send somebody looking for a bug in the upload instead.
    return new Response("Image storage is not configured on this deployment.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8", ...SECURITY_HEADERS },
    });
  }

  const key = decodeURIComponent(new URL(request.url).pathname.slice("/media/".length));

  // The key shape is fixed by newImageKey(). Anything else is rejected before
  // it reaches storage, so a crafted path cannot climb out of the prefix or
  // probe the bucket's other contents.
  if (!/^listings\/[a-z0-9-]{1,64}\/[0-9a-f-]{36}\.(jpg|png|webp)$/.test(key)) {
    return new Response(null, { status: 404, headers: SECURITY_HEADERS });
  }

  let object: Response | null;
  try {
    object = await getImage(env, key);
  } catch {
    // A storage outage is ours, not the reader's, and it must not be dressed
    // up as a missing file - a 404 here would have somebody hunting for a
    // lost upload during an incident.
    return new Response(null, { status: 502, headers: SECURITY_HEADERS });
  }
  if (!object) return new Response(null, { status: 404, headers: SECURITY_HEADERS });

  // The type comes from OUR sniffing at upload time (lib/media.ts), so what
  // storage hands back is a value we chose. Re-checking it against the same
  // allowlist costs nothing and means a bucket edited by any other route -
  // or by hand - still cannot get a scripted type served from this origin.
  const stored = object.headers.get("content-type") ?? "";
  const contentType = ["image/jpeg", "image/png", "image/webp"].includes(stored)
    ? stored
    : "application/octet-stream";

  return new Response(object.body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      // The key contains a UUID and the bytes at a key never change, so this
      // is safe to cache hard. It is also the thing that keeps this route
      // cheap: without it every thumbnail render would invoke the Worker.
      "Cache-Control": "public, max-age=31536000, immutable",
      // Belt and braces with nosniff: if the allowlist above ever lets
      // something odd through, the browser still must not run it inline.
      "Content-Disposition": "inline",
      ...SECURITY_HEADERS,
    },
  });
}
