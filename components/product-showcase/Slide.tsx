"use client";

import { motion, useIsPresent } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Transition, Variants } from "motion/react";
import { ArrowUpRight, Plus } from "lucide-react";
import { Wordmark } from "./wordmark";
import * as m from "./motion";
import type { CanGeometry, Direction } from "./motion";
import type { Product } from "./types";

const debugTag =
  "pointer-events-none absolute z-20 rounded-full bg-black/75 px-[0.8em] py-[0.35em] font-mono text-[max(10px,0.75cqw)] font-medium tracking-wide whitespace-nowrap text-white";

type SlideProps = {
  product: Product;
  /** Stacking order: each new slide must sit above the one it wipes over. */
  layer: number;
  /** Direction this slide entered with. Exits read the live value from AnimatePresence. */
  direction: Direction;
  /** Can motion, built by the parent from the measured layout. */
  canVariants: Variants;
  /** Reports the can's layout so its exit can be sized to clear the frame. */
  onMeasure: (geometry: CanGeometry) => void;
  /** Shared slide transition (scaled by the showcase's speed prop). */
  transition: Transition;
  /** Outline the layers and the wipe edge, for breakdown shots. */
  debug?: boolean;
  panelId: string;
  tabId: string;
  reducedMotion: boolean;
  onAddToCart?: (product: Product) => void;
  onView?: (product: Product) => void;
};

export function Slide({
  product,
  layer,
  direction,
  canVariants,
  onMeasure,
  transition,
  debug = false,
  panelId,
  tabId,
  reducedMotion,
  onAddToCart,
  onView,
}: SlideProps) {
  const { theme, image } = product;
  const isPresent = useIsPresent();
  // Only show the wipe-edge marker while this slide is actually wiping in.
  const [wiping, setWiping] = useState(true);
  const canBox = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = canBox.current;
    const stage = box?.offsetParent;
    if (!box || !(stage instanceof HTMLElement)) return;
    // offsetLeft ignores transforms, so with left:X% it is the can's centre.
    const measure = () => {
      onMeasure({ center: box.offsetLeft, width: box.offsetWidth, stage: stage.clientWidth });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    return () => ro.disconnect();
  }, [onMeasure]);

  return (
    <motion.div
      id={panelId}
      role="tabpanel"
      aria-labelledby={tabId}
      inert={!isPresent}
      className="absolute inset-0 overflow-hidden"
      style={{ zIndex: layer }}
      custom={direction}
      variants={reducedMotion ? m.fade : m.mask}
      initial="enter"
      animate="center"
      exit="exit"
      transition={reducedMotion ? m.reducedTransition : transition}
      onAnimationComplete={(def) => def === "center" && setWiping(false)}
    >
      {debug && wiping && isPresent && layer > 1 && (
        // The outer layer's left edge *is* the wipe edge.
        <div className="pointer-events-none absolute inset-y-0 left-0 z-30 w-[3px] bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]">
          <span className={`${debugTag} top-[32%] left-[8px]`}>WIPE EDGE</span>
        </div>
      )}
      <motion.div
        className="absolute inset-0"
        style={{ background: theme.background }}
        custom={direction}
        variants={reducedMotion ? m.still : m.counterMask}
        transition={transition}
      >
        {/* Giant wordmark, bleeding off the left edge */}
        <Wordmark
          aria-hidden
          className="absolute top-[49%] left-[-3%] w-[60%] -translate-y-1/2 @max-3xl/showcase:top-[22%] @max-3xl/showcase:left-[-5%] @max-3xl/showcase:w-[110%]"
          style={{ color: theme.wordmark }}
        />

        {debug && (
          <span className={`${debugTag} top-[14%] left-[3%]`}>
            LAYER 1 · BACKGROUND · stays put, revealed by the wipe
          </span>
        )}

        {/* Band with claims, running from behind the can to the right edge */}
        <div
          className="absolute top-[46%] right-0 left-[46%] flex h-[3.4%] min-h-5 items-center gap-[9%] pl-[17%] font-condensed text-[max(10px,1.15cqw)] font-bold tracking-wide @max-3xl/showcase:top-[51%] @max-3xl/showcase:left-0 @max-3xl/showcase:justify-between @max-3xl/showcase:px-[4%] @max-3xl/showcase:text-[3.2cqw]"
          style={{ background: theme.stripe, color: theme.stripeText }}
        >
          {product.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>

        {/* The can: the fast-moving parallax layer */}
        <div
          ref={canBox}
          className="absolute top-[14%] left-[55%] aspect-[2/5] h-[62%] -translate-x-1/2 @max-3xl/showcase:top-[23%] @max-3xl/showcase:left-1/2 @max-3xl/showcase:h-[47%]"
        >
          <motion.div
            className={`size-full ${debug ? "rounded-[6%] outline-2 outline-offset-4 outline-white outline-dashed" : ""}`}
            custom={direction}
            variants={reducedMotion ? m.still : canVariants}
            transition={transition}
          >
            {debug && (
              <span className={`${debugTag} -top-[7%] left-1/2 -translate-x-1/2`}>
                LAYER 2 · CAN · parallax
              </span>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element -- framework-agnostic on purpose */}
            <img
              src={image.src}
              width={image.width}
              height={image.height}
              alt={image.alt}
              draggable={false}
              decoding="async"
              className="size-full object-contain drop-shadow-[0_2.5cqw_2cqw_rgba(0,0,0,0.35)] select-none"
            />
          </motion.div>
        </div>

        {/* Name + actions */}
        <div
          className="absolute top-[53%] left-[64.5%] font-condensed @max-3xl/showcase:top-auto @max-3xl/showcase:bottom-[15%] @max-3xl/showcase:left-1/2 @max-3xl/showcase:-translate-x-1/2 @max-3xl/showcase:text-center"
          style={{ color: theme.foreground }}
        >
          <h2 className="text-[max(14px,1.45cqw)] font-semibold tracking-wide whitespace-nowrap @max-3xl/showcase:text-[4.6cqw]">
            {product.name}
          </h2>
          <div className="mt-[max(10px,1.1cqw)] flex items-center gap-[max(6px,0.5cqw)] @max-3xl/showcase:justify-center">
            <button
              type="button"
              onClick={() => onAddToCart?.(product)}
              className="flex items-center gap-[0.6em] rounded-full border border-current px-[1.4em] py-[0.7em] text-[max(10px,0.78cqw)] font-semibold tracking-wider transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current @max-3xl/showcase:text-[3.2cqw]"
            >
              <Plus aria-hidden className="size-[1.3em]" strokeWidth={2.5} />
              ADD TO CART
            </button>
            <button
              type="button"
              onClick={() => onView?.(product)}
              aria-label={`View ${product.name}`}
              className="grid aspect-square place-items-center rounded-full border border-current p-[0.7em] text-[max(10px,0.78cqw)] transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current @max-3xl/showcase:text-[3.2cqw]"
            >
              <ArrowUpRight aria-hidden className="size-[1.3em]" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
