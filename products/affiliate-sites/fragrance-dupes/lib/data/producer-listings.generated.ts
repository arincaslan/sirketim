/**
 * GENERATED FILE — do not edit by hand.
 *
 * Approved PRODUCER listings, written by the export step of the producer
 * console. Empty until that console exists and a producer has been approved —
 * see HANDOFF.md, "The producer subscription programme", build steps 6 and 8.
 *
 * WHY IT EXISTS ALREADY, EMPTY. This is the ONLY route a producer's listing has
 * into the Dupe Finder. `lib/data/producer-links.generated.ts` was wired on
 * 2026-09-14 and carries the outbound buy link, but a link is not a listing: it
 * resolves at the edge and lands the reader on the producer's store, while the
 * comparison card they were supposed to click never renders anywhere. Both files
 * have to be written by the same export, or an approved producer sees nothing
 * change on the site.
 *
 * WHAT THESE APPEAR AS. A DupeCandidate here is indistinguishable from one of the
 * 79 hand-authored listings in lib/dupes-data.ts: same card, same ranking, same
 * formula, in the Dupe Finder and on /fragrance/<reference>/ alike. That is the
 * product being sold and it is also the reason every gate below is not optional —
 * a paying subscriber's row ships into the same surface our editorial data does.
 *
 * SLUG NAMESPACE, AND WHY IT IS NOT ADVISORY. `slug` here must be
 * `producer-<producerSlug>-<listingSlug>`, matching producerLinkId(). Listing
 * slugs are unique only PER PRODUCER (@@unique([producerId, slug]) in
 * prisma/schema.prisma), so two producers can both sell a "noir", and either
 * could collide with a hand-authored listing. A collision is silent and reads
 * three ways, all bad: getDupe() returns whichever came first, the content
 * embed in components/content/embedded-comparison.tsx renders the wrong product,
 * and DUPE_IMAGES[slug] attaches a LICENSED MERCHANT PHOTOGRAPH to a producer's
 * bottle — imagery whose licence rides on an affiliate relationship that
 * producer has no part in. The guard in lib/dupes-data.ts fails the build
 * instead. This repo already lost 91 affiliate links to a shared key prefix; the
 * lesson cost enough to apply twice.
 *
 * WHAT THE EXPORTER MUST HAVE SETTLED BEFORE WRITING A ROW HERE:
 *
 * - `facets` are OURS, derived from the producer's declared notes,
 *   concentration and difference prose. Never taken from the submission. The six
 *   sliders were removed from the form on 2026-09-11 for exactly this reason:
 *   isVerbatimCopy() cross-references notes AGAINST facets, so a producer who
 *   supplies both defeats the copy gate by construction and can reach the cap on
 *   their own reference at will.
 * - `referenceSlug` must name a reference we already researched. The score is
 *   computed against that pyramid, so a producer naming an original we do not
 *   hold cannot be published until we research it — that is our work, not
 *   theirs, and never a placeholder reference.
 * - `pyramidSource` is unresolved policy, not a field to fill in casually. A
 *   producer filling three tier fields reads as "declared", which escapes the
 *   -10 penalty that 47 of our 79 merchant listings carry — a paying subscriber
 *   would start up to 10 points ahead for reasons unrelated to the fragrance.
 *   See HANDOFF.md, "Also flagged, not yet done".
 * - `imageUrl` must stay unset. It is merged from dupe-images.generated.ts for
 *   merchant listings only, and producer image upload is on the do-not-build
 *   list (needs object storage, a rights declaration and a commit path).
 * - `offers` records where the product can actually be bought, which is how a
 *   listing's existence stays checkable by someone who does not take our word
 *   for it. This array was once emptied because it held product names that did
 *   not exist, attributed to real companies.
 *
 * Every row must also have passed validateProducerLink() at export time, not
 * only at submit time — see lib/producer-link.ts for why the blast radius of one
 * bad row is the entire site's deploy.
 */

import type { DupeCandidate } from "@/lib/types";

export const PRODUCER_LISTINGS: DupeCandidate[] = [];
