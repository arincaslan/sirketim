/**
 * The visitor's analytics choice, kept in their own browser.
 *
 * WHY THIS EXISTS (2026-11-01, founder decision). Until today the site loaded
 * GA4 for everyone, cookieless (`client_storage: 'none'`), and argued that no
 * banner was needed because nothing was written to the device. That argument
 * covers the ePrivacy/KVKK cookie rule, but not the data itself: every GA4 hit
 * still sends page, device and network details to Google, which processes them
 * in the United States. The founder asked for a consent banner, and opt-in is
 * the defensible reading for an analytics transfer abroad under KVKK Art. 9 and
 * GDPR alike. So GA4 now loads ONLY after an explicit "allow".
 *
 * GA4 stays cookieless even after consent. Consent covers the measurement, not
 * a licence to store more than we need.
 *
 * WHAT IS STORED, AND WHY THAT IS NOT ITSELF A CONSENT PROBLEM: one
 * localStorage entry recording the answer. Remembering a refusal is strictly
 * necessary to honour it - without it the banner would reappear on every page.
 * Nothing about the visitor is sent anywhere by this module.
 *
 * Every read and write is wrapped: storage can be blocked (private windows,
 * strict browser settings), and a thrown SecurityError must never break the
 * page. Blocked storage simply means "no answer yet", which loads nothing.
 */

export type ConsentChoice = "granted" | "denied";

interface StoredConsent {
  v: 1;
  analytics: ConsentChoice;
  /** ISO timestamp of the decision, so a later change of policy can re-ask. */
  at: string;
}

export const CONSENT_STORAGE_KEY = "counterscent-consent";

/** Fired on window when the visitor makes or changes a choice. */
export const CONSENT_CHANGE_EVENT = "counterscent:consent-change";

/** Fired on window by the footer's "Cookie settings" control. */
export const CONSENT_OPEN_EVENT = "counterscent:consent-open";

export function readConsent(): ConsentChoice | null {
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredConsent>;
    if (parsed?.v !== 1) return null;
    return parsed.analytics === "granted" || parsed.analytics === "denied" ? parsed.analytics : null;
  } catch {
    return null;
  }
}

export function writeConsent(choice: ConsentChoice): void {
  const value: StoredConsent = { v: 1, analytics: choice, at: new Date().toISOString() };
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Storage blocked: the choice still applies for this page view via the
    // event below, it just will not be remembered.
  }
  window.dispatchEvent(new CustomEvent<ConsentChoice>(CONSENT_CHANGE_EVENT, { detail: choice }));
}

/**
 * Global Privacy Control. A browser that sends it has already said no on the
 * visitor's behalf, so we treat it as a refusal and do not nag with a banner.
 * The visitor can still opt in from "Cookie settings".
 */
export function browserSignalsOptOut(): boolean {
  try {
    return (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
  } catch {
    return false;
  }
}

/** The choice to act on: a stored answer wins; otherwise GPC means denied. */
export function effectiveConsent(): ConsentChoice | null {
  const stored = readConsent();
  if (stored) return stored;
  return browserSignalsOptOut() ? "denied" : null;
}
