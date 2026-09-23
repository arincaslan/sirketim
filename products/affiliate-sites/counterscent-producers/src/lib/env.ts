/**
 * The Worker's environment bindings. No `vars`/`secrets` block exists in
 * wrangler.jsonc on purpose (see that file and .dev.vars.example) - every key
 * here arrives as a secret, `wrangler secret put <NAME>` in production or a
 * line in the gitignored `.dev.vars` locally, never a value typed into a
 * committed config in this public repo.
 *
 * Every field is optional, and that optionality is load-bearing rather than
 * a type-safety formality: this project's house rule is that a feature whose
 * backing secret is not configured must say so at the point of use, and the
 * only way a caller is forced to handle that is if the type admits `undefined`.
 * See src/lib/db.ts and src/lib/mailer.ts for the two places that check.
 */
export interface Env {
  /**
   * Postgres, POOLED connection string (hostname contains "-pooler"). From
   * `neon link`, never typed by hand - see .dev.vars.example. This Worker
   * never runs `prisma migrate`, so it has no use for the unpooled string;
   * that stays a local-machine concern in prisma/schema.prisma's own comment.
   */
  DATABASE_URL?: string;

  /**
   * Hostinger's HTTP Email API, which is how this origin sends its magic
   * links. Not SMTP: see src/lib/mailer.ts for why the hand-rolled SMTP
   * client that used to live here was deleted rather than kept as a fallback.
   *
   * THIS MUST BE A SEPARATELY ISSUED TOKEN, not the value of the machine-level
   * `HOSTINGER_MAIL_TOKEN` that the founder's own hostinger-email MCP server
   * reads. The two are deliberately distinct for the same reason the root
   * CLAUDE.md records for HOSTINGER_API_TOKEN vs HOSTINGER_MAIL_TOKEN:
   * rotating one must not break the other. It is not a security ceiling -
   * both tokens reach the same mailbox, and neither can be scoped to sending
   * alone - it is about whether revocation is cheap. If this Worker is ever
   * suspected of leaking, revoking a token it does not share costs nothing
   * and therefore actually happens that day; revoking a shared one breaks the
   * founder's own tooling, so it gets deferred, which is how a suspected
   * compromise becomes a real one.
   *
   * WHAT A LEAK OF THIS REACHES, stated rather than implied: send, plus read,
   * search, delete (single, bulk, and whole-folder) and webhook management on
   * contact@counterscent.com. Hostinger's Email API offers no send-only scope
   * - checked against its full operation list, not assumed. Note also that
   * revoking the token does NOT remove a webhook created with it: on
   * suspicion, revoke AND enumerate the mailbox's webhooks.
   */
  HOSTINGER_MAIL_API_TOKEN?: string;

  /**
   * Which mailbox that token sends from - `AC…`, from `GET /api/v1/me`, whose
   * `data.mailboxes[]` is the only way to discover it (there is no standalone
   * list-mailboxes endpoint). Configurable rather than hardcoded because the
   * open question of whether magic links should keep going out from the
   * business's human inbox is a founder decision that is not yet taken; when
   * it is, this becomes a secret change rather than a code change.
   */
  HOSTINGER_MAILBOX_ID?: string;

  /**
   * Comma-separated addresses allowed to reach `/admin` and `/review`.
   *
   * FOUNDER DECISION 2026-09-18: administrative access is a deployment secret
   * rather than a `User.role` column, so that nothing the application can
   * write is able to grant it and revoking it never depends on the database
   * being healthy. The full reasoning, and the condition under which it should
   * become a column instead, is in src/lib/admin.ts.
   *
   * UNSET MEANS NOBODY, NEVER EVERYBODY. `requireAdmin` answers 503 with the
   * reason when this is missing rather than falling open, and it checks that
   * before it checks the session so a fresh environment says "set the secret"
   * instead of sending the reader through sign-in first.
   *
   * WHAT A LEAK OF THIS REACHES: nothing on its own. It is a list of
   * addresses, not a credential - holding it does not let anyone in, because
   * an admin still has to prove the address through the ordinary magic-link
   * sign-in. It is worth keeping out of the repo anyway, since publishing
   * which inbox to attack is a free gift to somebody choosing a target.
   */
  ADMIN_EMAILS?: string;

