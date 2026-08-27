# counterscent.com — DNS zone and migration playbook

**Captured 2026-08-27 by querying Google's resolver directly**, with `counterscent.com` still on Hostinger's nameservers (`solar.dns-parking.com`, `lunar.dns-parking.com`) and before any migration to Cloudflare.

This replaces the equivalent doc for the previous domain, which was abandoned the day it was bought over a brand collision — see `products/affiliate-sites/fragrance-dupes/CLAUDE.md`. **The playbook below is the one that already worked once**, on a live mailbox, without losing a message. It is reused rather than re-derived.

Why it exists: moving nameservers is the one step here that can break something already working. `contact@counterscent.com` is provisioned and the mail records are live. Cloudflare auto-scans and imports existing records when a site is added, but **the scan can miss low-TTL records**, and it sets defaults that are wrong for DKIM.

No secrets here; DNS records are public by nature.

## The zone as it stands

| Type | Name | Content | Purpose |
|---|---|---|---|
| `MX` | `@` | `5 mx1.hostinger.com.` | **Mail delivery** |
| `MX` | `@` | `10 mx2.hostinger.com.` | **Mail delivery** |
| `TXT` | `@` | SPF (`v=spf1 include:_spf.mail.hostinger.com ~all`) | SPF |
| `TXT` | `_dmarc` | DMARC (`v=DMARC1; p=none`) | DMARC |
| `CNAME` | `hostingermail-a._domainkey` | `hostingermail-a.dkim.mail.hostinger.com.` | DKIM |
| `CNAME` | `hostingermail-b._domainkey` | `hostingermail-b.dkim.mail.hostinger.com.` | DKIM |
| `CNAME` | `hostingermail-c._domainkey` | `hostingermail-c.dkim.mail.hostinger.com.` | DKIM |
| `A` | `@` | `2.57.91.91` | Hostinger **parked page** — the one being replaced |
| `CNAME` | `www` | `counterscent.com.` | Points www at the apex |

All three DKIM CNAMEs and both MX records were confirmed live against `8.8.8.8` at capture time. Hostinger also normally creates `autodiscover` and `autoconfig` CNAMEs for mail-client autoconfiguration; keep them if the Cloudflare scan imports them.

## What must survive, and the two ways it breaks

**Replaced by the migration:** the apex `A` (parked page) and `www`. Cloudflare creates its own records for these when the Worker's Custom Domain is added — **do not hand-create them first**, because an existing CNAME on the hostname *blocks* Custom Domain creation. That happened on the previous domain and cost a debugging cycle.

**Must survive unchanged:** every mail record above.

1. **Proxy status is the likeliest failure.** `MX`, DKIM `CNAME`s and SPF/DMARC `TXT`s must all be **DNS-only (grey cloud)**, never proxied (orange cloud). Proxying an MX record breaks delivery immediately, and **proxied DKIM CNAMEs break signing**. Cloudflare handles TXT/MX correctly by default, but **CNAMEs default to proxied**, so the three DKIM records are the specific thing to check. On the previous migration all five CNAMEs came through as *Proxied* and had to be switched — caught only because the founder screenshotted the dashboard. **A DNS query cannot tell you this while the zone is still pending**, so check the dashboard, not `dig`.
2. **Missed by the scan.** Verify every mail record is present *before* switching nameservers, while Hostinger is still authoritative and mistakes cost nothing.

## Order of operations

1. Add `counterscent.com` to Cloudflare (**Add a site**). It scans and imports.
2. **Verify all mail records against the table above, and set the three DKIM CNAMEs to DNS-only.** Do this *before* step 3.
3. **Delete the imported apex `A` (`2.57.91.91`) and the `www` CNAME** — the two parked-page records. Leaving them blocks Custom Domain creation.
4. Change the nameservers at Hostinger to the pair Cloudflare gives you.
5. Wait for the zone to go active (usually minutes; Cloudflare says up to 24h).
6. Deploy, then add `counterscent.com` as a **Custom Domain on the `counterscent` Worker**. Cloudflare writes the apex and `www` records and issues the certificate. Note the Worker was renamed from the old project name, so **deploying creates a new Worker** — attach the domain to that one, confirm it serves, then delete the old Worker.
7. Confirm mail still flows: `nslookup -type=MX counterscent.com` should still return `mx1`/`mx2.hostinger.com`, and send a real test message to `contact@counterscent.com`.

## Expect a false "the site is down" report

The apex currently resolves to **`2.57.91.91`** — the same Hostinger parked-page IP as the previous domain, which returns a real HTTP 200 carrying `<title>Parked Domain name on Hostinger DNS system</title>`. The founder's OpenWrt router at `192.168.1.1` cached that record for the old domain and re-served it for hours after the migration, producing three separate "the site is down" reports for a site that was live worldwide each time.

**It will very likely happen again on this domain.** The tell: `www` resolves correctly through the same router while the apex does not. Before concluding anything:

```bash
curl -s -o /dev/null -w "%{http_code} %{remote_ip}\n" https://counterscent.com/   # what you get
nslookup counterscent.com 1.1.1.1                     # public resolver
nslookup counterscent.com <cloudflare-ns>             # authoritative
```

If the authoritative and public answers are Cloudflare IPs and only the local one differs, the site is fine — say so and point at the router (`/etc/init.d/dnsmasq restart`, or reboot). `Clear-DnsClientCache` does **not** help, because the router re-serves it.

## Rollback

Point the nameservers back at Hostinger's. The zone is still stored there and becomes authoritative again once propagation completes — which is why this migration is reversible, but slow to reverse.

## The abandoned domain

`parfumoza.com` was shut down at Hostinger on 2026-08-27 with auto-renew disabled, so it lapses rather than renewing. **It is not being kept as a redirect**, so there is no ongoing DNS to maintain for it and no second zone in Cloudflare. Nothing was indexed under it and no affiliate application named it, so there is no link equity to preserve. Its cost is recorded in `departments/accounting/ledger.md`.
