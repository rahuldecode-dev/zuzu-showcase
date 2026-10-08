import type { Product } from "@/components/product-showcase/types";

// Swap this file to rebrand the whole showcase.
// Palette follows the reference: navy, red, grey, yellow-green.
const can = (id: string, alt: string) => ({
  src: `/products/${id}.webp`,
  width: 960,
  height: 2400,
  alt,
});

export const products: Product[] = [
  {
    id: "volt",
    navLabel: "ZUZU VOLT",
    name: "VOLT BLUE RASPBERRY",
    tags: ["ZERO SUGAR", "80MG CAFFEINE"],
    image: can("volt", "zuzu Volt blue raspberry energy can"),
    theme: {
      background: "#10016c",
      wordmark: "#ffffff",
      stripe: "#ffffff",
      stripeText: "#10016c",
      foreground: "#ffffff",
      accent: "#10016c",
    },
  },
  {
    id: "cola",
    navLabel: "ZUZU COLA",
    name: "KALA KHATTA COLA",
    tags: ["ZERO SUGAR", "ZERO CALORIES"],
    image: can("cola", "zuzu Kala Khatta cola can"),
    theme: {
      background: "linear-gradient(120deg, #b51b23 0%, #c8232a 45%, #d63a33 100%)",
      wordmark: "#ffffff",
      stripe: "#ffffff",
      stripeText: "#c8232a",
      foreground: "#ffffff",
      accent: "#c8232a",
    },
  },
  {
    id: "zero",
    navLabel: "ZUZU ZERO",
    name: "ZERO VANILLA CREAM SODA",
    tags: ["ZERO SUGAR", "ZERO CALORIES"],
    image: can("zero", "zuzu Zero vanilla cream soda can"),
    theme: {
      background: "linear-gradient(120deg, #aaaaaa 0%, #b4b4b5 60%, #bdbdbe 100%)",
      wordmark: "#c8102e",
      stripe: "#c8102e",
      stripeText: "#ffffff",
      foreground: "#ffffff",
      accent: "#c8102e",
    },
  },
  {
    id: "hydrate",
    navLabel: "ZUZU HYDRATE+",
    name: "HYDRATE+ NIMBU LIME",
    tags: ["ELECTROLYTES", "ZERO SUGAR"],
    image: can("hydrate", "zuzu Hydrate+ nimbu lime can"),
    theme: {
      background: "linear-gradient(120deg, #f6dd00 0%, #c9c705 45%, #95ad0e 100%)",
      wordmark: "#ffffff",
      stripe: "#ffffff",
      stripeText: "#7d9a0c",
      foreground: "#ffffff",
      accent: "#6f8a0a",
    },
  },
];
