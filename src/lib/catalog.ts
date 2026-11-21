// AURELLE catalog — original demo catalogue.
// All products are demo entries for development and are clearly labelled as such.

export type CategorySlug =
  | "rings"
  | "bracelets"
  | "necklaces"
  | "earrings"
  | "pendants"
  | "chains"
  | "pearls"
  | "silver"
  | "accessories";

export type CollectionSlug =
  | "signature"
  | "essentials"
  | "modern-classics"
  | "statement"
  | "gift"
  | "best-sellers"
  | "new-arrivals";

export interface Category {
  slug: CategorySlug;
  name: string;
  blurb: string;
}

export interface Collection {
  slug: CollectionSlug;
  name: string;
  description: string;
  image: string;
}

export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  verified: boolean;
}

export interface Product {
  handle: string;
  name: string;
  category: CategorySlug;
  collections: CollectionSlug[];
  price: number; // INR
  compareAtPrice?: number;
  material: string;
  color: string;
  sizes: string[];
  images: string[];
  description: string;
  details: string[];
  stock: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  rating: number;
  reviewCount: number;
  reviews: ProductReview[];
  demo?: boolean;
}

const img = (id: string, w = 900) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const CATEGORIES: Category[] = [
  { slug: "rings", name: "Rings", blurb: "Signets, bands and statement stones" },
  { slug: "bracelets", name: "Bracelets", blurb: "Cuffs, chains and tennis lines" },
  { slug: "necklaces", name: "Necklaces", blurb: "Pendants, chokers and layers" },
  { slug: "earrings", name: "Earrings", blurb: "Studs, drops and architectural forms" },
  { slug: "pendants", name: "Pendants", blurb: "Personal symbols, finished in gold" },
  { slug: "chains", name: "Chains", blurb: "Fine links for layering" },
  { slug: "pearls", name: "Pearls", blurb: "Cultured pearls, quietly luminous" },
  { slug: "silver", name: "Sterling Silver", blurb: "Hallmarked 925 silver pieces" },
  { slug: "accessories", name: "Accessories", blurb: "Cases, cloths and considered extras" },
];

export const COLLECTIONS: Collection[] = [
  {
    slug: "signature",
    name: "Signature Collection",
    description:
      "The pieces that define the AURELLE house — restrained, architectural, made to be kept.",
    image: img("1515562141207-7a88fb7ce338", 1200),
  },
  {
    slug: "essentials",
    name: "Everyday Essentials",
    description: "Fine jewellery for daily ritual — light, layered and endlessly wearable.",
    image: img("1611085583191-a3b181a88401", 1200),
  },
  {
    slug: "modern-classics",
    name: "Modern Classics",
    description: "Timeless silhouettes re-drawn for the modern wardrobe.",
    image: img("1602173574767-37ac01994b2a", 1200),
  },
  {
    slug: "statement",
    name: "Statement Pieces",
    description: "Bold forms for the moments that matter.",
    image: img("1535632066927-ab7c9ab60908", 1200),
  },
  {
    slug: "gift",
    name: "Gift Collection",
    description: "Considered presents, presented in our signature keepsake box.",
    image: img("1611591437281-460bfbe1220a", 1200),
  },
  {
    slug: "best-sellers",
    name: "Best Sellers",
    description: "The pieces our customers return to again and again.",
    image: img("1599643478518-a784e5dc4c8f", 1200),
  },
  {
    slug: "new-arrivals",
    name: "New Arrivals",
    description: "Fresh from the atelier — just landed.",
    image: img("1617038220319-276d3cfab638", 1200),
  },
];

const RING_SIZES = ["6", "7", "8", "9", "10", "11", "12"];
const BRACELET_SIZES = ["S", "M", "L", "XL"];
const NECKLACE_SIZES = ["16 in", "18 in", "20 in", "22 in"];
const ONE_SIZE = ["One Size"];

