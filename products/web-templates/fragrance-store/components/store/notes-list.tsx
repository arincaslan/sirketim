import { Card } from "@/components/ui/card";
import type { ProductNotes } from "@/lib/types";

interface NotesListProps {
  notes: ProductNotes;
}

const ROWS: { key: keyof ProductNotes; label: string }[] = [
  { key: "top", label: "Top notes" },
  { key: "heart", label: "Heart notes" },
  { key: "base", label: "Base notes" },
];

export function NotesList({ notes }: NotesListProps) {
  return (
    <dl className="grid gap-4 sm:grid-cols-3">
      {ROWS.map((row) => (
        <Card key={row.key} className="p-4">
          <dt className="text-xs font-medium uppercase tracking-wide text-gold">
            {row.label}
          </dt>
          <dd className="mt-2 text-sm text-foreground">
            {notes[row.key].join(", ")}
          </dd>
        </Card>
      ))}
    </dl>
  );
}