  /**
   * SIGN IN WITH GOOGLE. Founder decision 2026-09-20: one way in is outdated,
   * so this origin grows OAuth alongside the magic link. Passwords
   * were considered and REJECTED in the same decision - see src/lib/oauth.ts
   * for the measurement that settled it.
   *
   * Each provider is a PAIR, and a pair is all-or-nothing: providerCredentials()
   * treats a provider whose id or secret is missing as not configured at all,
   * so a half-set pair renders no button rather than a button that 500s. That
   * is this project's house rule (a feature whose backing secret is absent
   * says so at the point of use) applied to a two-part credential.
   *
   * WHAT A LEAK OF A CLIENT SECRET REACHES, stated rather than implied: it
   * lets the holder impersonate THIS application to the provider - that is,
   * complete a code exchange for a user who has been persuaded to authorise
   * it. It does NOT read anything in this database and does not by itself
   * sign anyone in here, because the callback still has to arrive with a
   * state and PKCE verifier matching a cookie this Worker set. Rotate in the
   * provider's console; neither value is derived from anything else we hold.
   *
   * MICROSOFT WAS HERE AND WAS DROPPED 2026-09-20, before it was ever
   * deployed, at the founder's instruction. Google alone. The provider table
   * in src/lib/providers.ts records why, and re-adding it is one entry there
   * plus two secrets here.
   *
   * The redirect URI registered with each provider must be exactly
   * https://producers.counterscent.com/auth/<provider>/callback - providers
   * match it as an exact string, so a trailing slash is a different URI.
   */
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;

  /**
   * NEON OBJECT STORAGE, where a producer's uploaded photograph lives.
   * Founder decision 2026-09-23, after Cloudflare R2 was chosen first and then
   * set aside on one fact: R2 is not enabled on the account and enabling it is
   * a dashboard step, while Neon storage was already enabled on both branches.
   * lib/media.ts holds the full reasoning and is the only file that would
   * change if R2 wins later.
   *
   * THE ENDPOINT IS PER-BRANCH and that is the point of using it. Production
   * and local-dev have separate endpoints and separate buckets, so running
   * `wrangler dev` cannot write into the photographs the live site serves.
   * This repo has already been bitten by the reverse arrangement - see the
   * root CLAUDE.md on the Worker reading a different DATABASE_URL than every
   * ad-hoc script - and storage is the same trap with the same cure.
   *
   * NOTE ALSO: a bucket does NOT appear on a branch that was created before
   * the bucket was. local-dev branched on 09-18 and the bucket was made on
   * 09-23, so it needed its own `CreateBucket` call. A new branch taken from
   * now on inherits it.
   *
   * WHAT A LEAK OF THESE REACHES, stated rather than implied: the pair is a
   * Neon scoped credential carrying `storage:read` and `storage:write` on the
   * production branch AND every branch descended from it. That is read, write
   * and DELETE of every object in the bucket - Neon publishes no append-only
   * or write-without-delete scope, checked against its scope list rather than
   * assumed. It reaches NO Postgres data: the database is a separate
   * credential with separate scopes, which is the one material way this is
   * narrower than the Hostinger mail token. Revoke with
   * `DELETE /projects/{id}/branches/{branch}/credentials/{token_id}`, or
   * rotate the secret in place and keep the key id. Neon accepts an
   * `expires_at` on a credential and DOES NOT ENFORCE IT - its own docs say
   * so - so expiry is not access control here; revoke explicitly.
   */
  MEDIA_S3_ENDPOINT?: string;
  MEDIA_ACCESS_KEY_ID?: string;
  MEDIA_SECRET_ACCESS_KEY?: string;
}
