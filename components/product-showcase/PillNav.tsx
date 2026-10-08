"use client";

import { motion, type Transition } from "motion/react";
import type { KeyboardEvent } from "react";
import type { Product } from "./types";

type PillNavProps = {
  products: Product[];
  active: number;
  color: string;
  accent: string;
  ids: { tab: (i: number) => string; panel: (i: number) => string; pill: string };
  onSelect: (index: number) => void;
  transition: Transition;
};

export function PillNav({ products, active, color, accent, ids, onSelect, transition }: PillNavProps) {
  // Arrow keys move between tabs and select them (WAI-ARIA tabs pattern).
  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const last = products.length - 1;
    const next =
      e.key === "ArrowRight" ? (active === last ? 0 : active + 1)
      : e.key === "ArrowLeft" ? (active === 0 ? last : active - 1)
      : e.key === "Home" ? 0
      : e.key === "End" ? last
      : null;
    if (next === null) return;
    e.preventDefault();
    onSelect(next);
    document.getElementById(ids.tab(next))?.focus();
  }

  return (
    <motion.div
      role="tablist"
      aria-label="Flavours"
      onKeyDown={onKeyDown}
      className="absolute bottom-[11%] left-1/2 z-[1000] flex max-w-[94%] -translate-x-1/2 gap-[0.2em] overflow-x-auto rounded-full border border-current/45 p-[0.3em] font-condensed text-[max(11px,0.85cqw)] font-semibold tracking-wider [scrollbar-width:none] @max-3xl/showcase:bottom-[4.5%] @max-3xl/showcase:text-[2.75cqw]"
      initial={false}
      animate={{ color }}
      transition={transition}
    >
      {products.map((p, i) => {
        const selected = i === active;
        return (
          <button
            key={p.id}
            id={ids.tab(i)}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={ids.panel(i)}
            tabIndex={selected ? 0 : -1}
            onClick={() => onSelect(i)}
            className="relative shrink-0 rounded-full px-[1.25em] py-[0.7em] @max-3xl/showcase:px-[0.95em] whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-current"
          >
            {selected && (
              // Shared layoutId = the pill glides between tabs, like Smart Animate.
              <motion.span
                layoutId={ids.pill}
                className="absolute inset-0 rounded-full bg-white"
                transition={transition}
              />
            )}
            <motion.span
              className="relative"
              initial={false}
              animate={{ color: selected ? accent : color }}
              // Faster than the slide so the label never reads white-on-white.
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {p.navLabel}
            </motion.span>
          </button>
        );
      })}
    </motion.div>
  );
}
