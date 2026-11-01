import { LEGAL_ENTITY } from "../generated/legal";

/**
 * The company that operates Counterscent, exactly as registered, and where its
 * policies live.
 *
 * LEGAL_ENTITY IS GENERATED from the catalogue's lib/site.ts (src/generated/
 * legal.ts, `npm run generate`), never retyped here: the terms, the privacy
 * notice, the refund policy, this origin's footer and the sign-in email all
 * name the contracting party, and two spellings of a company name across one
 * agreement is an ambiguity about who the producer contracted with. Founder
 * decision 2026-11-01; it replaced "Sirketim A.S.", a trading name that is not
 * the registered entity on our CJ account. The registered address is not
 * published yet - see LEGAL-COMPLIANCE.md in the catalogue.
 */
export { LEGAL_ENTITY };

/** Where the privacy notice lives, in each language. On the catalogue, which
 *  is the one canonical copy of each policy. */
export const PRIVACY_URL = "https://counterscent.com/privacy/";
export const PRIVACY_URL_TR = "https://counterscent.com/tr/gizlilik/";

/**
 * THE VERSION OF THE POLICIES A PRODUCER ACCEPTS, 2026-11-01.
 *
 * Founder instruction the same day: the policies must be put in front of
 * anyone signing up, and they must read and accept them. routes/accept.ts
 * records an acceptance against THIS string, and the router sends any signed-in
 * account without an acceptance of this exact version to /console/accept
 * before it can use the console. So bumping it makes every producer accept
 * again on their next visit - do that when the terms or the privacy notice
 * change materially, in the same commit as the change, and not otherwise.
 *
 * It is the date the catalogue's policy pages carry as UPDATED.
 */
export const POLICY_VERSION = "2026-11-01";

/** Every policy, in both languages, for the screens that put them in front
 *  of a producer. One list, so the sign-in panel and the acceptance screen
 *  cannot link to different documents. */
export const POLICY_LINKS = {
  hub: "https://counterscent.com/legal/",
  terms: { en: "https://counterscent.com/terms/", tr: "https://counterscent.com/tr/kullanim-kosullari/" },
  privacy: { en: PRIVACY_URL, tr: PRIVACY_URL_TR },
  cookies: { en: "https://counterscent.com/cookies/", tr: "https://counterscent.com/tr/cerez-politikasi/" },
  refunds: { en: "/refunds", tr: "/refunds#tr" },
} as const;
