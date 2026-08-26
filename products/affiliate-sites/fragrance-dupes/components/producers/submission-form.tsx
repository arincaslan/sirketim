"use client";

import { useMemo, useState } from "react";
import { Info, Warning } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemText,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getReferencesByBrand } from "@/lib/catalog";
import { REFERENCES } from "@/lib/dupes-data";
import { cn } from "@/lib/utils";
import type { FacetScores } from "@/lib/types";

/**
 * Producer listing submission (PRODUCER-PROGRAM.md §4).
 *
 * Two things here are anti-copy-cheat measures, not ordinary form fields:
 *
 * 1. The reference is a picker over our curated catalog, never free text.
 *    Producers cannot invent originals - that is what stops forty spellings
 *    of "Baccarat Rouge" and keeps the reference side editorial.
 *
 * 2. "What's genuinely different" is required prose. A producer who copies
 *    the original's note pyramid has to also write, in sentences, that
 *    nothing differs - which is a much harder lie to tell casually than
 *    pasting a note list, and gives the approval queue something to judge.
 *    The live warning when declared notes match the reference exactly is the
 *    same rule as lib/verification.ts's isVerbatimCopy, surfaced at the point
 *    of entry so an honest producer finds out immediately instead of after a
 *    rejection.
 *
 * Like AddReviewForm, this does not fake a submission: there is no database
 * and no producer accounts, so it says so on submit rather than showing a
 * success state for something that went nowhere.
 */

const FACET_LABELS: { key: keyof FacetScores; label: string }[] = [
  { key: "freshness", label: "Freshness" },
  { key: "sweetness", label: "Sweetness" },
  { key: "warmth", label: "Warmth" },
  { key: "woodyDepth", label: "Woody depth" },
  { key: "longevity", label: "Longevity" },
  { key: "sillage", label: "Sillage" },
];

function parseNotes(value: string): string[] {
  return value
    .split(",")
    .map((n) => n.trim())
    .filter(Boolean);
}

function sameNoteSet(a: string[], b: string[]): boolean {
  if (a.length === 0 || b.length === 0) return false;
  const setA = new Set(a.map((n) => n.toLowerCase()));
  const setB = new Set(b.map((n) => n.toLowerCase()));
  if (setA.size !== setB.size) return false;
  for (const n of setA) if (!setB.has(n)) return false;
  return true;
}

