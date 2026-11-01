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
