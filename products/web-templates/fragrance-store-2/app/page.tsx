import { Hero } from "@/components/store/hero";
import { Marquee } from "@/components/store/marquee";
import { BentoCollections } from "@/components/store/bento-collections";
import { FeaturedRail } from "@/components/store/featured-rail";
import { PullQuote } from "@/components/store/pull-quote";
import { Newsletter } from "@/components/store/newsletter";

const TICKER_ITEMS = [
  "ELEVEN SCENTS",
  "SMALL BATCH",
  "EAU DE PARFUM",
  "WORN AFTER DARK",
  "NO REFORMULATION",
];

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee items={TICKER_ITEMS} />
      <BentoCollections />
      <FeaturedRail />
      <PullQuote />
      <Newsletter />
    </>
  );
}
