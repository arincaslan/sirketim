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
 * Deliberately plain typography, no colour-coding beyond spacing and label
 * weight - the content is doing the work here, not decoration.
 */
export function NoteDiff({ reference, dupe }: { reference: ReferenceFragrance; dupe: DupeCandidate }) {
  const diff = getNoteDiff(reference, dupe);
  const layers: (keyof FragranceNotes)[] = ["top", "heart", "base"];

  return (
    <div className="flex flex-col gap-5">
      <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        What&apos;s the same, what&apos;s different
      </h4>

      <div className="grid gap-5 sm:grid-cols-3">
        {layers.map((layer) => {
          const layerDiff = diff[layer];
          const hasAnything =
            layerDiff.shared.length > 0 || layerDiff.referenceOnly.length > 0 || layerDiff.dupeOnly.length > 0;
          if (!hasAnything) return null;

          return (
            <div key={layer} className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-foreground/70">{LAYER_LABELS[layer]}</span>

              {layerDiff.shared.length > 0 && (
                <p className="text-sm text-foreground/85">
                  <span className="text-muted-foreground">Shared: </span>
                  {layerDiff.shared.join(", ")}
                </p>
              )}
              {layerDiff.referenceOnly.length > 0 && (
                <p className="text-sm text-foreground/70">
                  <span className="text-muted-foreground">Only in {reference.name}: </span>
                  {layerDiff.referenceOnly.join(", ")}
                </p>
              )}
              {layerDiff.dupeOnly.length > 0 && (
                <p className="text-sm text-foreground/70">
                  <span className="text-muted-foreground">Only in {dupe.name}: </span>
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