export const PRODUCTS: Product[] = [
  {
    handle: "aurelle-signature-signet-ring",
    name: "AURELLE Signature Signet Ring",
    category: "rings",
    collections: ["signature", "best-sellers", "modern-classics", "gift"],
    price: 12499,
    compareAtPrice: 14999,
    material: "18k Gold Vermeil on Sterling Silver",
    color: "Gold",
    sizes: RING_SIZES,
    images: [
      img("1515562141207-7a88fb7ce338"),
      img("1602173574767-37ac01994b2a"),
      img("1611652022419-a9419f74343d"),
    ],
    description:
      "A quietly monumental signet, hand-finished with a softly domed face and a flat polished edge. Designed to be worn daily and inherited eventually.",
    details: [
      "18k gold vermeil over recycled sterling silver",
      "Hand-polished domed face",
      "Hypoallergenic, nickel-free",
      "Presented in AURELLE keepsake box",
    ],
    stock: 14,
    isBestSeller: true,
    rating: 4.8,
    reviewCount: 212,
    reviews: [
      {
        id: "r1",
        author: "Ananya S.",
        rating: 5,
        title: "Heirloom quality",
        body: "The weight and finish feel far above the price. Worn it daily for a month — still flawless.",
        date: "2026-10-02",
        verified: true,
      },
      {
        id: "r2",
        author: "Rohan M.",
        rating: 5,
        title: "Perfect signet",
        body: "Exactly the minimalist signet I wanted. Sizing was accurate.",
        date: "2026-09-18",
        verified: true,
      },
    ],
  },
  {
    handle: "lumiere-tennis-bracelet",
    name: "Lumière Tennis Bracelet",
    category: "bracelets",
    collections: ["signature", "best-sellers", "statement"],
    price: 18999,
    material: "18k Gold Vermeil, Cubic Zirconia",
    color: "Gold",
    sizes: BRACELET_SIZES,
    images: [
      img("1535632066927-ab7c9ab60908"),
      img("1601121141461-9d6647bca1ed"),
      img("1611085583191-a3b181a88401"),
    ],
    description:
      "A continuous line of hand-set cubic zirconia in a flexible gold link. Catches light with every gesture — our most requested piece.",
    details: [
      "18k gold vermeil",
      "Hand-set cubic zirconia",
      "Flexible link construction",
      "Secure box clasp",
    ],
    stock: 8,
    isBestSeller: true,
    rating: 4.9,
    reviewCount: 164,
    reviews: [
      {
        id: "r3",
        author: "Meera K.",
        rating: 5,
        title: "Stunning in person",
        body: "Photos don't do it justice. The sparkle is unreal and it feels substantial.",
        date: "2026-10-11",
        verified: true,
      },
    ],
  },
  {
    handle: "solstice-drop-earrings",
    name: "Solstice Drop Earrings",
    category: "earrings",
    collections: ["signature", "statement", "new-arrivals"],
    price: 8999,
    compareAtPrice: 10999,
    material: "18k Gold Vermeil",
    color: "Gold",
    sizes: ONE_SIZE,
    images: [
      img("1599643478518-a784e5dc4c8f"),
      img("1617038220319-276d3cfab638"),
      img("1611085583191-a3b181a88401"),
    ],
    description:
      "Architectural drop earrings with a faceted golden finish. Light as air, dramatic in effect.",
    details: [
      "18k gold vermeil",
      "Hypoallergenic posts",
      "Approx. 3.5 cm drop",
      "Includes silicone backs",
    ],
    stock: 22,
    isNew: true,
    rating: 4.7,
    reviewCount: 58,
    reviews: [
      {
        id: "r4",
        author: "Ishita R.",
        rating: 5,
        title: "New favourite",
        body: "These go with everything — office to evening.",
        date: "2026-11-02",
        verified: true,
      },
    ],
  },
  {
    handle: "heritage-pearl-stud-set",
    name: "Heritage Pearl Stud Set",
    category: "pearls",
    collections: ["essentials", "modern-classics", "gift"],
    price: 7499,
    material: "Freshwater Pearls, 18k Gold Vermeil",
    color: "Ivory",
    sizes: ONE_SIZE,
    images: [
      img("1598560917505-59a3ad559071"),
      img("1611591437281-460bfbe1220a"),
      img("1611085583191-a3b181a88401"),
    ],
    description:
      "A pair of lustrous freshwater pearls set in warm gold. The definitive everyday luxury.",
    details: [
      "Freshwater pearls, 6–7 mm",
      "18k gold vermeil settings",
      "Nickel-free",
      "Presented in keepsake box",
    ],
    stock: 17,
    isBestSeller: true,
    rating: 4.8,
    reviewCount: 143,
    reviews: [
      {
        id: "r5",
        author: "Priya N.",
        rating: 5,
        title: "Classic done right",
        body: "Beautiful lustre and a secure butterfly back. Gifted one pair, kept one.",
        date: "2026-09-27",
        verified: true,
      },
    ],
  },
  {
    handle: "noir-cuban-chain",
    name: "Noir Cuban Chain",
    category: "chains",
    collections: ["modern-classics", "essentials"],
    price: 9999,
    compareAtPrice: 11999,
    material: "Sterling Silver 925, Black Rhodium",
    color: "Black",
    sizes: ["18 in", "20 in", "22 in", "24 in"],
    images: [
      img("1611085583191-a3b181a88401"),
      img("1605100804763-247f67b3557e"),
      img("1515562141207-7a88fb7ce338"),
    ],
    description:
      "A bold Cuban link chain finished in deep black rhodium over solid sterling silver. Substantial, architectural, unmistakable.",
    details: [
      "Solid sterling silver 925",
      "Black rhodium plating",
      "5 mm link width",
      "Includes extender chain",
    ],
    stock: 11,
    rating: 4.6,
    reviewCount: 77,
    reviews: [
      {
        id: "r6",
        author: "Arjun V.",
        rating: 5,
        title: "Heavy and perfect",
        body: "Real silver weight, not plated zinc. The black finish is gorgeous.",
        date: "2026-10-05",
        verified: true,
      },
    ],
  },
  {
    handle: "atelier-gold-vermeil-hoops",
    name: "Atelier Gold Vermeil Hoops",
    category: "earrings",
    collections: ["essentials", "new-arrivals", "gift"],
    price: 6499,
    material: "18k Gold Vermeil",
    color: "Gold",
    sizes: ONE_SIZE,
    images: [
      img("1617038220319-276d3cfab638"),
      img("1599643478518-a784e5dc4c8f"),
      img("1611085583191-a3b181a88401"),
    ],
    description:
      "Featherweight gold hoops with a hand-hammered texture. The piece you will reach for every morning.",
    details: ["18k gold vermeil", "Hand-hammered finish", "18 mm diameter", "Secure latch closure"],
    stock: 26,
    isNew: true,
    rating: 4.7,
    reviewCount: 41,
    reviews: [],
  },
  {
    handle: "maison-layered-necklace",
    name: "Maison Layered Necklace",
    category: "necklaces",
    collections: ["essentials", "signature"],
    price: 8499,
    material: "18k Gold Vermeil, Freshwater Pearl",
    color: "Gold",
    sizes: NECKLACE_SIZES,
    images: [
      img("1611591437281-460bfbe1220a"),
      img("1598560917505-59a3ad559071"),
      img("1611085583191-a3b181a88401"),
    ],
    description:
      "Two fine chains — one plain, one with a single baroque pearl — designed to be worn together or apart.",
    details: [
      "18k gold vermeil",
      "Baroque freshwater pearl",
      "Adjustable 16–22 in",
      "Two-piece set",
    ],
    stock: 19,
    isBestSeller: true,
    rating: 4.8,
    reviewCount: 98,
    reviews: [
      {
        id: "r7",
        author: "Kavya D.",
        rating: 5,
        title: "Perfect layering",
        body: "Wore both together for a wedding and separately daily. Flawless.",
        date: "2026-10-20",
        verified: true,
      },
    ],
  },
  {
    handle: "regal-emerald-cut-ring",
    name: "Regal Emerald-Cut Ring",
    category: "rings",
    collections: ["statement", "gift"],
    price: 15999,
    compareAtPrice: 18999,
    material: "18k Gold Vermeil, Cubic Zirconia",
    color: "Gold",
    sizes: RING_SIZES,
    images: [
      img("1602173574767-37ac01994b2a"),
      img("1611652022419-a9419f74343d"),
      img("1515562141207-7a88fb7ce338"),
    ],
    description:
      "A bold emerald-cut cubic zirconia set in a sculptural gold bezel. Statement without shouting.",
    details: [
      "18k gold vermeil",
      "Emerald-cut cubic zirconia",
      "Bezel setting",
      "Presented in keepsake box",
    ],
    stock: 6,
    rating: 4.9,
    reviewCount: 33,
    reviews: [],
  },
  {
    handle: "serene-pearl-bracelet",
    name: "Serene Pearl Bracelet",
    category: "pearls",
    collections: ["essentials", "gift", "modern-classics"],
    price: 11499,
    material: "Freshwater Pearls, 18k Gold Vermeil",
    color: "Ivory",
    sizes: BRACELET_SIZES,
    images: [
      img("1598560917505-59a3ad559071"),
      img("1535632066927-ab7c9ab60908"),
      img("1611085583191-a3b181a88401"),
    ],
    description:
      "Graduated freshwater pearls on a fine gold chain. Quiet, luminous, endlessly elegant.",
    details: [
      "Freshwater pearls, 6–8 mm",
      "18k gold vermeil",
      "Adjustable length",
      "Presented in keepsake box",
    ],
    stock: 13,
    rating: 4.8,
    reviewCount: 61,
    reviews: [],
  },
  {
    handle: "vanguard-silver-cuff",
    name: "Vanguard Sterling Cuff",
    category: "silver",
    collections: ["modern-classics", "statement"],
    price: 5499,
    material: "Sterling Silver 925",
    color: "Silver",
    sizes: BRACELET_SIZES,
    images: [
      img("1535632066927-ab7c9ab60908"),
      img("1601121141461-9d6647bca1ed"),
      img("1611085583191-a3b181a88401"),
    ],
    description:
      "A sculptural open cuff in solid sterling silver with a brushed satin finish. Made to be stacked or worn alone.",
    details: [
      "Solid sterling silver 925",
      "Brushed satin finish",
      "Open cuff design",
      "Hallmarked",
    ],
    stock: 21,
    isBestSeller: true,
    rating: 4.7,
    reviewCount: 89,
    reviews: [
      {
        id: "r8",
        author: "Dev P.",
        rating: 5,
        title: "Real silver",
        body: "Stamped 925, heavy for its size. Stacks beautifully.",
        date: "2026-09-30",
        verified: true,
      },
    ],
  },
  {
    handle: "celeste-pendant",
    name: "Céleste Star Pendant",
    category: "pendants",
    collections: ["signature", "gift", "new-arrivals"],
    price: 7999,
    material: "18k Gold Vermeil, Cubic Zirconia",
    color: "Gold",
    sizes: NECKLACE_SIZES,
    images: [
      img("1611591437281-460bfbe1220a"),
      img("1599643478518-a784e5dc4c8f"),
      img("1611085583191-a3b181a88401"),
    ],
    description:
      "A faceted four-point star pendant on a fine cable chain. A modern talisman, finished by hand.",
    details: [
      "18k gold vermeil",
      "Faceted cubic zirconia centre",
      "18 in cable chain included",
      "Presented in keepsake box",
    ],
    stock: 16,
    isNew: true,
    rating: 4.8,
    reviewCount: 27,
    reviews: [],
  },
  {
    handle: "onyx-signet-ring",
    name: "Onyx Signet Ring",
    category: "rings",
    collections: ["statement", "modern-classics"],
    price: 13499,
    material: "Sterling Silver 925, Black Onyx",
    color: "Black",
    sizes: RING_SIZES,
    images: [
      img("1605100804763-247f67b3557e"),
      img("1602173574767-37ac01994b2a"),
      img("1515562141207-7a88fb7ce338"),
    ],
    description:
      "A black onyx set into a brushed sterling signet. Understated power, worn close to the hand.",
    details: [
      "Solid sterling silver 925",
      "Natural black onyx",
      "Brushed finish",
      "Presented in keepsake box",
    ],
    stock: 9,
    rating: 4.6,
    reviewCount: 44,
    reviews: [],
  },
  {
    handle: "threadbare-link-bracelet",
    name: "Threadbare Link Bracelet",
    category: "bracelets",
    collections: ["essentials", "modern-classics"],
    price: 4999,
    compareAtPrice: 5999,
    material: "18k Gold Vermeil",
    color: "Gold",
    sizes: BRACELET_SIZES,
    images: [
      img("1601121141461-9d6647bca1ed"),
      img("1535632066927-ab7c9ab60908"),
      img("1611085583191-a3b181a88401"),
    ],
    description:
      "Slim interlocking links in warm gold vermeil. The bracelet that disappears into your wrist — in the best way.",
    details: [
      "18k gold vermeil",
      "Slim link profile",
      "Magnetic clasp",
      "Water-resistant for daily wear",
    ],
    stock: 31,
    isBestSeller: true,
    rating: 4.7,
    reviewCount: 120,
    reviews: [
      {
        id: "r9",
        author: "Sana F.",
        rating: 5,
        title: "Everyday piece",
        body: "Forgot I was wearing it — that's the highest praise.",
        date: "2026-10-08",
        verified: true,
      },
    ],
  },
  {
    handle: "aurora-choker-necklace",
    name: "Aurora Choker Necklace",
    category: "necklaces",
    collections: ["statement", "new-arrivals"],
    price: 10499,
    material: "18k Gold Vermeil, Cubic Zirconia",
    color: "Gold",
    sizes: ["14 in", "16 in"],
    images: [
      img("1611591437281-460bfbe1220a"),
      img("1598560917505-59a3ad559071"),
      img("1611085583191-a3b181a88401"),
    ],
    description:
      "A graduated choker of hand-set cubic zirconia with a hidden extender. Modern, precise, unforgettable.",
    details: [
      "18k gold vermeil",
      "Hand-set cubic zirconia",
      "Hidden extender chain",
      "Presented in keepsake box",
    ],
    stock: 7,
    isNew: true,
    rating: 4.9,
    reviewCount: 19,
    reviews: [],
  },
  {
    handle: "solitaire-stud-earrings",
    name: "Solitaire Stud Earrings",
    category: "earrings",
    collections: ["essentials", "best-sellers", "gift"],
    price: 5999,
    material: "Freshwater Pearl, 18k Gold Vermeil",
    color: "Ivory",
    sizes: ONE_SIZE,
    images: [
      img("1599643478518-a784e5dc4c8f"),
      img("1617038220319-276d3cfab638"),
      img("1611085583191-a3b181a88401"),
    ],
    description:
      "A single lustrous pearl on a gold post. The smallest gesture with the largest effect.",
    details: [
      "Freshwater pearl, 7 mm",
      "18k gold vermeil",
      "Secure butterfly backs",
      "Presented in keepsake box",
    ],
    stock: 24,
    isBestSeller: true,
    rating: 4.8,
    reviewCount: 156,
    reviews: [
      {
        id: "r10",
        author: "Nisha T.",
        rating: 5,
        title: "Perfect studs",
        body: "Exactly what I needed — elegant without being fussy.",
        date: "2026-10-15",
        verified: true,
      },
    ],
  },
  {
    handle: "heritage-silver-chain",
    name: "Heritage Silver Chain",
    category: "silver",
    collections: ["essentials", "modern-classics"],
    price: 3999,
    compareAtPrice: 4999,
    material: "Sterling Silver 925",
    color: "Silver",
    sizes: ["16 in", "18 in", "20 in", "22 in", "24 in"],
    images: [
      img("1611085583191-a3b181a88401"),
      img("1605100804763-247f67b3557e"),
      img("1515562141207-7a88fb7ce338"),
    ],
    description:
      "A fine curb chain in solid sterling silver — the foundation piece for every layering story.",
    details: ["Solid sterling silver 925", "2 mm curb links", "Spring ring clasp", "Hallmarked"],
    stock: 40,
    rating: 4.6,
    reviewCount: 83,
    reviews: [],
  },
  {
    handle: "monogram-initial-pendant",
    name: "Monogram Initial Pendant",
    category: "pendants",
    collections: ["gift", "signature"],
    price: 6999,
    material: "18k Gold Vermeil",
    color: "Gold",
    sizes: NECKLACE_SIZES,
    images: [
      img("1611591437281-460bfbe1220a"),
      img("1602173574767-37ac01994b2a"),
      img("1611085583191-a3b181a88401"),
    ],
    description:
      "A hand-engraved initial disc on a fine chain. Personal, permanent, quietly profound.",
    details: [
      "18k gold vermeil",
      "Hand-engraved initial",
      "16 in chain included",
      "Presented in keepsake box",
    ],
    stock: 18,
    rating: 4.7,
    reviewCount: 52,
    reviews: [],
  },
  {
    handle: "dune-stackable-rings",
    name: "Dune Stackable Ring Set",
    category: "rings",
    collections: ["essentials", "new-arrivals"],
    price: 5499,
    material: "18k Gold Vermeil",
    color: "Gold",
    sizes: RING_SIZES,
    images: [
      img("1515562141207-7a88fb7ce338"),
      img("1602173574767-37ac01994b2a"),
      img("1611652022419-a9419f74343d"),
    ],
    description:
      "Three slim bands in graduated textures — polished, satin and rope — designed to be worn as one.",
    details: [
      "18k gold vermeil",
      "Set of three rings",
      "Mix-and-match textures",
      "Presented in keepsake box",
    ],
    stock: 15,
    isNew: true,
    rating: 4.5,
    reviewCount: 24,
    reviews: [],
  },
  {
    handle: "velvet-jewellery-case",
    name: "Velvet Keepsake Case",
    category: "accessories",
    collections: ["gift"],
    price: 1499,
    material: "Vegan Leather, Suede Lining",
    color: "Ivory",
    sizes: ONE_SIZE,
    images: [
      img("1611085583191-a3b181a88401"),
      img("1598560917505-59a3ad559071"),
      img("1611591437281-460bfbe1220a"),
    ],
    description:
      "A structured travel case in ivory vegan leather with a soft suede interior. Made to protect what matters.",
    details: [
      "Vegan leather exterior",
      "Suede-lined interior",
      "Holds up to 6 pieces",
      "Magnetic closure",
    ],
    stock: 35,
    rating: 4.6,
    reviewCount: 31,
    reviews: [],
  },
  {
    handle: "gilded-bangle-set",
    name: "Gilded Bangle Set",
    category: "bracelets",
    collections: ["statement", "gift"],
    price: 12999,
    compareAtPrice: 14999,
    material: "18k Gold Vermeil",
    color: "Gold",
    sizes: BRACELET_SIZES,
    images: [
      img("1535632066927-ab7c9ab60908"),
      img("1601121141461-9d6647bca1ed"),
      img("1611085583191-a3b181a88401"),
    ],
    description:
      "A trio of hinged bangles in brushed, polished and rope textures. Worn together, they become a signature.",
    details: [
      "18k gold vermeil",
      "Set of three bangles",
      "Hinged closures",
      "Presented in keepsake box",
    ],
    stock: 10,
    rating: 4.8,
    reviewCount: 47,
    reviews: [],
  },
  {
    handle: "pearl-drop-earrings",
    name: "Pearl Drop Earrings",
    category: "earrings",
    collections: ["essentials", "gift"],
    price: 8499,
    material: "Freshwater Pearls, 18k Gold Vermeil",
    color: "Ivory",
    sizes: ONE_SIZE,
    images: [
      img("1599643478518-a784e5dc4c8f"),
      img("1598560917505-59a3ad559071"),
      img("1617038220319-276d3cfab638"),
    ],
    description:
      "Baroque freshwater pearls suspended from delicate gold hooks. Movement, light and softness in one gesture.",
    details: [
      "Freshwater baroque pearls",
      "18k gold vermeil",
      "Approx. 2.5 cm drop",
      "Presented in keepsake box",
    ],
    stock: 12,
    rating: 4.7,
    reviewCount: 38,
    reviews: [],
  },
  {
    handle: "sterling-rope-chain",
    name: "Sterling Rope Chain",
    category: "chains",
    collections: ["essentials", "best-sellers"],
    price: 4499,
    material: "Sterling Silver 925",
    color: "Silver",
    sizes: ["16 in", "18 in", "20 in", "22 in", "24 in"],
    images: [
      img("1611085583191-a3b181a88401"),
      img("1605100804763-247f67b3557e"),
      img("1515562141207-7a88fb7ce338"),
    ],
    description:
      "A classic rope chain in solid sterling silver with a comfortable drape. The layer that goes under everything.",
    details: ["Solid sterling silver 925", "3 mm rope weave", "Spring ring clasp", "Hallmarked"],
    stock: 28,
    rating: 4.5,
    reviewCount: 66,
    reviews: [],
  },
  {
    handle: "eclipse-moon-pendant",
    name: "Eclipse Moon Pendant",
    category: "pendants",
    collections: ["statement", "new-arrivals"],
    price: 9499,
    compareAtPrice: 10999,
    material: "18k Gold Vermeil, Black Onyx",
    color: "Gold",
    sizes: NECKLACE_SIZES,
    images: [
      img("1611591437281-460bfbe1220a"),
      img("1605100804763-247f67b3557e"),
      img("1611085583191-a3b181a88401"),
    ],
    description:
      "A crescent of gold cradling a polished black onyx disc — an eclipse you can wear.",
    details: [
      "18k gold vermeil",
      "Polished black onyx",
      "18 in chain included",
      "Presented in keepsake box",
    ],
    stock: 8,
    isNew: true,
    rating: 4.9,
    reviewCount: 15,
    reviews: [],
  },
];

