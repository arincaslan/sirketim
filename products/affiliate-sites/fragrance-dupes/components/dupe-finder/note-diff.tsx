import { getNoteDiff } from "@/lib/verification";
import type { DupeCandidate, FragranceNotes, ReferenceFragrance } from "@/lib/types";

const LAYER_LABELS: Record<keyof FragranceNotes, string> = {
  top: "Top",
  heart: "Heart",
  base: "Base",
};

/**
 * "Explain difference and similarities" - the literal ask behind the
 * anti-copy-cheat standard (lib/verification.ts). A single percentage cannot
 * carry that; this renders the actual set overlap per note layer so a buyer
 * can see exactly which notes are shared and which are not, rather than take
 * the score's word for it.
 *
 * Still no decoration: no colour-coded note chips, no shared/missing icons,
 * no strike-through. Only the layer label moved to the display serif on
 * 2026-09-18, which separates the three groups by register rather than by rule.
 *
 * Tinting the two "only in" labels with the series colours was tried in the
 * same pass and REVERTED. `text-reference` and `text-dupe` are chart tokens:
 * they exist to be a BADGE GROUND that white text sits on, which is why
 * --series-reference-text is mode-invariant, and used as small foreground text
 * on the card they measure 2.77:1 and 4.03:1 in dark mode. Both under AA.
 * app/new/page.tsx and components/home/new-arrivals.tsx had already refused
 * the same token for the same reason; see their comments. If these three lines
 * ever need series identity, it has to come from a swatch, which is a non-text
 * mark and only owes 3:1.
 */
export function NoteDiff({ reference, dupe }: { reference: ReferenceFragrance; dupe: DupeCandidate }) {
  const diff = getNoteDiff(reference, dupe);
  const layers: (keyof FragranceNotes)[] = ["top", "heart", "base"];

  return (
    <div className="flex flex-col gap-5">
      <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        What&apos;s the same, what&apos;s different
      </h4>

      <div className="grid gap-6 sm:grid-cols-3">
        {layers.map((layer) => {
          const layerDiff = diff[layer];
          const hasAnything =
            layerDiff.shared.length > 0 || layerDiff.referenceOnly.length > 0 || layerDiff.dupeOnly.length > 0;
          if (!hasAnything) return null;

          return (
            <div key={layer} className="flex flex-col gap-2.5">
              <span className="font-display text-base leading-none text-foreground/80">
                {LAYER_LABELS[layer]}
              </span>

              {layerDiff.shared.length > 0 && (
                <p className="text-sm leading-relaxed text-foreground/85">
                  <span className="font-semibold text-muted-foreground">Shared: </span>
                  {layerDiff.shared.join(", ")}
                </p>
              )}
              {layerDiff.referenceOnly.length > 0 && (
                <p className="text-sm leading-relaxed text-foreground/70">
                  <span className="font-semibold text-muted-foreground">
                    Only in {reference.name}:{" "}
                  </span>
                  {layerDiff.referenceOnly.join(", ")}
                </p>
              )}
              {layerDiff.dupeOnly.length > 0 && (
                <p className="text-sm leading-relaxed text-foreground/70">
                  <span className="font-semibold text-muted-foreground">Only in {dupe.name}: </span>
                  {layerDiff.dupeOnly.join(", ")}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
