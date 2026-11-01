import { LegalPage, legalMetadata } from "@/components/legal/legal-page";
import { CONTACT_EMAIL, DATA_CONTROLLER, PRODUCER_CONSOLE } from "@/lib/site";

/**
 * Privacy policy - English. Turkish counterpart: app/tr/gizlilik/page.tsx,
 * which doubles as the KVKK aydınlatma metni. CHANGE BOTH IN ONE COMMIT and
 * keep UPDATED equal; LEGAL-COMPLIANCE.md lists every fact each one rests on.
 *
 * REWRITTEN 2026-11-01. The previous version (2026-08-27) was accurate for a
 * site with no accounts, and three of its statements had stopped being true:
 * it said there were no user accounts (the producer console on
 * producers.counterscent.com has had them since 2026-09-16), it said fonts were
 * fetched from Google's servers (next/font self-hosts them at build time, so a
 * visitor's browser never contacts Google for them), and it said analytics ran
 * without asking (GA4 is now opt-in behind the consent banner).
 *
 * EVERY STATEMENT HERE IS A CLAIM ABOUT CODE OR CONFIGURATION. Before changing
 * a sentence, check the thing it describes; before changing the thing, change
 * the sentence. NOT REVIEWED BY A LAWYER - see LEGAL-COMPLIANCE.md for the
 * open items (KVKK Article 9 transfer safeguards above all).
 */
export const metadata = legalMetadata({
  lang: "en",
  title: "Privacy Policy",
  description:
    "What Counterscent collects, why, on what legal basis, who processes it, how long it is kept, and how to exercise your rights under KVKK and the GDPR.",
  en: "/privacy/",
  tr: "/tr/gizlilik/",
});

const UPDATED = "1 November 2026";

