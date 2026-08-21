import type { Product, ScentFamily } from "@/lib/types";

export const SCENT_FAMILIES: ScentFamily[] = [
  "Floral",
  "Woody",
  "Oriental",
  "Fresh",
  "Gourmand",
];

export const SCENT_FAMILY_IMAGES: Record<ScentFamily, string> = {
  Floral: "/products/category-floral.png",
  Woody: "/products/category-woody.png",
  Oriental: "/products/category-oriental.png",
  Fresh: "/products/category-fresh.png",
  Gourmand: "/products/category-gourmand.png",
};

/**
 * Same underlying scent set (family/notes/price) as the sibling Ambre
 * template — both templates share one editorial macro-photography set (see
 * DESIGN.md: no new photoshoot/image-generation tool available in this
 * session). Renamed and rewritten for NOCTURNE's brand voice: darker,
 * shorter, more intense, no "small-batch editorial" framing.
 */
export const PRODUCTS: Product[] = [
  {
    slug: "velvet-oud",
    name: "Oud Rouge",
    family: "Oriental",
    concentration: "Eau de Parfum",
    tagline: "Smoked oud and rose, lit by saffron.",
    description:
      "Oud Rouge opens hot — saffron first, then a wall of Bulgarian rose over dark oud. It doesn't soften. The dry-down is amber and sandalwood, and it's still on your skin the next morning.",
    highlights: [
      "Built to be the loudest thing in the room",
      "Hand-blended in small batches, no reformulation between runs",
      "Unisex — wears with equal intensity on everyone",
    ],
    notes: {
      top: ["Saffron", "Bergamot"],
      heart: ["Rose", "Oud"],
      base: ["Amber", "Sandalwood"],
    },
    image: "/products/product-velvet-oud.png",
    badge: "Signature",
    sizes: [
      { ml: 30, price: 98 },
      { ml: 50, price: 148 },
      { ml: 100, price: 215 },
    ],
  },
  {
    slug: "citrus-noir",
    name: "Vetiver Noir",
    family: "Fresh",
    concentration: "Eau de Toilette",
    tagline: "Black pepper and vetiver, cut with Sicilian lemon.",
    description:
      "Vetiver Noir starts sharp — lemon and bergamot with no warning — then black pepper and vetiver take over. The dry-down is musk and cedar: clean, but never soft.",
    highlights: [
      "Eau de Toilette — lighter concentration, still reads dark",
      "Citrus opening that lasts, not a five-minute flash",
      "A grounding dry-down built for cold rooms",
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
    name: "Rose Nocturne",
    family: "Floral",
    concentration: "Eau de Parfum",
    tagline: "A true rose after dark — no candy, no shortcuts.",
    description:
      "Pink pepper and litchi open Rose Nocturne before Bulgarian rose and peony take the center. Musk and vanilla hold the base down. This is what a rose actually smells like at midnight.",
    highlights: [
      "Bulgarian rose at the center, not a top-note trick",
      "Settles into skin within twenty minutes — no harsh opening",
      "Our most reordered scent, by a wide margin",
    ],
    notes: {
      top: ["Pink Pepper", "Litchi"],
      heart: ["Rose", "Peony"],
      base: ["Musk", "Vanilla"],
    },
    image: "/products/product-rose-absolute.png",
    badge: "Signature",
    sizes: [
      { ml: 30, price: 88 },
      { ml: 50, price: 128 },
      { ml: 100, price: 189 },
    ],
  },
  {
    slug: "amber-musk",
    name: "Amber Eclipse",
    family: "Oriental",
    concentration: "Eau de Parfum",
    tagline: "Dense amber and labdanum, closed off with white musk.",
    description:
      "Mandarin and cardamom flash at the top, then Amber Eclipse settles into a resinous amber-labdanum heart that doesn't move. White musk holds it against skin for hours. Apply to pulse points and leave it alone.",
    highlights: [
      "Dense, resinous amber heart — not a light amber wash",
      "Skin-scent longevity: still detectable 8+ hours later",
      "Layers cleanly under Oud Rouge or Midnight Leather",
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
    name: "Midnight Tide",
    family: "Fresh",
    concentration: "Eau de Parfum",
    tagline: "Cold sea spray and water lily over driftwood musk.",
    description:
      "Midnight Tide opens cold — salt air, then water lily and jasmine at the heart. The base is driftwood and musk: coastline at night, not a swimming pool.",
    highlights: [
      "Reads coastline, not laundry-aisle \"clean\"",
      "Water lily heart note, rare at this price point",
      "A reliable warm-weather scent that still has edge",
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
    name: "Tonka Noir",
    family: "Gourmand",
    concentration: "Eau de Parfum",
    tagline: "Bourbon vanilla and tonka bean, grounded in sandalwood.",
    description:
      "Tonka Noir leans all the way into gourmand — real bourbon vanilla pods, tonka bean, a soft caramel accord — but sandalwood keeps it out of dessert territory. A cold-weather signature, not a candle.",
    highlights: [
      "Real bourbon vanilla, not a one-note sweetener",
      "Sandalwood base keeps it wearable, not sugary",
      "One of the warmest scents in the collection",
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
    name: "Jasmine After Dark",
    family: "Floral",
    concentration: "Eau de Parfum",
    tagline: "Full-volume jasmine and tuberose, brightened with neroli.",
    description:
      "Jasmine After Dark doesn't do quiet florals — jasmine sambac and tuberose at full volume, neroli and mandarin up top to keep it from tipping heavy. Cedar and musk hold the base.",
    highlights: [
      "Full-volume white floral, not a diluted version",
      "Neroli top note keeps it from reading dated",
      "Best worn after sundown, warm weather or not",
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
    name: "Smoked Cedar",
    family: "Woody",
    concentration: "Eau de Parfum",
    tagline: "Smoked birch and cedarwood, sharpened with black pepper.",
    description:
      "Black pepper and cardamom open Smoked Cedar, then a dry cedarwood-and-vetiver heart takes over before finishing on smoked birch and leather. Our darkest, driest woody — built for cold air.",
    highlights: [
      "Dry-down reads campfire, not cologne aisle",
      "Cardamom keeps the opening from going harsh",
      "Pairs with knitwear and low temperatures",
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
    name: "Bergamot Eclipse",
    family: "Fresh",
    concentration: "Eau de Toilette",
    tagline: "Bergamot and grapefruit, cooled with green tea.",
    description:
      "Bergamot Eclipse is the lightest scent in the collection — bergamot and grapefruit up top, green tea and mint at the heart, a soft white-musk base. Everyday wear, not a statement — but never plain.",
    highlights: [
      "The lightest, most wearable scent we make",
      "Green tea heart keeps the citrus from going sour",
      "Layers well under Oud Rouge for daytime-to-evening",
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
      "Midnight Leather is the boldest thing we make — black currant and saffron up top, a leather-and-iris heart, oud and tobacco underneath. Small-batch, limited run. Wears best alone, at night.",
    highlights: [
      "The boldest, longest-throw scent in the collection",
      "Leather-and-oud base with real depth, not a synthetic wash",
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
    name: "Iris Obscura",
    family: "Floral",
    concentration: "Eau de Parfum",
    tagline: "Powdery iris and violet leaf, over cashmere wood.",
    description:
      "Iris Obscura is a powdery floral without the dated feel — iris and a soft powder accord at the center, violet leaf and bergamot up top, cashmere wood and musk underneath. Elegant, a little severe, never loud.",
    highlights: [
      "Classic powdery style, with a lighter, darker base",
      "Iris root is genuinely expensive to source — it shows",
      "A quieter, colder floral than the rest of the collection",
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
    name: "Saffron Noir",
    family: "Oriental",
    concentration: "Eau de Parfum",
    tagline: "Saffron and rose over amber and vanilla.",
    description:
      "Saffron Noir opens hot — saffron and cinnamon — before rose and oud settle into the heart. The base is pure amber and vanilla. Spiced, rich, built to outlast a full night out.",
    highlights: [
      "Saffron-forward opening, genuinely spiced, not sweetened",
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
