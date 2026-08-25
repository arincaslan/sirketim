# Affiliate content sites — technical foundation plan

Status: **planning only**. No site scaffolded, no real affiliate links, no affiliate-program enrollment, no GA4/Search Console account created. This document is the technical foundation the `content-strategist` subagent's `affiliate-content` skill is explicitly waiting on (`departments/content/CLAUDE.md`: "matching whatever format web-development's plan expects") — so the frontmatter schema in §1 and the site location in §7 are the two load-bearing decisions other departments are blocked on, not just internal notes.

Written niche-agnostic on purpose: niche 1 (carbide-tipped tools) is confirmed; niche 2 is still being researched by `sales-strategist` in parallel. Nothing below assumes a specific niche.

---

## 1. Content format: MDX-in-git, not a headless CMS

**Decision: MDX files with zod-validated frontmatter, committed to each site's own repo, not Sanity/Payload or any other headless CMS.**

Reasoning:

- **Who's actually authoring content is the deciding factor.** A headless CMS earns its keep when a non-technical human needs a WYSIWYG editing UI, draft/publish workflow states, and a media library. That's not this case — the author is an agent (`content-strategist`, via `affiliate-content`) that already writes files to disk and works through git, the same way every other department's skill in this repo produces its output. Making that agent instead call a CMS's HTTP API adds an SDK/auth dependency and a new failure mode for zero workflow benefit.
- **Version control is free and already the repo's native mechanism.** Every article becomes a normal git-tracked file: diffable, revertable, reviewable in the same PR as a schema/component change that affects it. A CMS's content history lives in a separate system outside this repo — harder to keep in sync with the code that renders it, and one more thing to audit.
- **Cost.** Checked this repo for existing Sanity/Payload usage: zero (`grep -r sanity|payload|contentlayer` across the whole tree turns up nothing but this department's own CLAUDE.md line recommending a headless CMS *for client sites where the client edits their own content*). Standing one up here would mean a new paid plan (Sanity's free tier caps quickly against dozens of articles behind read/write API calls) or self-hosting Payload (needs a provisioned Postgres — not yet stood up per the department's own "don't assume a database is live" convention). Neither is justified when the real author writes files directly.
- **Scale fits.** "Dozens of long-form articles accumulating over time" is comfortably inside static-generation territory — Next.js SSG handles hundreds of MDX-backed routes without strain. A CMS's advantages (editorial workflow states, non-technical UI, asset library) aren't needed until either a non-technical human starts editing directly, or volume moves into the hundreds-to-thousands range. Revisit then, not now.

**Mechanics:**

- Parse with `gray-matter` (frontmatter) + `next-mdx-remote/rsc` (render body as MDX inside a React Server Component, App Router-native, actively maintained by Vercel) rather than a compile-time MDX loader — this matters because content pieces need custom components injected at render time (`<AffiliateLink>`, a spec/comparison table, a pros/cons block, a verdict callout) and RSC-friendly rendering keeps that ergonomic.
- Validate every frontmatter object against a `zod` schema at build/load time — this is the actual coordination artifact between departments, not just a nice-to-have. If `content-strategist` hands off a piece whose frontmatter doesn't parse, that's a loud build-time error, not a silent bad page.

**Proposed frontmatter schema** (niche-agnostic — the three content types `affiliate-content`'s SKILL.md already names: guide, comparison, review):

```ts
// shared kit: content/schema.ts
import { z } from "zod";

const productRef = z.object({
  name: z.string(),
  brand: z.string().optional(),
  image: z.string().optional(),          // path under /public/images/<niche>/...
  priceApprox: z.string().optional(),     // display string only, e.g. "~$45" — not a live price feed
  affiliateLinkId: z.string(),            // resolves via lib/affiliate-links config (see §5) — never a raw URL in content
  editorialRating: z.number().min(1).max(5).optional(),
  pros: z.array(z.string()).optional(),
  cons: z.array(z.string()).optional(),
});

const base = z.object({
  title: z.string(),
  description: z.string(),                // meta description, ~150-160 chars
  slug: z.string(),
  publishedAt: z.string(),                 // ISO date
  updatedAt: z.string().optional(),
  author: z.string().default("Editorial Team"),
  heroImage: z.string().optional(),
  categories: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),   // target keyword cluster from content-plan.md
  disclosure: z.boolean().default(true),        // forces the FTC disclosure block to render — see content dept's non-negotiable
});

export const guideFrontmatter = base.extend({
  contentType: z.literal("guide"),
  featuredProducts: z.array(productRef).optional(),
});

export const comparisonFrontmatter = base.extend({
  contentType: z.literal("comparison"),
  products: z.array(productRef).min(2),
});

export const reviewFrontmatter = base.extend({
  contentType: z.literal("review"),
  product: productRef,
});
```

**Handoff mechanic** (per `departments/content/CLAUDE.md`, which is explicit that it does *not* commit into a site's repo): `content-strategist` drops drafts + metadata in `departments/content/projects/<site-slug>/drafts/<piece-slug>.md`. `web-developer` reviews and copies/converts each into the live site's `content/<content-type>/<piece-slug>.mdx` (frontmatter conformed to the schema above) as an integration step — a deliberate manual gate, not an auto-sync, so a bad draft can't land on the site unreviewed.

Not shared-CMS, but also not "hand-edit in a TS array" like the three fragrance templates — this is the middle path the department's CLAUDE.md already gestures at ("CMS when needed") applied correctly: not needed here.

---

## 2. `sitemap.ts` / `robots.ts`

Currently missing in all four existing templates (`agency-landing`, `fragrance-store`, `fragrance-store-2`, `fragrance-store-3`) — confirmed by directory listing, no `app/sitemap.ts` or `app/robots.ts` anywhere in `products/web-templates/`. Both affiliate sites need these correct *before* they could ever go live; plan:

- **`app/robots.ts`** (Next.js App Router metadata-route convention, returns `MetadataRoute.Robots`): allow all, point to `${SITE_URL}/sitemap.xml`. Trivial and static — no dependency on content existing yet.

```ts
// app/robots.ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example-placeholder.com";
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/go/"] }, // /go/ is the affiliate redirect route (§5) — no reason to let it get indexed
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
```

- **`app/sitemap.ts`** (`MetadataRoute.Sitemap`): built from the same content-loader used to render pages, so it can never drift from what actually exists. Static routes (home, category index pages) plus one entry per content piece, `lastModified` from frontmatter `updatedAt`/`publishedAt`.

```ts
// app/sitemap.ts — thin per-site wrapper around the shared kit's generator
import type { MetadataRoute } from "next";
import { getAllContent } from "@/content/loader";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example-placeholder.com";
  const pieces = getAllContent();
  return [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    ...pieces.map((p) => ({
      url: `${siteUrl}/${p.contentType}/${p.slug}`,
      lastModified: p.updatedAt ?? p.publishedAt,
      changeFrequency: "monthly" as const,
      priority: p.contentType === "comparison" ? 0.9 : 0.7,
    })),
  ];
}
```

- The "walk content, build URL list" logic belongs in the shared kit (§6) — both sites' `sitemap.ts` files should be near-identical thin wrappers, not reimplementations.
- **Pre-launch checklist item** (explicit, since the task calls this out): before either site is deployed, confirm `/sitemap.xml` and `/robots.txt` both resolve and are non-empty. Worth a one-line smoke check (e.g. via the `playwright` skill once a site is actually running) rather than trusting it by inspection — flagged for whenever a real deploy is on the table, not actionable today since nothing is hosted yet.

---

## 3. `schema.org` / JSON-LD

Currently zero implementation anywhere in this codebase (checked — no `application/ld+json` anywhere in `products/web-templates/`). This is the piece that most directly affects affiliate content's ability to rank (rich results for reviews/comparisons), so it's worth building deliberately rather than bolting on later.

**Pattern:**

- A typed builder module in the shared kit, populated straight from the frontmatter schema in §1 — this is exactly why that schema needs the right fields (rating, pros/cons, price-as-display-string) up front, so content only has to be entered once.

```ts
// shared kit: lib/jsonld.ts
export function articleSchema(p: { title: string; description: string; publishedAt: string; updatedAt?: string; author: string; url: string; image?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: p.title,
    description: p.description,
    datePublished: p.publishedAt,
    dateModified: p.updatedAt ?? p.publishedAt,
    author: { "@type": "Organization", name: p.author },
    image: p.image,
    mainEntityOfPage: p.url,
  };
}

export function reviewSchema(p: {
  productName: string; brand?: string; rating?: number; author: string; url: string;
}) {
  // NOTE: this is an editorial rating authored by the site, not an AggregateRating —
  // never fabricate a review-count/AggregateRating from reviews that don't exist.
  // That's a real Google spam-policy risk for affiliate sites specifically.
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: { "@type": "Product", name: p.productName, brand: p.brand },
    author: { "@type": "Organization", name: p.author },
    reviewRating: p.rating
      ? { "@type": "Rating", ratingValue: p.rating, bestRating: 5, worstRating: 1 }
      : undefined,
    url: p.url,
  };
}

export function itemListSchema(items: { name: string; url: string; position: number }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((i) => ({ "@type": "ListItem", position: i.position, name: i.name, url: i.url })),
  };
}
```

- A tiny render component wraps any of the above in a `<script type="application/ld+json">` tag (`JSON.stringify`d server-side — content is agent-authored, not raw user input, but stringify safely regardless rather than string-templating JSON by hand).

```tsx
// shared kit: components/JsonLd.tsx
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
```

- Composition happens per route: `app/review/[slug]/page.tsx` renders `Article` + `Review`; `app/comparison/[slug]/page.tsx` renders `Article` + `ItemList` referencing the compared products; `app/guide/[slug]/page.tsx` renders `Article` alone (or `ItemList` if it features specific products).
- **Manual verification before launch**: run real pages through Google's Rich Results Test once something is deployed — not automatable in this planning pass since nothing is live, but worth a checklist line for whenever that happens.

---

## 4. GA4 / Search Console — code-side integration points only

Account/property creation is explicitly the founder's step, out of scope here. What's plannable today is just the wiring, all of it env-var-gated so it's inert (renders nothing / adds nothing) with no real ID set — meaning it's safe to scaffold now, before any account exists.

```tsx
// shared kit: components/Analytics.tsx — renders nothing if the env var isn't set
import Script from "next/script";

export function GoogleAnalytics() {
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!id) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${id}');`}
      </Script>
    </>
  );
}
```

- Mount `<GoogleAnalytics />` once in each site's root `app/layout.tsx`.
- **Search Console verification**: simplest code-side path is the HTML meta-tag method — `metadata.verification.google` in `app/layout.tsx`'s `generateMetadata`/static `metadata` export, sourced from `NEXT_PUBLIC_GSC_VERIFICATION`, empty string by default (Next.js's `Metadata` type supports `verification.google` natively — no custom component needed). DNS-TXT verification is a hosting/DNS-level step, out of scope for code.
- **Open decision, not code**: whether either site needs a cookie-consent gate before GA4 fires depends on target-audience geography (GDPR relevance) — can't resolve until niches (and their likely audience) are known. Flagging so it doesn't get silently skipped once a niche lands.
- All of this is genuinely buildable today — it's inert until real IDs exist, and doesn't need to wait on content-production capability.

---

## 5. Affiliate-link management / cloaking pattern

No real affiliate links, no program enrollment — illustrative/placeholder only, per the guardrail.

**Pattern**: content never embeds a raw destination URL. It references an internal id; a central config resolves that id to a real destination; a redirect route is the single interception point for both cloaking and click tracking.

```ts
// shared kit: lib/affiliate-links.ts — PLACEHOLDER DATA ONLY, not wired to any real program
export const affiliateLinks: Record<string, { destinationUrl: string; network: string; label: string }> = {
  "example-widget-500": {
    destinationUrl: "https://example.com/aff?tag=REPLACE_ME", // never a real program until one exists
    network: "placeholder",
    label: "Example Widget 500",
  },
};
```

```ts
// shared kit: app/go/[slug]/route.ts — Route Handler, the single redirect/tracking chokepoint
import { NextRequest, NextResponse } from "next/server";
import { affiliateLinks } from "@/lib/affiliate-links";

