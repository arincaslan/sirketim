/**
 * Price-per-ml comparison, shown as two proportionally-sized marks with no
 * filled background track - the taste skill explicitly bans dashboard-style
 * "filled track + partial fill" bars as comparison visuals on a marketing/
 * content surface (design-taste-frontend §9.F). A number plus a short
 * inline mark instead.
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
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="h-1.5 rounded-pill bg-reference"
            style={{ width: `${Math.max(6, (referenceValue / max) * 100)}%` }}
          />
          <span className="whitespace-nowrap text-sm font-semibold tabular-nums text-reference">
            {formatValue(referenceValue)}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="h-1.5 rounded-pill bg-dupe"
            style={{ width: `${Math.max(6, (dupeValue / max) * 100)}%` }}
          />
          <span className="whitespace-nowrap text-sm font-semibold tabular-nums text-dupe">
            {formatValue(dupeValue)}
          </span>
        </div>
      </div>
    </div>
  );
}
