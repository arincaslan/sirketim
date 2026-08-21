import type { ProductNotes } from "@/lib/types";

interface NotesPyramidProps {
  notes: ProductNotes;
}

const TIERS: { key: keyof ProductNotes; label: string }[] = [
  { key: "top", label: "Top" },
  { key: "heart", label: "Heart" },
  { key: "base", label: "Base" },
];

/** Layered horizontal bands instead of a plain three-item list — top note
 * band is widest/lightest, base is narrowest/darkest, echoing how a scent
 * actually unfolds (see DESIGN.md). */
export function NotesPyramid({ notes }: NotesPyramidProps) {
  return (
    <div className="flex flex-col gap-3">
      {TIERS.map(({ key, label }, index) => (
        <div
          key={key}
          className="flex flex-col gap-2 border border-border p-5 sm:flex-row sm:items-center sm:gap-6"
          style={{
            marginInlineStart: `${index * 0}px`,
            width: `${100 - index * 12}%`,
          }}
        >
          <span className="w-16 shrink-0 text-xs font-semibold uppercase tracking-[0.2em] text-foil">
            {label}
          </span>
          <div className="flex flex-wrap gap-2">
            {notes[key].map((note) => (
              <span
                key={note}
                className="rounded-sm border border-border bg-secondary px-3 py-1 text-sm text-secondary-foreground"
              >
                {note}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
