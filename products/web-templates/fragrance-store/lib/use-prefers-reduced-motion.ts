"use client";

import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Tracks the user's `prefers-reduced-motion` OS setting. Used to gate the
 * two taste-beat additions (custom cursor, first-load preloader) so both
 * degrade to "just show the content" rather than forcing motion on people
 * who've opted out at the system level.
 *
 * The lazy `useState` initializer reads `matchMedia` synchronously on the
 * client's first render (during hydration), so there's no flash of the
 * un-reduced variant before the effect below runs.
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia(QUERY).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    const update = () => setPrefersReduced(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  return prefersReduced;
}
