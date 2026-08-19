import { Hero } from "@/components/store/hero";
import { ValueProps } from "@/components/store/value-props";
import { ScentFamilyNav } from "@/components/store/scent-family-nav";
import { FeaturedCollection } from "@/components/store/featured-collection";
import { Newsletter } from "@/components/store/newsletter";

export default function Home() {
  return (
    <>
      <Hero />
      <ValueProps />
      <ScentFamilyNav />
      <FeaturedCollection />
      <Newsletter />
    </>
  );
}
