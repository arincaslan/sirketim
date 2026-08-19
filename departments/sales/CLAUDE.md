# Sales

Two revenue lines:
1. **Service sales** — pipeline, proposals, and outreach for web/architecture/advertising client work.
2. **Product sales** — packaging output from other departments into standalone digital/physical products and selling them on marketplaces, at near-zero marginal cost, independent of any client relationship.

## Service sales — pipeline stages

Lead -> Qualified -> Proposal sent -> Negotiation -> Won / Lost

Track active deals in `pipeline/`; one file per deal is fine at this scale.

## Product sales — marketplace strategy

Goal: turn departments' own capabilities into sellable products with ~zero marginal cost per unit — no inventory, no per-sale production labor beyond the first one.

**Recommended product lines**, in priority order (build the first before starting the second):

1. **Web templates** (from web-development's stack) — generic, non-client-specific Next.js/Tailwind site templates (portfolio, small-business, landing-page starters) sold as digital downloads. One build, unlimited sales.
2. **Architecture digital plan packs** (from architecture's DXF/SVG pipeline) — generic floor plans (not tied to any real client's deed/lot) for common builds (tiny house, ADU, small office) sold as digital downloads. Real, proven demand category on Etsy.
3. **Architecture print-on-demand art** (from architecture's 3D render pipeline) — blueprint-style or minimalist line-art posters of generated floor plans/massing, fulfilled by a POD service (Printful/Printify) so there's zero inventory and no upfront cost; the POD provider prints and ships per order.

**Marketplace fit**:
- **Etsy** — primary. Handles both digital downloads (templates, plan packs) and POD listings in one place; strong organic search for "house plans" and "printable floor plan" and template categories.
- **Gumroad** — secondary, for web templates specifically; no marketplace discovery but zero fees to list and simple checkout, good for driving your own traffic (e.g. from Sirketim's own site/socials).
- **ThemeForest / Creative Market** — worth it once there are 3+ polished web templates; built-in buyer traffic for templates specifically.
- **Amazon** — treat as stretch goal (Merch on Demand and KDP have approval gates and are slower to break into); not a first move.
- **eBay** — deprioritized; poor fit for digital goods and POD compared to Etsy.

**Near-zero-cost discipline**: no paid ads to launch a product — rely on marketplace SEO (title/tags/keyword research) and organic listing quality first. Once a product has proven sales, the `advertising` department can run a small paid-promotion test funded by that product's own revenue, not upfront spend.

**Recommended connectors (not yet configured)**: Etsy API (listing management), Printful or Printify API (POD fulfillment), Gumroad API.

## Conventions

- Proposals live in `proposals/<client-slug>.md` (or exported PDF alongside), generated via the `client-proposal` skill.
- Products live in `../../products/<line>/<product-slug>/`, with listing copy generated via the `product-listing` skill.
- Register every lead/client in `../../shared/clients.md` as soon as they're qualified.
- Use the `sales-strategist` subagent for this department's work.
