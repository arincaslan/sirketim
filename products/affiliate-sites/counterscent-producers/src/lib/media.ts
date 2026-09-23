import { AwsClient } from "aws4fetch";
import type { Env } from "./env";

/**
 * Producer-supplied photographs: where they go, and what we refuse.
 *
 * THIS MODULE IS THE ONLY PLACE THAT KNOWS WHICH PROVIDER STORES THE BYTES.
 * Everything else moves a key string around. That boundary is deliberate and
 * has a named alternative behind it: Cloudflare R2 was the founder's first
 * choice on 2026-09-23 and lost on one fact rather than on merit - R2 was not
 * enabled on the account and turning it on is a dashboard step, while Neon
 * Object Storage was already enabled on both branches. The reasons R2 may yet
 * win (no credential at all, since a Worker binding is capability-based, and
 * no egress charge) are unchanged. Swapping is this file plus three secrets,
 * NOT a migration, because `Submission.imageUrl` stores a path on THIS origin
 * and never a provider's hostname.
 *
 * WHY NOT THE NEON HTTP API, which can presign and even stream an object
 * without any of this signing code: it authenticates with a Neon API key,
 * which reaches the whole project - projects, branches, databases, roles. The
 * S3 credential below reaches object storage and nothing else. Handing the
 * Worker the broader key to save a dependency is the trade this repo has
 * already refused once, with the Hostinger mail token.
 *
 * ================== THE 10ms CPU BUDGET DECIDES THE SIGNATURE ==============
 * SigV4 normally hashes the request body, and the Workers FREE plan gives
 * 10ms of CPU per request. Measured on 2026-09-23 against the real local-dev
 * bucket, signing a 2 MB body:
 *
 *   signed payload    HTTP 200, 58.0ms   <- 5.8x the entire request budget
 *   UNSIGNED-PAYLOAD  HTTP 200,  3.8ms
 *
 * So `x-amz-content-sha256: UNSIGNED-PAYLOAD` is not a tuning choice here, it
 * is the only version that fits the platform - the same shape of finding as
 * the PBKDF2 measurement that killed password sign-in. Both were accepted by
 * the server, so this is a real measurement of two working paths and not a
 * workaround for a failure.
 *
 * WHAT WE GIVE UP BY NOT SIGNING THE BODY, stated rather than implied: the
 * signature no longer proves the bytes were not altered in transit. TLS still
 * does, and the request never leaves our code, so the exposure is a party who
 * has already broken TLS between Cloudflare and Neon. That is a different and
 * much larger incident than a tampered thumbnail.
 */

/** The bucket exists under this name on EVERY branch. Created 2026-09-23. */
const BUCKET = "producer-media";

/** Neon object storage is one region today; it is not branch-dependent. */
const REGION = "us-east-2";

/**
 * 5 MB. A phone photo of a bottle lands well under this; the cap exists so an
 * unbounded body cannot be streamed into our storage on someone else's whim,
 * not because 5 MB is a meaningful amount of disk.
 */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/**
 * THE CLIENT'S Content-Type IS NOT EVIDENCE. A browser sends whatever the
 * uploader's machine claims, and an attacker sends whatever they like. If we
 * stored that string and served it back, an uploaded HTML file returned as
 * `text/html` would execute on this origin - a stored XSS with a session
 * cookie sitting right there.
 *
 * So the type is decided HERE, from the first bytes of the file, and the
 * value we serve later is the one this table produced. `nosniff` is already
 * on every response (src/lib/http.ts), which closes the matching hole where a
 * browser second-guesses a correct type.
 */
