"use client";

import { AnimatePresence, motion, useReducedMotion, type PanInfo } from "motion/react";
import { Pause, Play } from "lucide-react";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { Header } from "./Header";
import { PillNav } from "./PillNav";
import { Slide } from "./Slide";
import { canVariants, DURATION, EASE, type CanGeometry, type Direction } from "./motion";
import type { Product } from "./types";

export type ProductShowcaseProps = {
  products: Product[];
  /** Advance automatically. Ignored when the user prefers reduced motion. */
  autoplay?: boolean;
  /** Milliseconds per product, transition included. The reference uses ~1800. */
  interval?: number;
  initialIndex?: number;
  onAddToCart?: (product: Product) => void;
  onView?: (product: Product) => void;
  onChange?: (product: Product, index: number) => void;
  /** Playback speed for every animation and the autoplay clock. 0.25 = slow-mo. */
  speed?: number;
  /** Outline the layers and the wipe edge (breakdown shots, learning). */
  debug?: boolean;
  /** Hide the pause button, e.g. while filming. */
  hideControls?: boolean;
  className?: string;
};

type View = { index: number; direction: Direction; layer: number };

function createCanMotion() {
  let geometry: CanGeometry | null = null;
  return {
    measure: (g: CanGeometry) => {
      geometry = g;
    },
    variants: canVariants(() => geometry),
  };
}

export function ProductShowcase({
  products,
  autoplay = true,
  interval = 3000,
  initialIndex = 0,
  onAddToCart,
  onView,
  onChange,
  speed = 1,
  debug = false,
  hideControls = false,
  className = "",
}: ProductShowcaseProps) {
  const transition = useMemo(() => ({ duration: DURATION / speed, ease: EASE }), [speed]);
  const [view, setView] = useState<View>({ index: initialIndex, direction: 1, layer: 1 });
  const [userPaused, setUserPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [hidden, setHidden] = useState(false);
  const reducedMotion = useReducedMotion() ?? false;
  const rootRef = useRef<HTMLElement>(null);
  // The visible slide reports the can's layout; an exiting can reads it.
  const [canMotion] = useState(createCanMotion);

  const uid = useId();
  const ids = {
    tab: (i: number) => `${uid}-tab-${i}`,
    panel: (i: number) => `${uid}-panel-${i}`,
    pill: `${uid}-pill`,
  };

  const product = products[view.index];

  const go = useCallback(
    (to: number, direction?: Direction) => {
      setView((v) => {
        const index = (to + products.length) % products.length;
        if (index === v.index) return v;
        return {
          index,
          direction: direction ?? (to > v.index ? 1 : -1),
          layer: v.layer + 1,
        };
      });
    },
    [products.length],
  );

  useEffect(() => {
    onChange?.(products[view.index], view.index);
  }, [view.index, products, onChange]);

  // Warm the cache so no can pops in mid-transition.
  useEffect(() => {
    for (const p of products) new Image().src = p.image.src;
  }, [products]);

  // Pause when the tab is in the background or the showcase is off-screen.
  useEffect(() => {
    const el = rootRef.current;
    let offscreen = false;
    let tabHidden = document.hidden;
    const sync = () => setHidden(offscreen || tabHidden);
    const io = new IntersectionObserver(([entry]) => {
      offscreen = !entry.isIntersecting;
      sync();
    });
    const onVisibility = () => {
      tabHidden = document.hidden;
      sync();
    };
    if (el) io.observe(el);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const playing = autoplay && !reducedMotion && !userPaused && !hovering && !hidden;

  // Restarts on every change, so a click gives the new product a full interval.
  useEffect(() => {
    if (!playing) return;
    const t = window.setTimeout(() => go(view.index + 1, 1), interval / speed);
    return () => window.clearTimeout(t);
  }, [playing, view.index, interval, speed, go]);

  function onPanEnd(_: PointerEvent, info: PanInfo) {
    const { offset, velocity } = info;
    if (Math.abs(offset.x) < Math.abs(offset.y)) return; // vertical scroll, not a swipe
    if (offset.x < -50 || velocity.x < -400) go(view.index + 1, 1);
    else if (offset.x > 50 || velocity.x > 400) go(view.index - 1, -1);
  }

  return (
    <section
      ref={rootRef}
      aria-roledescription="carousel"
      aria-label="zuzu flavours"
      className={`@container/showcase relative isolate size-full overflow-hidden select-none ${className}`}
      style={{ background: product.theme.background }}
    >
      <motion.div className="absolute inset-0 touch-pan-y" onPanEnd={onPanEnd}>
        <AnimatePresence initial={false} custom={view.direction}>
          <Slide
            key={product.id}
            product={product}
            layer={view.layer}
            direction={view.direction}
            canVariants={canMotion.variants}
            onMeasure={canMotion.measure}
            transition={transition}
            debug={debug}
            panelId={ids.panel(view.index)}
            tabId={ids.tab(view.index)}
            reducedMotion={reducedMotion}
            onAddToCart={onAddToCart}
            onView={onView}
          />
        </AnimatePresence>
      </motion.div>

      <Header color={product.theme.foreground} transition={transition} />

      <div onPointerEnter={() => setHovering(true)} onPointerLeave={() => setHovering(false)}>
        <PillNav
          products={products}
          active={view.index}
          color={product.theme.foreground}
          accent={product.theme.accent}
          ids={ids}
          onSelect={(i) => go(i)}
          transition={transition}
        />
      </div>

      {autoplay && !reducedMotion && !hideControls && (
        <button
          type="button"
          onClick={() => setUserPaused((p) => !p)}
          aria-label={userPaused ? "Play slideshow" : "Pause slideshow"}
          className="absolute right-[2.2%] bottom-[11%] z-[1000] grid place-items-center rounded-full border border-current/45 p-[0.7em] text-[max(11px,0.85cqw)] transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-current @max-3xl/showcase:hidden"
          style={{ color: product.theme.foreground }}
        >
          {userPaused ? (
            <Play aria-hidden className="size-[1.2em]" />
          ) : (
            <Pause aria-hidden className="size-[1.2em]" />
          )}
        </button>
      )}

      <p aria-live={playing ? "off" : "polite"} className="sr-only">
        {product.name}
      </p>
    </section>
  );
}
