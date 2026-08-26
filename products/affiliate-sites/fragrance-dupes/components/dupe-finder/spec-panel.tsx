import { Badge } from "@/components/ui/badge";
import { ValueBar } from "@/components/dupe-finder/value-bar";
import { formatPricePerMl, pricePerMl, valueMultiple } from "@/lib/similarity";
import type { DupeCandidate, ReferenceFragrance } from "@/lib/types";

/**
 * Grouped spec comparison - three clusters (Composition, Wear, Value), each
 * with one heading and one soft divider, never a hairline under every row.
 * See DESIGN.md §8 - this is the direct answer to Fragrantica's plain note-
 * pyramid text list.
 *
 * The buy button that used to close the Value section moved to
 * components/dupe-finder/buy-actions.tsx during the marketplace pivot: buying
 * is now a three-way branch (dupe, original, or our own bottle) that this
 * panel has no business owning, and a house product has no affiliate link for
 * it to point at.
 */
export function SpecPanel({
  reference,
  dupe,
}: {
  reference: ReferenceFragrance;
  dupe: DupeCandidate;
}) {
  const multiple = valueMultiple(reference, dupe);

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Composition
        </h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <NoteColumn label={reference.name} accent="reference" notes={reference.notes} />
          <NoteColumn label={dupe.name} accent="dupe" notes={dupe.notes} />
        </div>
      </section>

      <div className="h-px bg-border" />

      <section className="flex flex-col gap-3">
        <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Wear
        </h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <WearColumn
            accent="reference"
            concentration={reference.concentration}
            longevity={reference.longevityHoursRange}
            sillage={reference.sillageLabel}
          />
          <WearColumn
            accent="dupe"
            concentration={dupe.concentration}
            longevity={dupe.longevityHoursRange}
            sillage={dupe.sillageLabel}
          />
        </div>
      </section>

      <div className="h-px bg-border" />

      <section className="flex flex-col gap-4">
        <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Value
        </h4>
        <ValueBar
          label="Price per ml"
          referenceValue={pricePerMl(reference.priceUsd, reference.bottleMl)}
          dupeValue={pricePerMl(dupe.priceUsd, dupe.bottleMl)}
          formatValue={(n) => `$${n.toFixed(2)}`}
        />
        <p className="text-sm text-muted-foreground">
          {dupe.name} runs about{" "}
          <strong className="font-semibold text-foreground">{multiple.toFixed(1)}x cheaper per ml</strong>{" "}
          than {reference.name} (
          {formatPricePerMl(reference.priceUsd, reference.bottleMl)} vs{" "}
          {formatPricePerMl(dupe.priceUsd, dupe.bottleMl)}, {dupe.bottleMl}ml bottle).
        </p>
      </section>
    </div>
  );
}

function NoteColumn({
  label,
  accent,
  notes,
}: {
  label: string;
  accent: "reference" | "dupe";
  notes: { top: string[]; heart: string[]; base: string[] };
}) {
  return (
    <div className="flex flex-col gap-2 rounded-frame border border-border p-4">
      <Badge variant={accent}>{label}</Badge>
      <NoteRow label="Top" values={notes.top} />
      <NoteRow label="Heart" values={notes.heart} />
      <NoteRow label="Base" values={notes.base} />
    </div>
  );
}

function NoteRow({ label, values }: { label: string; values: string[] }) {
  return (
    <p className="text-sm">
      <span className="font-semibold text-foreground/70">{label}: </span>
      <span className="text-foreground/85">{values.join(", ")}</span>
    </p>
  );
}

function WearColumn({
  accent,
  concentration,
  longevity,
  sillage,
}: {
  accent: "reference" | "dupe";
  concentration: string;
  longevity: [number, number];
  sillage: string;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-frame border border-border p-4 text-sm">
      <span className={accent === "reference" ? "font-semibold text-reference" : "font-semibold text-dupe"}>
        {concentration}
      </span>
      <p>
        <span className="font-semibold text-foreground/70">Longevity: </span>
        {longevity[0]}-{longevity[1]} hours
      </p>
      <p>
        <span className="font-semibold text-foreground/70">Sillage: </span>
        {sillage}
      </p>
    </div>
  );
}
