import { Truck, RotateCcw, Leaf, FlaskConical } from "lucide-react";

const ITEMS = [
  {
    icon: Truck,
    title: "Free shipping over $120",
    desc: "Standard shipping included on every US order above that.",
  },
  {
    icon: RotateCcw,
    title: "30-day returns",
    desc: "Opened or not — if it isn't right, send it back.",
  },
  {
    icon: Leaf,
    title: "Cruelty-free & vegan",
    desc: "Nothing that goes in our bottles is tested on animals.",
  },
  {
    icon: FlaskConical,
    title: "Small-batch blending",
    desc: "Every batch is mixed and bottled by hand, not mass-produced.",
  },
];

export function ValueProps() {
  return (
    <section className="border-b border-border bg-secondary/40">
      <div className="container grid gap-8 py-12 sm:grid-cols-2 md:grid-cols-4">
        {ITEMS.map((item) => (
          <div key={item.title} className="flex flex-col items-start gap-2">
            <item.icon className="h-5 w-5 text-gold" />
            <p className="text-sm font-semibold">{item.title}</p>
            <p className="text-xs text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