export function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const link = affiliateLinks[params.slug];
  if (!link) return new NextResponse("Not found", { status: 404 });
  // TODO once a real program exists: log the click event here before redirecting
  return NextResponse.redirect(link.destinationUrl, { status: 302 });
}
```

```tsx
// shared kit: components/AffiliateLink.tsx — content uses this, never a raw <a>
export function AffiliateLink({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <a href={`/go/${id}`} rel="sponsored nofollow noopener" target="_blank">
      {children}
    </a>
  );
}
```

Why this shape:

- **Swap without touching content**: a dead/changed link, or a network switch, is a one-line edit in `lib/affiliate-links.ts` — no need to grep through dozens of MDX files.
- **`rel="sponsored nofollow noopener"` is baked into the component by default**, per Google's affiliate-link guidance — not left for content-strategist or a future editor to remember per-link.
- **`/go/<slug>` is the natural place to add click tracking** later (an analytics event, or a DB row once persistence exists) without re-touching content again.
- **Flag for later, not now**: some networks (Amazon Associates is the best-known example) have specific terms about link cloaking/redirects — worth checking against whichever program(s) sales/the founder actually enroll in, since this pattern shouldn't be assumed compliant with every network sight-unseen.

---

## 6. Shared package assessment

**Recommendation: yes, extract a small shared kit — copied at scaffold time, not a live npm/workspace dependency (yet).**

This is the department's own previously-flagged gap (no shared component code across the four fragrance/agency templates) — worth not repeating a third time, but also worth not over-solving for n=2.

**What goes in the kit** (the pieces above, all niche-agnostic infrastructure, none of it visual/branded):

- `content/schema.ts` — the zod frontmatter schema (§1)
- `content/loader.ts` — `getAllContent()` / `getContentBySlug()` (gray-matter + schema validation)
- `lib/jsonld.ts` + `components/JsonLd.tsx` (§3)
- `lib/affiliate-links.ts` shape/schema + `app/go/[slug]/route.ts` + `components/AffiliateLink.tsx` (§5)
- `components/Analytics.tsx` + the GSC-verification metadata pattern (§4)
- The sitemap/robots generator logic (§2)

**What stays per-site, deliberately not shared**: Tailwind theme/visual design, actual content, category/taxonomy (niche-specific), and any per-network affiliate-link quirks. `design-taste-frontend` explicitly wants each site to read as its own thing, not a reskinned clone — a shared *design system* here would work against that; a shared *infrastructure* layer doesn't.

**Why "copied starter kit" over a real workspace/npm package, for now**: this repo has zero monorepo tooling today — every project under `products/web-templates/` is fully self-contained (root `CLAUDE.md`: "nothing installs or builds from the repo root"), and a live shared package would mean introducing npm/pnpm workspaces repo-wide, a bigger structural change than two sites justify. The architecture department already has a proven-in-this-repo model for "don't rewrite shared logic per project": `departments/architecture/lib/cadgen/`, a canonical library multiple projects pull from. The direct equivalent here is a canonical source directory — `departments/web-development/lib/affiliate-site-kit/` — that a scaffolding step copies into each site's own `content/`/`lib`/`components` folders. Each site then owns its copy (free to diverge if a niche genuinely needs it), but neither site starts from a blank sitemap.ts and JSON-LD helper written from scratch.

**Escalation trigger, stated concretely rather than "it depends"**: if a third content/SEO site shows up (another affiliate site, or a client project that wants this same kind of content architecture) — the same pattern that turned three copy-pasted fragrance templates into a real duplication problem — that's the point to graduate this into an actual npm/pnpm workspace package with a single source of truth. Not before.

---

## 7. Where the sites live, and what's scaffoldable today vs. genuinely blocked

**Site location** (this was an open question `departments/content/CLAUDE.md` is explicitly waiting on web-development to resolve): `products/affiliate-sites/<niche-slug>/`, one Next.js project per site, same self-contained-per-project convention as every other `products/web-templates/*` folder. `products/README.md` updated accordingly (see below). Niche slugs should match `departments/content/projects/<site-slug>/` 1:1 so the handoff in §1 is unambiguous — e.g. niche 1 as `carbide-tools`.

**Buildable today, no real content needed** (fixture MDX files are enough to validate against):

- `lib/affiliate-site-kit/` itself — schema, content-loader, JSON-LD helpers, sitemap/robots generator, `AffiliateLink` + `/go/[slug]` route, `Analytics` component. All pure/generic, testable against 1-2 hand-written fixture articles.
- The frontmatter schema specifically should be finalized and shared with whoever's building `content-strategist`'s output *now*, not after — it's the literal coordination contract between the two departments' work, per `departments/content/CLAUDE.md`.
- A base Next.js + Tailwind + shadcn scaffold for niche 1 (carbide-tipped tools) — but per this department's own design-before-code convention, the `design` skill pass should happen first, and ideally after the content-strategist's output shape is known (a comparison post needs a spec-table layout; a review needs a verdict/rating block — those UI needs come from knowing what content types actually look like, not before).

**Genuinely blocked**:

- Any real article content, obviously.
- Closing the loop on whether `content-strategist`'s actual drafts parse against the schema above — fixtures I write myself aren't a substitute for a real handoff.
- Niche 2's entire site: unknown niche means unknown category/taxonomy, unknown affiliate network(s), and no design direction — this isn't just "waiting on content," it's waiting on `sales-strategist`'s research finishing first.
- Real category/taxonomy structure even for niche 1 — that's a content-architecture output (pillar pages, comparison clusters) that `content-strategist`'s content-plan.md produces, not something web-development should invent ahead of it.
- Deploy/hosting/domain: no Vercel or DNS connector configured for this yet (per the department's standing "don't claim a connector is live" convention) — separate from and downstream of everything above.

---

## Action taken alongside this plan

`products/README.md` updated with an `affiliate-sites/` line (see diff) so `departments/content/CLAUDE.md`'s pending step — "register the underlying product... once web-development confirms where the sites live under `products/`" — is unblocked. Registering the specific sites in `shared/clients.md` is left for whoever owns that call once niche 2 is confirmed (this doc only resolves the *location convention*, not which entities exist yet).
