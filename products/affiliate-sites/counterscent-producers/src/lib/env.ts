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
}
