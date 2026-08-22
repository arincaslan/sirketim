import { Leaf, PackageCheck, RefreshCcw, Sparkles } from "lucide-react";

const POINTS = [
  {
    icon: Sparkles,
    title: "A sample with every order",
    body: "Every full-size purchase ships with a free 2ml sample of your choice.",
  },
  {
    icon: PackageCheck,
    title: "Small, real batches",
    body: "We formulate in small runs — no reformulation between batches, ever.",
  },
  {
    icon: RefreshCcw,
    title: "30-day returns",
    body: "Unopened bottles can be returned for a full refund within 30 days.",
  },
  {
    icon: Leaf,
    title: "Traceable sourcing",
    body: "Every ingredients note on a product page names where it actually comes from.",
  },
];

export function Reassurance() {
  return (
    <section className="border-y border-border py-14">
      <div className="container grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {POINTS.map((point) => (
          <div key={point.title} className="flex flex-col gap-3">
            <point.icon className="h-5 w-5 text-primary" aria-hidden="true" />
            <p className="font-display text-base font-semibold">{point.title}</p>
            <p className="text-sm text-muted-foreground">{point.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
