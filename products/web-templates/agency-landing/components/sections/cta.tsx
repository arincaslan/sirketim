import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Cta() {
  return (
    <section id="contact" className="border-t border-border py-24">
      <div className="container">
        <div className="rounded-2xl bg-primary px-8 py-16 text-center sm:px-16">
          <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
            Have a project in mind?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
            Tell us a bit about what you&apos;re building and we&apos;ll get
            back to you within one business day. Wire this button to a real
            contact form or mailto link.
          </p>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="mt-8 border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            <Link href="mailto:hello@example.com">Say hello</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
