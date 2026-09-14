import type { Producer } from "@/lib/types";

/**
 * GENERATED FILE — do not edit by hand.
 *
 * Producers who actually hold an account with us, written by the export step of
 * the producer console alongside producer-listings.generated.ts and
 * producer-links.generated.ts. Empty until the console exists and someone has
 * enrolled.
 *
 * WHY SUBSCRIBERS LIVE IN THEIR OWN FILE RATHER THAN IN lib/producers.ts.
 * That file is a registry of companies whose products we list through an
 * affiliate relationship - Dossier, ALT. Fragrances, Lattafa and eighteen
 * others - and **not one of them has signed up, subscribed, or submitted
 * anything**. Its own header says so. If a subscriber were appended to that
 * same array, the only thing separating "a real company we list" from "a real
 * company that pays us" would be whoever last edited the file, and the two
 * carry completely different disclosure obligations: a subscriber's listing
 * needs to be identifiable as one, and a listed company's must never be
 * presented as a commercial relationship it has not entered.
 *
 * Keeping them in separate files makes enrollment DERIVED rather than typed,
 * which is the same rule lib/merchants.ts already follows for the retailer
 * disclosure band: a merchant appears there only while one of its links
 * actually resolves, because a hand-typed list drifts in the direction that
 * flatters us. Nobody can mark a company a subscriber by editing a boolean;
 * they would have to fabricate an export.
 *
 * A SLUG HERE MUST NOT COLLIDE WITH A LISTED PRODUCER. Guarded at module load
 * in lib/producers.ts. Without that check an exported listing claiming
 * `producerSlug: "dossier"` would render under a real company's name and blurb,
 * asserting that Dossier had enrolled - which is the exact misrepresentation
 * the two-file split exists to prevent, arriving through the back door.
 */
export const SUBSCRIBER_PRODUCERS: Producer[] = [];
