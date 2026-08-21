import { formatPrice } from "@/lib/utils";
import type { CartLine } from "@/lib/types";

interface OrderSummaryProps {
  lines: CartLine[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  children?: React.ReactNode;
}

/** Sticky dark summary rail — always visible alongside the line items /
 * checkout form, styled with foil hairline dividers (see DESIGN.md). */
export function OrderSummary({
  lines,
  subtotal,
  shipping,
  tax,
  total,
  children,
}: OrderSummaryProps) {
  return (
    <div className="border border-border bg-card p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foil">
        Order summary
      </p>

      <ul className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
        {lines.map((line) => (
          <li key={`${line.slug}-${line.sizeMl}`} className="flex justify-between gap-2">
            <span className="truncate">
              {line.name} &times; {line.quantity}{" "}
              <span className="text-xs">({line.sizeMl}ml)</span>
            </span>
            <span className="shrink-0 text-foreground">
              {formatPrice(line.unitPrice * line.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-5 space-y-2 border-t border-foil/20 pt-4 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span className="text-foreground">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Shipping</span>
          <span className="text-foreground">
            {shipping === 0 ? "Free" : formatPrice(shipping)}
          </span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Estimated tax</span>
          <span className="text-foreground">{formatPrice(tax)}</span>
        </div>
        <div className="flex justify-between border-t border-foil/20 pt-3 text-base font-semibold">
          <span>Total</span>
          <span className="text-primary">{formatPrice(total)}</span>
        </div>
      </div>

      {children}
    </div>
  );
}
