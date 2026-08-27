# parfumoza.com — DNS record backup

**Captured 2026-08-27 from the Hostinger API** (`GET /api/dns/v1/zones/parfumoza.com`), immediately before migrating nameservers to Cloudflare.

This exists because moving nameservers is the one step in the Parfumoza launch that can break something already working: `contact@parfumoza.com` is live and receiving. Cloudflare auto-scans and imports existing records when a site is added, but the scan **can miss records with very low TTLs** — and the apex `A` here has a TTL of **50 seconds**. Verify against this list rather than trusting the import.

No secrets here; DNS records are public by nature.

## The records (10 groups — 9 of them are email)

| Type | Name | Content | TTL | Purpose |
|---|---|---|---|---|
| `MX` | `@` | `5 mx1.hostinger.com.` | 14400 | **Mail delivery** |
| `MX` | `@` | `10 mx2.hostinger.com.` | 14400 | **Mail delivery** |
| `TXT` | `@` | `"v=spf1 include:_spf.mail.hostinger.com ~all"` | 3600 | SPF |
| `TXT` | `_dmarc` | `"v=DMARC1; p=none"` | 3600 | DMARC |
| `CNAME` | `hostingermail-a._domainkey` | `hostingermail-a.dkim.mail.hostinger.com.` | 300 | DKIM |
| `CNAME` | `hostingermail-b._domainkey` | `hostingermail-b.dkim.mail.hostinger.com.` | 300 | DKIM |
| `CNAME` | `hostingermail-c._domainkey` | `hostingermail-c.dkim.mail.hostinger.com.` | 300 | DKIM |
| `CNAME` | `autodiscover` | `autodiscover.mail.hostinger.com.` | 300 | Mail client autoconfig |
| `CNAME` | `autoconfig` | `autoconfig.mail.hostinger.com.` | 300 | Mail client autoconfig |
| `A` | `@` | `2.57.91.91` | **50** | Hostinger **parked page** — this is the one being replaced |
| `CNAME` | `www` | `parfumoza.com.` | 300 | Points www at the apex |

## What changes and what must not

**Replaced by the migration:** the apex `A` (parked page) and `www`. Cloudflare creates its own records for these when the Worker's Custom Domain is added — do not hand-create them first, since an existing CNAME on the hostname *blocks* Custom Domain creation.

**Must survive unchanged:** all nine email records above. Two failure modes to watch:

1. **Proxy status.** `MX`, DKIM `CNAME`s, SPF/DMARC `TXT`s must be **DNS-only (grey cloud)**, never proxied (orange cloud). Proxying an MX record breaks mail delivery immediately. Cloudflare sets TXT/MX correctly by default, but DKIM records are `CNAME`s and **CNAMEs default to proxied** — these three are the most likely thing to go wrong.
2. **Missed by the scan.** Low-TTL records can be skipped during the import scan. Check all nine are present before switching nameservers, not after.

## Safe order of operations

1. Add `parfumoza.com` to Cloudflare (**Add a site**). It scans and imports.
2. **Verify all nine email records against the table above, and set the three DKIM CNAMEs to DNS-only.** Do this *before* step 3 — while Hostinger is still authoritative, mistakes cost nothing.
3. Change the nameservers at Hostinger to the pair Cloudflare gives you.
4. Wait for the zone to go active (usually minutes, can be up to 24h).
5. Add the Custom Domain to the `parfumoza` Worker — Cloudflare writes the apex and `www` records and issues the certificate.
6. Confirm mail still flows: `dig MX parfumoza.com` should still return `mx1`/`mx2.hostinger.com`, and send a real test message to `contact@parfumoza.com`.

## Rollback

Point the nameservers back at Hostinger's. The zone above is still stored at Hostinger and becomes authoritative again once propagation completes — which is why this migration is reversible, but slow to reverse.