export function getProduct(handle: string): Product | undefined {
  return PRODUCTS.find((p) => p.handle === handle);
}

export function productsByCategory(slug: CategorySlug): Product[] {
  return PRODUCTS.filter((p) => p.category === slug);
}

export function productsByCollection(slug: CollectionSlug): Product[] {
  return PRODUCTS.filter((p) => p.collections.includes(slug));
}

export function bestSellers(): Product[] {
  return PRODUCTS.filter((p) => p.isBestSeller);
}

export function newArrivals(): Product[] {
  return PRODUCTS.filter((p) => p.isNew);
}

export function relatedProducts(product: Product, limit = 4): Product[] {
  return PRODUCTS.filter((p) => p.handle !== product.handle)
    .map((p) => ({
      p,
      score:
        (p.category === product.category ? 2 : 0) +
        p.collections.filter((c) => product.collections.includes(c)).length,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ p }) => p);
}

export function searchProducts(query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.category.includes(q) ||
      p.material.toLowerCase().includes(q) ||
      p.color.toLowerCase().includes(q) ||
      p.collections.some((c) => c.replace(/-/g, " ").includes(q)),
  );
}

export const FREE_SHIPPING_THRESHOLD = 1999;
export const SHIPPING_FLAT_RATE = 99;

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function discountPercent(product: Product): number | null {
  if (!product.compareAtPrice || product.compareAtPrice <= product.price) return null;
  return Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100);
}
