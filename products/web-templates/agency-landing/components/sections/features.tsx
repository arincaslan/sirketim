import { Compass, PenTool, Rocket } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const SERVICES = [
  {
    icon: Compass,
    title: "Strategy",
    description:
      "Positioning, research, and a plan that ties every design decision back to a business goal — not just a look and feel.",
  },
  {
    icon: PenTool,
    title: "Design",
    description:
      "Brand identity, UI/UX, and content systems built to be consistent across web, social, and print.",
  },
  {
    icon: Rocket,
    title: "Build & Launch",
    description:
      "Production-ready websites and campaigns, shipped fast and handed off cleanly — no black boxes.",
  },
];

export function Features() {
  return (
    <section id="services" className="border-t border-border py-24">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            What we do
          </h2>
          <p className="mt-4 text-muted-foreground">
            Three services, one team. Swap these for your own — this section
            is built to hold any 3–4 item service list.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service) => (
            <Card key={service.title} className="border-border/80">
              <CardHeader>
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <service.icon className="h-5 w-5" />
                </div>
                <CardTitle>{service.title}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