export default function PrivacyPage() {
  return (
    <LegalPage lang="en" title="Privacy policy" updated={UPDATED} counterpart="/tr/gizlilik/">
      <h2>1. Who is responsible</h2>
      <p>
        The data controller for counterscent.com and producers.counterscent.com, and for the
        processing described here, is <strong>{DATA_CONTROLLER}</strong> (&ldquo;we&rdquo;),
        established in Türkiye, under Türkiye&apos;s Law No. 6698 on the Protection of Personal
        Data (&ldquo;KVKK&rdquo;) and, where it applies to you, the EU General Data Protection
        Regulation (&ldquo;GDPR&rdquo;).
      </p>
      <p>
        Contact for anything in this policy: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        Our postal address is available on request at the same address.
      </p>

      <h2>2. The short version</h2>
      <ul>
        <li>
          Reading the catalogue needs no account. We measure visits only if you allow it, and the
          measurement stores nothing on your device.
        </li>
        <li>
          Producer accounts (businesses listing their fragrances) hold an email address, an optional
          name, the company&apos;s details and its listings.
        </li>
        <li>
          We do not sell personal data, we do not run advertising or retargeting pixels, and we send
          no marketing email.
        </li>
        <li>You can delete a producer account yourself, and you can ask us about any data we hold.</li>
      </ul>

      <h2>3. Visitors to the catalogue (counterscent.com)</h2>
      <p>
        <strong>Analytics, only with your consent.</strong> If you choose &ldquo;Allow
        analytics&rdquo;, your browser loads Google Analytics 4. It records the page you viewed, the
        site you came from, your browser and device type, and your approximate region. It is
        configured to set no cookie and keep no identifier on your device, and IP addresses are
        truncated before storage. If you decline, or have not chosen, the script is never loaded and
        nothing is measured. A browser sending Global Privacy Control is treated as having declined.
        You can change your choice at any time with &ldquo;Cookie settings&rdquo; at the bottom of
        every page. Legal basis: your explicit consent (KVKK Article 5(1); GDPR Article 6(1)(a)).
      </p>
      <p>
        <strong>Delivering the site.</strong> Our hosting provider, Cloudflare, processes your IP
        address, browser details and the address you requested in order to deliver pages and protect
        the site from abuse, and may give us aggregate traffic statistics that identify nobody. Legal
        basis: our legitimate interest in running a secure website (KVKK Article 5(2)(f); GDPR
        Article 6(1)(f)).
      </p>
      <p>
        <strong>Stored on your own device.</strong> Two entries in your browser&apos;s local storage:
        your light/dark theme choice and your analytics choice. Neither is sent to us. See the{" "}
        <a href="/cookies/">cookie policy</a>.
      </p>
      <p>
        <strong>Typefaces are served by us.</strong> The fonts are bundled with the site when it is
        built; loading a page makes no request to Google Fonts.
      </p>
      <p>
        <strong>Affiliate links.</strong> Some &ldquo;buy&rdquo; links are affiliate links (see our{" "}
        <a href="/disclosure/">affiliate disclosure</a>). When you follow one, you pass through an
        affiliate network (Awin or CJ) to the retailer, and they may set their own cookies to credit
        the referral, under their own privacy policies. We never receive your name, order or payment
        details from them; we receive commission reports that do not identify you.
      </p>
      <p>
        <strong>If you email us.</strong> We use your address and message to answer you, and keep the
        correspondence for as long as needed to deal with it and any follow-up, normally no longer
        than two years. Legal basis: our legitimate interest in answering (KVKK Article 5(2)(f)), or
        contract where you are a producer.
      </p>

      <h2>4. Producer accounts (producers.counterscent.com)</h2>
      <p>
        The producer console is for businesses that list fragrances they make or sell. Account holders
        must be at least 18 and authorised to act for the business.
      </p>
      <ul>
        <li>
          <strong>Account:</strong> your email address and, if you sign in with Google, the name on
          your Google account and Google&apos;s identifier for it. We store no Google password or
          access token.
        </li>
        <li>
          <strong>Sign-in:</strong> single-use sign-in links (stored only as a hash, valid for 15
          minutes) and a session cookie that keeps you signed in for up to 30 days or until you sign
          out.
        </li>
        <li>
          <strong>Your company and listings:</strong> the company name and contact email you give us,
          everything you submit for a listing (product details, store link, photograph), and its
          review status.
        </li>
        <li>
          <strong>The record of changes:</strong> who submitted, changed, withdrew or reviewed a
          listing or changed a sign-in method, and when. Account entries can include the email address
          used at the time.
        </li>
        <li>
          <strong>Abuse protection:</strong> to stop sign-in and mail abuse we count requests per
          network address. The address is stored only as a one-way hash, and the counters are deleted
          automatically within 48 hours.
        </li>
        <li>
          <strong>Clicks on listings:</strong> we count clicks on each listing&apos;s buy link, with
          the page they came from. These records identify no visitor.
        </li>
      </ul>
      <p>
        Legal bases: performing the contract you enter by opening an account (KVKK Article 5(2)(c);
        GDPR Article 6(1)(b)); keeping commercial records we are legally required to keep (KVKK
        Article 5(2)(ç); GDPR Article 6(1)(c)); establishing, exercising or defending legal claims
        (KVKK Article 5(2)(e)); and our legitimate interest in security and fraud prevention (KVKK
        Article 5(2)(f); GDPR Article 6(1)(f)).
      </p>
      <p>
        <strong>Email.</strong> The only emails the console sends are the sign-in links you ask for.
        They are transactional, so they carry no unsubscribe link: if you stop requesting them, they
        stop. We send no newsletter or marketing email. If that ever changes, it will be opt-in only,
        with an unsubscribe link in every message, as Turkish Law No. 6563 requires. Our email
        provider keeps a copy of each sign-in email in our mailbox; we clear these copies regularly
        and use them for nothing else.
      </p>
      <p>
        <strong>Automated checks.</strong> Some checks on a submission run automatically, for example
        detecting a note pyramid copied from the original. They can reject or flag a submission, but
        every approval is made by a person, and you may ask for a person to review any automated
        result.
      </p>
      <p>
        <strong>Payments.</strong> Paid plans are not open yet. When they open, payments will be taken
        by a merchant of record, which processes your payment details under its own privacy policy;
        we will not see your card details.
      </p>

      <h2>5. Who processes data for us</h2>
      <ul>
        <li>
          <strong>Cloudflare, Inc.</strong> (United States, global network): hosting and delivery of
          both sites, security.
        </li>
        <li>
          <strong>Google LLC</strong> (United States): Google Analytics 4, only with your consent;
          Google sign-in, only if you choose it.
        </li>
        <li>
          <strong>Neon</strong> (database and file storage in the United States): producer accounts,
          listings, photographs and records.
        </li>
        <li>
          <strong>Hostinger</strong>: sending sign-in emails and our business mailbox.
        </li>
        <li>
          <strong>Awin and CJ</strong>: affiliate networks, for the links described in section 3.
        </li>
      </ul>
      <p>
        These providers are outside Türkiye, so using them transfers personal data abroad. Under
        KVKK Article 9 these transfers rest on the standard contracts published by the Turkish
        Personal Data Protection Board, which we are signing with each provider and notifying to the
        Authority. Analytics data is, in addition, only collected if you allow it. For visitors in
        the EEA, the providers rely on the European Commission&apos;s standard contractual clauses or
        the EU-US Data Privacy Framework.
      </p>

      <h2>6. How long we keep data</h2>
      <ul>
        <li>Sign-in links: 15 minutes. Sessions: up to 30 days, or until you sign out.</li>
        <li>Abuse-protection counters: deleted automatically within 48 hours.</li>
        <li>
          Account details: until you delete the account. Deletion removes your email address, name,
          sessions, sign-in links and linked sign-in methods immediately.
        </li>
        <li>
          Listings and the record of changes: kept after a listing is withdrawn or an account is
          deleted, for as long as needed to establish, exercise or defend legal claims and to meet
          commercial record-keeping duties, and for no more than ten years. A withdrawn listing is no
          longer published.
        </li>
        <li>Analytics: the shortest retention period Google Analytics offers.</li>
        <li>Emails to us: normally no longer than two years after the last message.</li>
      </ul>

      <h2>7. Children</h2>
      <p>
        Counterscent is meant for adults. Producer accounts are for people aged 18 or over acting for
        a business. We do not knowingly collect personal data from anyone under 18; if you are under
        16, please do not allow analytics. If you believe a child has given us personal data, write to
        us and we will delete it.
      </p>

      <h2>8. Your rights</h2>
      <p>
        Under KVKK Article 11 you may ask whether we process your personal data and for information
        about it, its purpose and who receives it, in Türkiye or abroad; ask us to correct it, or to
        delete or destroy it; ask us to tell recipients about a correction or deletion; object to a
        result reached solely by automated analysis that is against you; and claim compensation for
        damage caused by unlawful processing. Under the GDPR you also have rights of access,
        rectification, erasure, restriction, portability and objection, and you may withdraw consent
        at any time without affecting earlier processing.
      </p>
      <p>
        <strong>How to apply.</strong> Producers can delete their account themselves from{" "}
        <a href={`${PRODUCER_CONSOLE}/console/delete`}>the console</a>. For anything else, write to{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>, from the address on your account if
        you have one, saying what you are asking for. We answer free of charge within 30 days.
      </p>
      <p>
        You may also complain to the Turkish Personal Data Protection Authority (Kişisel Verileri
        Koruma Kurumu, kvkk.gov.tr) or, in the EEA, to your local data protection authority.
      </p>

      <h2>9. Security</h2>
      <p>
        Both sites are served only over HTTPS. There are no passwords to leak: sign-in uses
        single-use links or Google. Sign-in links and network addresses are stored only as hashes,
        and access to the database is limited to the people who run the service.
      </p>

      <h2>10. Changes and language</h2>
      <p>
        We update this policy in the same change as anything it describes, and the date at the top
        shows the version in force. Producers are told about material changes before they apply. This
        policy is also published in{" "}
        <a href="/tr/gizlilik/" hrefLang="tr">
          Turkish
        </a>
        ; for KVKK purposes and for people in Türkiye the Turkish text prevails, otherwise the
        English text does.
      </p>
    </LegalPage>
  );
}
