import { Hero } from "@/components/store/hero";
import { CuratedCollection } from "@/components/store/curated-collection";
import { FamilyNav } from "@/components/store/family-nav";
import { EditorialShowcase } from "@/components/store/editorial-showcase";
import { DiscoveryTeaser } from "@/components/store/discovery-teaser";
import { ProductRail } from "@/components/store/product-rail";
import { LimitedCampaign } from "@/components/store/limited-campaign";
import { Reassurance } from "@/components/store/reassurance";
import { Newsletter } from "@/components/store/newsletter";
import { getBestsellers } from "@/lib/products";

export default function Home() {
  return (
    <>
      <Hero />
      <CuratedCollection />
      <FamilyNav />
      <EditorialShowcase />
      <DiscoveryTeaser />
      <ProductRail
        title="Bestsellers"
        subtitle="The ten fragrances, ranked by what keeps getting reordered."
        products={getBestsellers(6)}
        viewAllHref="/products"
      />
      <LimitedCampaign />
      <Reassurance />
      <Newsletter />
    </>
  );
}
