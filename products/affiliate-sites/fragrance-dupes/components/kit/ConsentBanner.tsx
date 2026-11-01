"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  CONSENT_OPEN_EVENT,
  effectiveConsent,
  readConsent,
  writeConsent,
  type ConsentChoice,
} from "@/lib/consent";

/**
 * The analytics consent banner (2026-11-01). Bilingual because the site's
 * readers are mostly English-speaking while the controller is Turkish and
 * KVKK expects a Turkish notice; both lines say the same thing.
 *
 * RULES THIS FOLLOWS, BECAUSE A BANNER IS WHERE DARK PATTERNS LIVE:
 * - "Allow" and "Decline" are the SAME size, the same style, side by side. No
 *   pre-ticked box, no "Accept all" in colour beside a grey text link, no
 *   second screen needed to refuse.
 * - Declining is remembered, so the visitor is not asked again on every page.
 * - Nothing loads before a yes: GoogleAnalytics renders nothing until consent
 *   is "granted" (components/kit/Analytics.tsx).
 * - A browser sending Global Privacy Control is treated as having declined,
 *   and is not shown the banner at all.
 * - The choice can be changed at any time from "Cookie settings" in the
 *   footer, which re-opens this same banner showing the current answer.
 *
 * Renders nothing on the server: the answer lives in the visitor's browser, so
 * the first paint never includes it and there is no hydration mismatch.
 */
export function ConsentBanner() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<ConsentChoice | null>(null);

  useEffect(() => {
    if (effectiveConsent() === null) setOpen(true);
    const onOpen = () => {
      setCurrent(readConsent());
      setOpen(true);
    };
    window.addEventListener(CONSENT_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, onOpen);
  }, []);

  if (!open) return null;

  const choose = (choice: ConsentChoice) => {
    writeConsent(choice);
    setCurrent(choice);
    setOpen(false);
  };

  return (
    <section
      aria-label="Analytics consent / Analiz izni"
      className="fixed inset-x-3 bottom-3 z-[90] mx-auto max-w-2xl rounded-frame border border-border bg-card p-5 shadow-xl sm:inset-x-6 sm:bottom-6"
    >
      <p className="text-sm leading-relaxed text-foreground/90">
        <strong>May we count your visit?</strong> With your permission we load Google Analytics 4 to see
        which pages are read. It sets no cookie on your device; if you decline, nothing is measured.
      </p>
      <p lang="tr" className="mt-2 text-sm leading-relaxed text-foreground/90">
        <strong>Ziyaretinizi sayabilir miyiz?</strong> İzin verirseniz hangi sayfaların okunduğunu görmek
        için Google Analytics 4&apos;ü yükleriz. Cihazınıza çerez yazmaz; reddederseniz hiçbir ölçüm
        yapılmaz.
      </p>
      {current && (
        <p className="mt-2 text-xs text-muted-foreground">
          Current choice / Mevcut seçim: {current === "granted" ? "allowed / izin verildi" : "declined / reddedildi"}
        </p>
      )}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Button type="button" variant="outline" className="sm:flex-1" onClick={() => choose("granted")}>
          Allow analytics · İzin ver
        </Button>
        <Button type="button" variant="outline" className="sm:flex-1" onClick={() => choose("denied")}>
          Decline · Reddet
        </Button>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        <Link href="/cookies/" className="underline underline-offset-2 hover:text-primary">
          Cookie policy
        </Link>
        {" · "}
        <Link href="/tr/cerez-politikasi/" className="underline underline-offset-2 hover:text-primary">
          Çerez politikası
        </Link>
        {" · "}
        <Link href="/privacy/" className="underline underline-offset-2 hover:text-primary">
          Privacy
        </Link>
        {" · "}
        <Link href="/tr/gizlilik/" className="underline underline-offset-2 hover:text-primary">
          Gizlilik
        </Link>
      </p>
    </section>
  );
}

/** Footer control that re-opens the banner. A button, not a link: it goes nowhere. */
export function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new Event(CONSENT_OPEN_EVENT))}
    >
      Cookie settings · Çerez ayarları
    </button>
  );
}
