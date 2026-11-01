import type { Metadata } from "next";
import Link from "next/link";

/**
 * The shell every legal document shares, in either language (2026-11-01).
 *
 * WHY EACH LANGUAGE IS ITS OWN PAGE rather than one page with both texts:
 * a reader should land on one complete document in their language, with its
 * own canonical URL and `hreflang` pair, and a legal text half in another
 * language is easy to misread as the whole. The two versions carry the same
 * "last updated" date and are changed in the same commit - LEGAL-COMPLIANCE.md
 * says so, and that rule is the only thing keeping them equal.
 *
 * IF THE TWO EVER DIFFER, each page says which one prevails: the Turkish text
 * for KVKK purposes and for consumers in Türkiye, the English text otherwise.
 * That sentence lives in the documents themselves, not here.
 */
export type LegalLang = "en" | "tr";

export interface LegalDoc {
  /** Path of this language's page, with trailing slash. */
  path: string;
  /** Path of the other language's page, with trailing slash. */
  counterpart: string;
}

export function legalMetadata(opts: {
  lang: LegalLang;
  title: string;
  description: string;
  en: string;
  tr: string;
}): Metadata {
  const self = opts.lang === "en" ? opts.en : opts.tr;
  return {
    title: opts.title,
    description: opts.description,
    alternates: {
      canonical: self,
      languages: { en: opts.en, tr: opts.tr, "x-default": opts.en },
    },
  };
}

export function LegalPage({
  lang,
  title,
  updated,
  counterpart,
  children,
}: {
  lang: LegalLang;
  title: string;
  updated: string;
  counterpart: string;
  children: React.ReactNode;
}) {
  const isTr = lang === "tr";
  return (
    <div lang={lang} className="container max-w-2xl py-14 sm:py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {isTr ? (
          <>
            Türkçe ·{" "}
            <Link href={counterpart} hrefLang="en" lang="en" className="underline underline-offset-2 hover:text-primary">
              Read in English
            </Link>
          </>
        ) : (
          <>
            English ·{" "}
            <Link href={counterpart} hrefLang="tr" lang="tr" className="underline underline-offset-2 hover:text-primary">
              Türkçe oku
            </Link>
          </>
        )}
      </p>
      <h1 className="mt-3 font-display text-fluid-h1">{title}</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {isTr ? `Son güncelleme: ${updated}` : `Last updated ${updated}`}
      </p>
      <div className="prose prose-lg mt-8 max-w-none">{children}</div>
    </div>
  );
}
