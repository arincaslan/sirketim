import { Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const TESTIMONIALS = [
  {
    quote:
      "They rebuilt our site in three weeks and our conversion rate doubled. Communication was clear the entire way through.",
    name: "Maren Osei",
    role: "Founder, Northgate Coffee",
  },
  {
    quote:
      "Genuinely felt like an extension of our own team, not an outside vendor. Would hire again without hesitation.",
    name: "Diego Farias",
    role: "COO, Basecamp Realty",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="border-t border-border py-24">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            What clients say
          </h2>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {TESTIMONIALS.map((testimonial) => (
            <Card key={testimonial.name} className="border-border/80">
              <CardContent className="pt-6">
                <Quote className="h-6 w-6 text-primary" />
                <p className="mt-4 text-lg text-foreground">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <p className="mt-6 text-sm font-medium">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">
                  {testimonial.role}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