export function SubmissionForm() {
  const groups = useMemo(() => getReferencesByBrand(REFERENCES), []);

  const [referenceSlug, setReferenceSlug] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [bottleMl, setBottleMl] = useState("");
  const [top, setTop] = useState("");
  const [heart, setHeart] = useState("");
  const [base, setBase] = useState("");
  const [differences, setDifferences] = useState("");
  const [affiliateUrl, setAffiliateUrl] = useState("");
  const [facets, setFacets] = useState<FacetScores>({
    freshness: 5,
    sweetness: 5,
    warmth: 5,
    woodyDepth: 5,
    longevity: 5,
    sillage: 5,
  });
  const [attempted, setAttempted] = useState(false);

  const reference = REFERENCES.find((r) => r.slug === referenceSlug);

  // Live mirror of lib/verification.ts's isVerbatimCopy, so a producer sees
  // the problem while typing rather than at rejection.
  const notesLookCopied = useMemo(() => {
    if (!reference) return false;
    return (
      sameNoteSet(parseNotes(top), reference.notes.top) &&
      sameNoteSet(parseNotes(heart), reference.notes.heart) &&
      sameNoteSet(parseNotes(base), reference.notes.base)
    );
  }, [reference, top, heart, base]);

  const canSubmit =
    referenceSlug &&
    name.trim() &&
    price.trim() &&
    bottleMl.trim() &&
    parseNotes(top).length > 0 &&
    parseNotes(base).length > 0 &&
    differences.trim().length >= 40 &&
    affiliateUrl.trim();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setAttempted(true);
      }}
      className="flex flex-col gap-8"
    >
      <Field label="Which original does this alternate?" hint="Pick from our catalog - producers can't add originals.">
        <Select value={referenceSlug} onValueChange={setReferenceSlug}>
          <SelectTrigger aria-label="Reference fragrance">
            <SelectValue placeholder="Choose the original" />
          </SelectTrigger>
          <SelectContent>
            {groups.flatMap((group) =>
              group.references.map((ref) => (
                <SelectItem key={ref.slug} value={ref.slug}>
                  <SelectItemText>
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate font-semibold">{ref.name}</span>
                      <span className="truncate text-xs text-muted-foreground">{ref.brand}</span>
                    </span>
                  </SelectItemText>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </Field>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Product name">
          <TextInput value={name} onChange={setName} placeholder="e.g. Amber Nights" />
        </Field>
        <Field label="Price (USD)">
          <TextInput value={price} onChange={setPrice} placeholder="39" inputMode="decimal" />
        </Field>
        <Field label="Bottle size (ml)">
          <TextInput value={bottleMl} onChange={setBottleMl} placeholder="50" inputMode="numeric" />
        </Field>
      </div>

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold">Note pyramid</span>
          <span className="text-xs text-muted-foreground">
            Comma separated. These feed the match score, so describe your product, not the original.
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Top notes">
            <TextInput value={top} onChange={setTop} placeholder="Saffron, Bergamot" />
          </Field>
          <Field label="Heart notes">
            <TextInput value={heart} onChange={setHeart} placeholder="Amber, Jasmine" />
          </Field>
          <Field label="Base notes">
            <TextInput value={base} onChange={setBase} placeholder="Cedar, Musk" />
          </Field>
        </div>

        {notesLookCopied && reference && (
          <div className="flex gap-3 rounded-frame border border-destructive/40 bg-destructive/10 p-4">
            <Warning weight="fill" className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />
            <p className="text-sm leading-relaxed text-foreground/85">
              These notes are identical to {reference.name}&apos;s own pyramid. A listing that simply
              restates the original&apos;s notes gets held for manual review and will not publish -
              we can&apos;t present it as an independent comparison. Describe what your formulation
              actually contains, including where it differs.
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold">How it wears, 0 to 10</span>
          <span className="text-xs text-muted-foreground">
            Your own assessment. Shown as &quot;producer declared&quot; until we verify it.
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {FACET_LABELS.map(({ key, label }) => (
            <label key={key} className="flex items-center gap-3 text-sm">
              <span className="w-28 shrink-0 text-muted-foreground">{label}</span>
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                value={facets[key]}
                onChange={(e) => setFacets((f) => ({ ...f, [key]: Number(e.target.value) }))}
                className="h-1 flex-1 cursor-pointer accent-[hsl(var(--primary))]"
              />
              <span className="w-6 shrink-0 text-right font-semibold tabular-nums">{facets[key]}</span>
            </label>
          ))}
        </div>
      </div>

      <Field
        label="What's genuinely different from the original?"
        hint="Required. Every alternative differs somewhere - longevity, a missing note, a substitution. Listings claiming no difference are rejected."
      >
        <textarea
          value={differences}
          onChange={(e) => setDifferences(e.target.value)}
          rows={4}
          placeholder="e.g. The fir resin in the original's base is absent, so our drydown reads sweeter and less resinous. Projection drops off around hour five."
          className="w-full resize-y rounded-frame border border-border bg-card px-3 py-2.5 text-sm leading-relaxed outline-none transition-colors placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25"
        />
        <span className="text-xs text-muted-foreground">
          {differences.trim().length < 40
            ? `At least 40 characters (${differences.trim().length} so far).`
            : "Looks good."}
        </span>
      </Field>

      <Field
        label="Your affiliate tracking link"
        hint="The link from your program that credits DRYDOWN. We never show it raw - it resolves through our own redirect."
      >
        <TextInput value={affiliateUrl} onChange={setAffiliateUrl} placeholder="https://..." />
      </Field>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={!canSubmit}>
          Submit for review
        </Button>
        <span className="text-xs text-muted-foreground">
          Reviewed within 3 business days.
        </span>
      </div>

      {attempted && (
        <div role="status" className="flex gap-3 rounded-frame border border-primary/30 bg-secondary/50 p-4">
          <Info weight="fill" className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
          <p className="text-sm leading-relaxed text-foreground/85">
            The producer program is not open yet. There are no producer accounts, no database, and
            no billing connected to this site, so nothing you entered has been saved or sent. This
            form exists so the flow can be reviewed before the backend behind it is built.
          </p>
        </div>
      )}
    </form>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-semibold">{label}</span>
      {hint && <span className="-mt-1 text-xs text-muted-foreground">{hint}</span>}
      {children}
    </label>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  inputMode,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: "decimal" | "numeric";
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      inputMode={inputMode}
      className={cn(
        "w-full rounded-frame border border-border bg-card px-3 py-2.5 text-sm outline-none transition-colors",
        "placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25"
      )}
    />
  );
}
