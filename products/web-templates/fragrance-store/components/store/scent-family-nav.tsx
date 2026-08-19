"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

import { PRODUCTS, SCENT_FAMILIES } from "@/lib/products";

export function ScentFamilyNav() {
  return (
    <section className="border-b border-border py-16">
      <div className="container">
        <h2 className="font-serif text-2xl sm:text-3xl">
          Shop by scent family
        </h2>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-5">
          {SCENT_FAMILIES.map((family, index) => {
            const representative = PRODUCTS.find((p) => p.family === family);
            if (!representative) return null;
            return (
              <motion.div
                key={family}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Link
                  href={`/products?family=${family}`}
                  className="group relative block aspect-[3/4] overflow-hidden rounded-lg"
                >
                  <Image
                    src={representative.image}
                    alt={family}
                    fill
                    sizes="(min-width: 768px) 20vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent" />
                  <span className="absolute bottom-3 left-3 font-serif text-lg text-background">
                    {family}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
