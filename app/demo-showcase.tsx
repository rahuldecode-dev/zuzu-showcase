"use client";

import { useSyncExternalStore } from "react";
import { ProductShowcase } from "@/components/product-showcase";
import { products } from "@/data/products";
import { GetCode } from "./get-code";

/*
 * URL controls for filming and demos:
 *   ?bpm=128          sync autoplay to a song (one product per 4 beats; &beats=2 to change)
 *   ?interval=2000    ms per product (ignored if bpm is set)
 *   ?speed=0.25       slow motion
 *   ?debug=1          outline the layers and the wipe edge
 *   ?film=1           hide the pause button and the cursor
 *   ?autoplay=0       manual only
 *   ?start=cola       first product id
 */
const noop = () => () => {};
const getSearch = () => window.location.search;
const getServerSearch = () => "";

export function DemoShowcase() {
  const params = new URLSearchParams(useSyncExternalStore(noop, getSearch, getServerSearch));
  const num = (key: string) => {
    const v = Number(params.get(key));
    return Number.isFinite(v) && v > 0 ? v : undefined;
  };

  const bpm = num("bpm");
  // Default 1800 ms matches the pace of the reference video.
  const interval = bpm ? (60_000 / bpm) * (num("beats") ?? 4) : (num("interval") ?? 1800);
  const film = params.get("film") === "1";
  const start = Math.max(0, products.findIndex((p) => p.id === params.get("start")));

  return (
    <main className={`relative h-dvh ${film ? "cursor-none" : ""}`}>
      <ProductShowcase
        // Remount when the start product changes (initialIndex is read once).
        key={start}
        products={products}
        initialIndex={start}
        interval={interval}
        speed={num("speed") ?? 1}
        debug={params.get("debug") === "1"}
        autoplay={params.get("autoplay") !== "0"}
        hideControls={film}
      />
      {!film && <GetCode />}
    </main>
  );
}