const SIGNATURES: ReadonlyArray<{ type: string; ext: string; match: (b: Uint8Array) => boolean }> = [
  {
    type: "image/jpeg",
    ext: "jpg",
    match: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  {
    type: "image/png",
    ext: "png",
    match: (b) =>
      b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 && b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a,
  },
  {
    type: "image/webp",
    ext: "webp",
    // "RIFF" .... "WEBP" - the size field sits between the two markers.
    match: (b) =>
      b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50,
  },
];

/**
 * Pulls a file part out of a parsed form.
 *
 * THE CAST IS HERE BECAUSE THE TYPES ARE WRONG, not because the runtime is.
 * `@cloudflare/workers-types` declares `FormData.get(): string | null`, which
 * models only the simple case; the runtime returns a `File` for a part of a
 * `multipart/form-data` body, which is exactly what this route needs. Narrowed
 * in one place, with the reason, rather than cast at each call site - and
 * proved with a real upload rather than assumed, because a types gap that is
 * papered over with `as` is indistinguishable from a wrong assumption until
 * something runs.
 */
export function filePart(form: FormData, name: string): File | string | null {
  return form.get(name) as unknown as File | string | null;
}

/** What a caller may show a producer. Never the underlying S3 error. */
export type ImageRejection =
  | { kind: "missing" }
  | { kind: "too-large"; maxBytes: number }
  | { kind: "unsupported-type" };

export type ImageCheck =
  | { ok: true; bytes: Uint8Array; contentType: string; ext: string }
  | { ok: false; reason: ImageRejection };

/**
 * Reads the upload fully and decides whether we will keep it.
 *
 * Reads it into memory on purpose: the bytes have to be sniffed before we
 * trust them, and MAX_IMAGE_BYTES bounds what that costs. The size is checked
 * against the actual buffer rather than `File.size`, which is another number
 * the client supplies.
 */
export async function checkImageUpload(value: File | string | null): Promise<ImageCheck> {
  if (!value || typeof value === "string") return { ok: false, reason: { kind: "missing" } };
  if (value.size === 0) return { ok: false, reason: { kind: "missing" } };
  if (value.size > MAX_IMAGE_BYTES) {
    return { ok: false, reason: { kind: "too-large", maxBytes: MAX_IMAGE_BYTES } };
  }

  const bytes = new Uint8Array(await value.arrayBuffer());
  if (bytes.byteLength === 0) return { ok: false, reason: { kind: "missing" } };
  if (bytes.byteLength > MAX_IMAGE_BYTES) {
    return { ok: false, reason: { kind: "too-large", maxBytes: MAX_IMAGE_BYTES } };
  }

  const hit = SIGNATURES.find((s) => s.match(bytes));
  if (!hit) return { ok: false, reason: { kind: "unsupported-type" } };

  return { ok: true, bytes, contentType: hit.type, ext: hit.ext };
}

/**
 * Configured means all three secrets are present. Optional-by-type is this
 * project's house rule (see lib/env.ts): a feature whose backing secret is
 * missing has to say so at the point of use rather than 500.
 */
export function isMediaConfigured(env: Env): boolean {
  return Boolean(env.MEDIA_S3_ENDPOINT && env.MEDIA_ACCESS_KEY_ID && env.MEDIA_SECRET_ACCESS_KEY);
}

function clientFor(env: Env): AwsClient {
  return new AwsClient({
    accessKeyId: env.MEDIA_ACCESS_KEY_ID as string,
    secretAccessKey: env.MEDIA_SECRET_ACCESS_KEY as string,
    service: "s3",
    region: REGION,
  });
}

/**
 * The object key for a new photograph.
 *
 * UNGUESSABLE BY CONSTRUCTION, because `/media/<key>` is served without a
 * session - see routes/media.ts for why that is the right call and what it
 * costs. A random v4 UUID is the whole access control on an unpublished
 * photograph, so it must not be derived from anything a stranger can guess:
 * not the submission id, not the producer's name, not a counter.
 *
 * The producer id prefix is for our own operations only (listing and deleting
 * one producer's objects); it is not a secret and nothing depends on it.
 */
export function newImageKey(producerId: string, ext: string): string {
  return `listings/${producerId}/${crypto.randomUUID()}.${ext}`;
}

/**
 * Stores the bytes. Throws on a non-2xx so the caller cannot mistake a failed
 * upload for a stored one and write a row pointing at nothing.
 */
export async function putImage(
  env: Env,
  key: string,
  bytes: Uint8Array,
  contentType: string,
): Promise<void> {
  const res = await clientFor(env).fetch(`${env.MEDIA_S3_ENDPOINT}/${BUCKET}/${key}`, {
    method: "PUT",
    body: bytes,
    headers: {
      "content-type": contentType,
      // See the header: this is the 10ms budget, not an optimisation.
      "x-amz-content-sha256": "UNSIGNED-PAYLOAD",
    },
  });
  if (!res.ok) {
    // The S3 body can carry the bucket and endpoint; it is for our logs, and
    // callers turn this into a generic message for the producer.
    throw new Error(`object storage PUT failed: ${res.status} ${(await res.text()).slice(0, 200)}`);
  }
}

/**
 * Fetches the bytes back. Returns null for a key that is not there, which the
 * route turns into its own 404 rather than passing S3's XML to a browser.
 */
export async function getImage(env: Env, key: string): Promise<Response | null> {
  const res = await clientFor(env).fetch(`${env.MEDIA_S3_ENDPOINT}/${BUCKET}/${key}`, {
    method: "GET",
    headers: { "x-amz-content-sha256": "UNSIGNED-PAYLOAD" },
  });
  if (res.status === 404 || res.status === 403) return null;
  if (!res.ok) throw new Error(`object storage GET failed: ${res.status}`);
  return res;
}
