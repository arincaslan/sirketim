import { Check, X } from "@phosphor-icons/react/dist/ssr";

export function ProsCons({ pros, cons }: { pros: string[]; cons: string[] }) {
  return (
    <div className="not-prose grid gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-2 rounded-frame border border-border p-5">
        <span className="text-xs font-semibold uppercase tracking-wide text-dupe">Works well</span>
        <ul className="flex flex-col gap-2">
          {pros.map((pro) => (
            <li key={pro} className="flex items-start gap-2 text-sm text-foreground/85">
              <Check weight="bold" className="mt-0.5 h-4 w-4 shrink-0 text-dupe" aria-hidden />
              {pro}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col gap-2 rounded-frame border border-border p-5">
        <span className="text-xs font-semibold uppercase tracking-wide text-destructive">
          Worth knowing
        </span>
        <ul className="flex flex-col gap-2">
          {cons.map((con) => (
            <li key={con} className="flex items-start gap-2 text-sm text-foreground/85">
              <X weight="bold" className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />
              {con}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
