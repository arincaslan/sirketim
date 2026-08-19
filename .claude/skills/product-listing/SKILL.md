---
name: product-listing
description: Turn a finished Sirketim product (web template, architecture plan pack, or POD print) into marketplace-ready listing copy for Etsy/Gumroad/etc. Use once a product in products/ is ready to sell.
---

# Product Listing

Produces `products/<line>/<product-slug>/listing.md`, per `departments/sales/CLAUDE.md`'s marketplace strategy.

## Steps

1. **Confirm the product is actually ready** — the sellable files exist in `products/<line>/<product-slug>/` (template code, plan files, or print-ready art). Don't write a listing for something that doesn't exist yet.
2. **Keyword research**. Use WebSearch to check what similar listings on the target marketplace (Etsy primarily) use for titles/tags, and roughly where they're priced. This is real research, not guessing — cite what you found.
3. **Draft the listing** (`listing.md`), per target marketplace: title, description, tags/keywords, price, and category. Follow each marketplace's conventions (e.g. Etsy's 13-tag limit, title-frontloading for search).
4. **Pricing**: since production cost is ~zero (digital) or fulfillment-only (POD via Printful/Printify), price against comparable listings and perceived value, not cost-plus.
5. **Report back**: the listing draft and, since no marketplace connector is configured yet, what's needed to actually publish it (Etsy shop + API key, or manual upload).

## Notes

- Don't fabricate sales data, reviews, or "bestseller" claims in the listing copy.
- If this is the first product in a line (web templates, digital plans, or prints), flag that there's no track record yet — price conservatively and plan to adjust after real sales data comes in.
