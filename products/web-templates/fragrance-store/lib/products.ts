import type { Product, ScentFamily } from "@/lib/types";

export const SCENT_FAMILIES: ScentFamily[] = [
  "Floral",
  "Woody",
  "Oriental",
  "Fresh",
  "Gourmand",
];

// Editorial macro shots (one cohesive set, same lighting/backdrop/angle) that
// represent each scent family on its own terms, rather than reusing a single
// product's bottle photo for the whole family.
export const SCENT_FAMILY_IMAGES: Record<ScentFamily, string> = {
  Floral: "/products/category-floral.png",
  Woody: "/products/category-woody.png",
  Oriental: "/products/category-oriental.png",
  Fresh: "/products/category-fresh.png",
  Gourmand: "/products/category-gourmand.png",
};

export const PRODUCTS: Product[] = [
  {
    slug: "velvet-oud",
    name: "Velvet Oud",
    family: "Oriental",
    concentration: "Eau de Parfum",
    tagline: "Smoked oud wrapped in rose and warm amber.",
    description:
      "Velvet Oud opens with a flash of saffron before settling into a rich heart of Bulgarian rose and dark oud. It closes on a long, smoky base of amber and sandalwood — built for cold evenings and closed doors.",
    highlights: [
      "Rich, long-lasting oud base",
      "Hand-blended in small batches",
      "Unisex — wears equally well on everyone",
    ],
    notes: {
      top: ["Saffron", "Bergamot"],
      heart: ["Rose", "Oud"],
      base: ["Amber", "Sandalwood"],
    },
    image: "/products/product-velvet-oud.png",
    badge: "Bestseller",
    sizes: [
      { ml: 30, price: 98 },
      { ml: 50, price: 148 },
      { ml: 100, price: 215 },
    ],
  },
  {
    slug: "citrus-noir",
    name: "Citrus Noir",
    family: "Fresh",
    concentration: "Eau de Toilette",
    tagline: "Sicilian lemon and black pepper, cut with vetiver.",
    description:
      "A sharp burst of Sicilian lemon and bergamot opens Citrus Noir, before black pepper and vetiver bring in some edge. It dries down to a clean musk-and-cedar base that keeps the freshness without going sweet.",
    highlights: [
      "Eau de Toilette — lighter, ideal for daytime",
      "Bright citrus that lasts past the first hour",
      "A grounding, not-too-sweet dry-down",
    ],
    notes: {
      top: ["Bergamot", "Lemon"],
      heart: ["Black Pepper", "Vetiver"],
      base: ["Musk", "Cedar"],
    },
    image: "/products/product-citrus-noir.png",
    sizes: [
      { ml: 30, price: 68 },
      { ml: 50, price: 98 },
      { ml: 100, price: 145 },
    ],
  },
  {
    slug: "rose-absolute",
    name: "Rose Absolute",
    family: "Floral",
    concentration: "Eau de Parfum",
    tagline: "A true rose, layered with peony and soft musk.",
    description:
      "Rose Absolute is built around a single idea: what a rose actually smells like, not the candy version. Pink pepper and litchi open it up, Bulgarian rose and peony sit at the centre, and a musk-and-vanilla base keeps it soft against skin.",
    highlights: [
      "Bulgarian rose at the centre, not just a top note",
      "Softens over the first 20 minutes — no harsh opening",
      "Our most reordered scent",
    ],
    notes: {
      top: ["Pink Pepper", "Litchi"],
      heart: ["Rose", "Peony"],
      base: ["Musk", "Vanilla"],
    },
    image: "/products/product-rose-absolute.png",
    badge: "Bestseller",
    sizes: [
      { ml: 30, price: 88 },
      { ml: 50, price: 128 },
      { ml: 100, price: 189 },
    ],
  },
  {
    slug: "amber-musk",
    name: "Amber Musk",
    family: "Oriental",
    concentration: "Eau de Parfum",
    tagline: "Warm amber and labdanum, finished with white musk.",
    description:
      "Amber Musk is the scent of late-afternoon light — mandarin and cardamom at the top, a dense amber-labdanum heart, and a white musk base that never quite lets go. Best applied to pulse points and left alone.",
    highlights: [
      "Dense, resinous amber heart",
      "Skin-scent longevity — still there 8 hours later",
      "Layers well under other fragrances",
    ],
    notes: {
      top: ["Mandarin", "Cardamom"],
      heart: ["Amber", "Labdanum"],
      base: ["White Musk", "Vanilla"],
    },
    image: "/products/product-amber-musk.png",
    sizes: [
      { ml: 30, price: 92 },
      { ml: 50, price: 138 },
      { ml: 100, price: 198 },
    ],
  },
  {
    slug: "ocean-bloom",
    name: "Ocean Bloom",
    family: "Fresh",
    concentration: "Eau de Parfum",
    tagline: "Sea spray and water lily over driftwood musk.",
    description:
      "Ocean Bloom pairs a cold, salt-air opening with water lily and jasmine at the heart. It settles into a driftwood-and-musk base that reads more coastline than swimming pool — fresh without the synthetic \"clean laundry\" effect.",
    highlights: [
      "A fresh scent that doesn't smell like soap",
      "Water lily heart note is rare at this price",
      "A reliable warm-weather everyday wear",
    ],
    notes: {
      top: ["Sea Spray", "Bergamot"],
      heart: ["Water Lily", "Jasmine"],
      base: ["Driftwood", "Musk"],
    },
    image: "/products/product-ocean-bloom.png",
    badge: "New",
    sizes: [
      { ml: 30, price: 75 },
      { ml: 50, price: 108 },
      { ml: 100, price: 159 },
    ],
  },
  {
    slug: "vanilla-bourbon",
    name: "Vanilla Bourbon",
    family: "Gourmand",
    concentration: "Eau de Parfum",
    tagline: "Bourbon vanilla and tonka bean, warmed with caramel.",
    description:
      "Vanilla Bourbon leans all the way into gourmand — real bourbon vanilla pods, tonka bean, and a soft caramel accord, grounded by sandalwood so it never tips into dessert territory. A cold-weather signature scent.",
    highlights: [
      "Real bourbon vanilla, not a one-note sweetener",
      "Sandalwood base keeps it out of candle-shop territory",
      "One of our warmest, coziest scents",
    ],
    notes: {
      top: ["Bourbon Vanilla", "Orange"],
      heart: ["Tonka Bean", "Caramel"],
      base: ["Sandalwood", "Musk"],
    },
    image: "/products/product-vanilla-bourbon.png",
    sizes: [
      { ml: 30, price: 82 },
      { ml: 50, price: 118 },
      { ml: 100, price: 169 },
    ],
  },
  {
    slug: "white-jasmine",
    name: "White Jasmine",
    family: "Floral",
    concentration: "Eau de Parfum",
    tagline: "Jasmine sambac and tuberose, brightened with neroli.",
    description:
      "White Jasmine is a proper white floral — jasmine sambac and tuberose at full volume, softened by neroli and mandarin up top. A cedar-and-musk base keeps it from feeling heavy in warm weather.",
    highlights: [
      "Full-volume white floral heart",
      "Neroli top note keeps it from smelling dated",
      "Best in spring and summer",
    ],
    notes: {
      top: ["Neroli", "Mandarin"],
      heart: ["Jasmine Sambac", "Tuberose"],
      base: ["White Musk", "Cedar"],
    },
    image: "/products/product-white-jasmine.png",
    sizes: [
      { ml: 30, price: 90 },
      { ml: 50, price: 132 },
      { ml: 100, price: 192 },
    ],
  },
  {
    slug: "cedar-smoke",
    name: "Cedar & Smoke",
    family: "Woody",
    concentration: "Eau de Parfum",
    tagline: "Smoked birch and cedarwood, sharpened with black pepper.",
    description:
      "Cedar & Smoke opens with black pepper and cardamom, moves into a dry cedarwood-and-vetiver heart, and finishes on smoked birch and leather. Built for autumn — this is our darkest, driest woody scent.",
    highlights: [
      "Dry-down reads more campfire than cologne aisle",
      "Cardamom keeps the opening from feeling harsh",
      "Pairs well with knitwear and cold air",
    ],
    notes: {
      top: ["Black Pepper", "Cardamom"],
      heart: ["Cedarwood", "Vetiver"],
      base: ["Smoked Birch", "Leather"],
    },
    image: "/products/product-cedar-smoke.png",
    sizes: [
      { ml: 30, price: 96 },
      { ml: 50, price: 145 },
      { ml: 100, price: 210 },
    ],
  },
  {
    slug: "bergamot-sky",
    name: "Bergamot Sky",
    family: "Fresh",
    concentration: "Eau de Toilette",
    tagline: "Bergamot and grapefruit, cooled with green tea.",
    description:
      "Bergamot Sky is the lightest scent in the collection — bergamot and grapefruit up top, green tea and mint at the heart, and a soft white-musk base. Built as an everyday Eau de Toilette, not a statement scent.",
    highlights: [
      "Our lightest, most wearable everyday scent",
      "Green tea heart keeps the citrus from going sour",
      "Easy to layer, hard to overdo",
    ],
    notes: {
      top: ["Bergamot", "Grapefruit"],
      heart: ["Green Tea", "Mint"],
      base: ["White Musk", "Amber"],
    },
    image: "/products/product-bergamot-sky.png",
    sizes: [
      { ml: 30, price: 65 },
      { ml: 50, price: 95 },
      { ml: 100, price: 139 },
    ],
  },
  {
    slug: "midnight-leather",
    name: "Midnight Leather",
    family: "Woody",
    concentration: "Eau de Parfum",
    tagline: "Black currant and saffron over leather and oud.",
    description:
      "Midnight Leather is the boldest scent we make — black currant and saffron up top, a leather-and-iris heart, and a base of oud and tobacco. Small-batch, limited run; wears best alone, at night.",
    highlights: [
      "Our boldest, longest-throw scent",
      "Leather-and-oud base with real depth",
      "Limited-run batch — restocks are not guaranteed",
    ],
    notes: {
      top: ["Saffron", "Black Currant"],
      heart: ["Leather", "Iris"],
      base: ["Oud", "Tobacco"],
    },
    image: "/products/product-midnight-leather.png",
    badge: "Limited",
    sizes: [
      { ml: 30, price: 118 },
      { ml: 50, price: 175 },
      { ml: 100, price: 259 },
    ],
  },
  {
    slug: "iris-poudre",
    name: "Iris Poudre",
    family: "Floral",
    concentration: "Eau de Parfum",
    tagline: "Powdery iris and violet leaf, softened with cashmere wood.",
    description:
      "Iris Poudre is our take on a classic powdery floral — iris and a soft powder accord at the centre, violet leaf and bergamot up top, cashmere wood and musk underneath. Elegant, a little retro, never loud.",
    highlights: [
      "Classic \"powdery\" style, updated with a lighter base",
      "Iris root is genuinely expensive to source — you can tell",
      "A quieter, more grown-up floral",
    ],
    notes: {
      top: ["Bergamot", "Violet Leaf"],
      heart: ["Iris", "Powder Accord"],
      base: ["Musk", "Cashmere Wood"],
    },
    image: "/products/product-iris-poudre.png",
    sizes: [
      { ml: 30, price: 85 },
      { ml: 50, price: 122 },
      { ml: 100, price: 178 },
    ],
  },
  {
    slug: "golden-saffron",
    name: "Golden Saffron",
    family: "Oriental",
    concentration: "Eau de Parfum",
    tagline: "Saffron and rose over amber and vanilla.",
    description:
      "Golden Saffron opens hot — saffron and cinnamon — before rose and oud settle in at the heart. The base is pure amber and vanilla. Rich, spiced, and built to last well past a full day of wear.",
    highlights: [
      "Saffron-forward opening, genuinely spiced",
      "Rose-and-oud heart with serious staying power",
      "One of the longest wear times in the collection",
    ],
    notes: {
      top: ["Saffron", "Cinnamon"],
      heart: ["Rose", "Oud"],
      base: ["Amber", "Vanilla"],
    },
    image: "/products/product-golden-saffron.png",
    badge: "New",
    sizes: [
      { ml: 30, price: 110 },
      { ml: 50, price: 165 },
      { ml: 100, price: 239 },
    ],
  },
];

export function getAllProducts(): Product[] {
  return PRODUCTS;
}

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((product) => product.slug === slug);
}

/** The size shown as "the" price on grid cards and badges — the middle (50ml) bottle. */
export function getDefaultSize(product: Product): { ml: number; price: number } {
  return product.sizes[1] ?? product.sizes[0];
}

export function getStartingPrice(product: Product): number {
  return Math.min(...product.sizes.map((size) => size.price));
}

export function getRelatedProducts(slug: string, count = 3): Product[] {
  const current = getProductBySlug(slug);
  if (!current) return [];

  const sameFamily = PRODUCTS.filter(
    (product) => product.slug !== slug && product.family === current.family
  );
  const others = PRODUCTS.filter(
    (product) => product.slug !== slug && product.family !== current.family
  );

  return [...sameFamily, ...others].slice(0, count);
}
