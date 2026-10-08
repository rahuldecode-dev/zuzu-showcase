"use client";

import { motion, type Transition } from "motion/react";
import { Heart, Menu, Search, ShoppingBag, User } from "lucide-react";
import { Wordmark } from "./wordmark";

const iconButton =
  "grid place-items-center rounded-full p-[0.35em] transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-current";

export function Header({ color, transition }: { color: string; transition: Transition }) {
  return (
    <motion.header
      className="absolute inset-x-0 top-0 z-[1000] flex items-center justify-between px-[2.2%] pt-[1.4%] text-[max(12px,0.95cqw)] @max-3xl/showcase:px-[4%] @max-3xl/showcase:pt-[4%] @max-3xl/showcase:text-[3.6cqw]"
      initial={false}
      animate={{ color }}
      transition={transition}
    >
      <button type="button" className={`${iconButton} flex! gap-[0.5em] pr-[0.8em] font-condensed font-semibold tracking-wider`}>
        <Menu aria-hidden className="size-[1.3em]" />
        <span className="@max-3xl/showcase:sr-only">SHOP ALL</span>
      </button>

      <a href="#" aria-label="zuzu home" className="absolute left-1/2 -translate-x-1/2">
        <Wordmark className="h-[2.2em] w-auto" />
      </a>

      <nav aria-label="Account" className="flex items-center gap-[0.4em]">
        <button type="button" aria-label="Search" className={iconButton}>
          <Search aria-hidden className="size-[1.3em]" />
        </button>
        <button type="button" aria-label="Wishlist" className={`${iconButton} @max-3xl/showcase:hidden`}>
          <Heart aria-hidden className="size-[1.3em]" />
        </button>
        <button type="button" aria-label="Account" className={`${iconButton} @max-3xl/showcase:hidden`}>
          <User aria-hidden className="size-[1.3em]" />
        </button>
        <button type="button" aria-label="Cart" className={iconButton}>
          <ShoppingBag aria-hidden className="size-[1.3em]" />
        </button>
      </nav>
    </motion.header>
  );
}
