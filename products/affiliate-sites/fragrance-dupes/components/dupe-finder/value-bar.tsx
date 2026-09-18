/**
 * Price-per-ml comparison, shown as two proportionally-sized marks with no
 * filled background track - the taste skill explicitly bans dashboard-style
 * "filled track + partial fill" bars as comparison visuals on a marketing/
 * content surface (design-taste-frontend section 9.F). A number plus a short
 * inline mark instead.
 *
 * Two colour corrections, 2026-09-18, and they point in opposite directions
 * because the four series tokens had been used as though they were
 * interchangeable:
 *
 * - The MARKS were `bg-reference`/`bg-dupe`, i.e. drawn in the darker,
 *   mode-invariant step. That step exists to be a badge GROUND with white text
 *   on it, so the gold bar sat almost black on the dark theme. They are
 *   `-mark` now, which is what a bare rule is and which has a per-mode value.
 * - The FIGURES were `text-reference`/`text-dupe`. Measured on the card in
 *   dark mode those are 2.77:1 and 4.03:1 at this size, both under AA, which
 *   app/new/page.tsx and components/home/new-arrivals.tsx had already found
 *   and refused. They are plain foreground now. Nothing is lost: each figure
 *   sits inches from its own mark, so the pairing is positional rather than
 *   chromatic, and that also stops the comparison depending on hue alone.
 */
export function ValueBar({
  label,
  referenceValue,
  dupeValue,
  formatValue,
}: {
  label: string;
  referenceValue: number;
  dupeValue: number;
  formatValue: (n: number) => string;
}) {
  const max = Math.max(referenceValue, dupeValue);

  return (
    <div className="flex flex-col gap-2.5">
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </span>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="h-1 rounded-pill bg-reference-mark"
            style={{ width: `${Math.max(6, (referenceValue / max) * 100)}%` }}
          />
          <span className="whitespace-nowrap text-sm font-semibold tabular-nums">
            {formatValue(referenceValue)}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="h-1 rounded-pill bg-dupe-mark"
            style={{ width: `${Math.max(6, (dupeValue / max) * 100)}%` }}
          />
          <span className="whitespace-nowrap text-sm font-semibold tabular-nums">
            {formatValue(dupeValue)}
          </span>
        </div>
      </div>
    </div>
  );
}
