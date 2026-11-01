import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL, PRODUCER_CONSOLE } from "@/lib/site";

/**
 * EVERY POLICY ON ONE PAGE, IN BOTH LANGUAGES - 2026-11-01.
 *
 * Founder instruction: "bunlar sitede rahatça bulunabilsin". The policies were
 * reachable from the footer already, but as eleven separate links across two
 * columns, and a reader looking for "the KVKK notice" or "the refund rules" had
 * to guess which. This is the one address that answers "where are your
 * policies", linked first in the footer, from the consent banner's policy, and
 * from the producer console's sign-in page and acceptance screen.
 *
 * IT HOLDS NO POLICY TEXT OF ITS OWN, only a one-line summary per document and
 * the two links. A summary that drifted from the document it summarises would
 * be a third version of the same promise, so each line says what the document
 * is about, never what it commits us to.
 *
 * Add a row here in the same change that adds a policy page, or this page
 * stops being the complete list it claims to be.
 */
export const metadata: Metadata = {
  title: "Policies · Politikalar",
  description:
    "Every Counterscent policy in English and Turkish: privacy and KVKK notice, terms of use, cookie policy, refund policy and affiliate disclosure.",
  alternates: { canonical: "/legal/" },
};

interface PolicyRow {
  en: { title: string; href: string; about: string };
  tr: { title: string; href: string; about: string } | null;
}

const POLICIES: PolicyRow[] = [
  {
    en: {
      title: "Privacy policy",
      href: "/privacy/",
      about: "What personal data we process, why, who receives it, how long we keep it, and your rights.",
    },
    tr: {
      title: "Gizlilik politikası ve KVKK aydınlatma metni",
      href: "/tr/gizlilik/",
      about: "Hangi kişisel verileri, hangi amaçla işlediğimiz, kimlere aktardığımız, ne kadar sakladığımız ve haklarınız.",
    },
  },
  {
    en: {
      title: "Terms of use",
      href: "/terms/",
      about: "The rules for using the site and, for producers, the agreement behind a listing.",
    },
    tr: {
      title: "Kullanım koşulları",
      href: "/tr/kullanim-kosullari/",
      about: "Sitenin kullanım kuralları ve üreticiler için ilan sözleşmesi.",
    },
  },
  {
    en: {
      title: "Cookie policy",
      href: "/cookies/",
      about: "Every cookie and browser-storage entry we use, and how to change your analytics choice.",
    },
    tr: {
      title: "Çerez politikası",
      href: "/tr/cerez-politikasi/",
      about: "Kullandığımız her çerez ve tarayıcı kaydı, analiz tercihinizi nasıl değiştireceğiniz.",
    },
  },
  {
    en: {
      title: "Refund and cancellation policy",
      href: `${PRODUCER_CONSOLE}/refunds`,
      about: "How producer subscriptions renew, cancel and are refunded.",
    },
    tr: {
      title: "İade ve iptal politikası",
      href: `${PRODUCER_CONSOLE}/refunds#tr`,
      about: "Üretici aboneliklerinin yenilenmesi, iptali ve iadesi.",
    },
  },
  {
    en: {
      title: "Affiliate disclosure",
      href: "/disclosure/",
      about: "Which retailers pay us a commission, and why that never changes a score.",
    },
    tr: null,
  },
];

const linkCls = "font-medium underline underline-offset-2 hover:text-primary";

export default function LegalHubPage() {
  return (
    <div className="container max-w-3xl py-14 sm:py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        English · <span lang="tr">Türkçe</span>
      </p>
      <h1 className="mt-3 font-display text-fluid-h1">
        Policies <span className="text-muted-foreground">·</span>{" "}
        <span lang="tr">Politikalar</span>
      </h1>
      <p className="mt-4 max-w-prose text-muted-foreground">
        Every policy that applies to counterscent.com and the producer console, in English and
        Turkish. For people in Türkiye the Turkish text prevails.{" "}
        <span lang="tr">
          counterscent.com ve üretici paneli için geçerli tüm politikalar, İngilizce ve Türkçe.
          Türkiye&apos;deki kişiler için Türkçe metin esas alınır.
        </span>
      </p>

      <ul className="mt-10 divide-y divide-border border-y border-border">
        {POLICIES.map((p) => (
          <li key={p.en.href} className="grid gap-4 py-6 sm:grid-cols-2 sm:gap-8">
            <div>
              <Link href={p.en.href} className={linkCls}>
                {p.en.title}
              </Link>
              <p className="mt-1 text-sm text-muted-foreground">{p.en.about}</p>
            </div>
            <div lang="tr">
              {p.tr ? (
                <>
                  <Link href={p.tr.href} hrefLang="tr" className={linkCls}>
                    {p.tr.title}
                  </Link>
                  <p className="mt-1 text-sm text-muted-foreground">{p.tr.about}</p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Yalnızca İngilizce yayımlanmıştır.</p>
              )}
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-8 text-sm text-muted-foreground">
        Questions about any of these, or a request about your data:{" "}
        <span lang="tr">Sorularınız ve verilerinizle ilgili başvurularınız için:</span>{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className={linkCls}>
          {CONTACT_EMAIL}
        </a>
        . Producers can delete their account themselves at{" "}
        <a href={`${PRODUCER_CONSOLE}/console/delete`} className={linkCls}>
          producers.counterscent.com/console/delete
        </a>
        .
      </p>
    </div>
  );
}
