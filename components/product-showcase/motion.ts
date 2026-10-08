import type { Transition, Variants } from "motion/react";

// Figma: Smart animate · Custom bezier (0.6, 0.01, 0.11, 1) · 1000ms.
// Slow start, very fast middle, long soft landing.
export const EASE = [0.6, 0.01, 0.11, 1] as const;
export const DURATION = 1;
export const transition: Transition = { duration: DURATION, ease: EASE };

/** 1 = going forward (new slide comes from the right), -1 = going back. */
export type Direction = 1 | -1;

/*
 * The wipe: the outer layer slides in and clips, the inner layer slides the
 * opposite way by the same amount. Net effect: the slide content stays put
 * while the reveal edge travels across it. Transforms only, so it stays on
 * the GPU (no clip-path repaints).
 */
export const mask: Variants = {
  enter: (d: Direction) => ({ x: d > 0 ? "100%" : "-100%" }),
  center: { x: "0%" },
  exit: { x: "0%" },
};

export const counterMask: Variants = {
  enter: (d: Direction) => ({ x: d > 0 ? "-100%" : "100%" }),
  center: { x: "0%" },
  exit: { x: "0%" },
};

/*
 * The can is the parallax layer. It starts with the wipe and shares its
 * curve, but its exit is sized so it leaves the frame a beat before the
 * colour finishes: the two read as one connected move.
 *
 * The incoming can rises in from the bottom-right; both cans are slightly
 * smaller while in flight (depth), full size only when at rest.
 *
 * Percentages are of the can's own box. The exit distance is computed from
 * the measured layout so the timing holds on any screen size.
 */
export type CanGeometry = {
  /** Can centre, px from the stage's left edge. */
  center: number;
  /** Can width, px. */
  width: number;
  /** Stage width, px. */
  stage: number;
};

/** How far past the edge the can ends up, as a fraction of stage width. */
export const EXIT_MARGIN = 0.03;
const EXIT_TILT = 26;
/** Can size while entering or leaving. */
export const FLIGHT_SCALE = 0.85;

export function canVariants(getGeometry: () => CanGeometry | null): Variants {
  return {
    enter: (d: Direction) => ({ x: `${d * 260}%`, y: "45%", rotate: d * 14, scale: FLIGHT_SCALE }),
    center: { x: "0%", y: "0%", rotate: 0, scale: 1 },
    exit: (d: Direction) => {
      const g = getGeometry();
      // Tilted 26deg, the can reaches about one can-width either side of its centre.
      const distance = g
        ? ((d > 0 ? g.center : g.stage - g.center) + g.width + EXIT_MARGIN * g.stage) / g.width
        : 5;
      return { x: `${-d * distance * 100}%`, y: "80%", rotate: -d * EXIT_TILT, scale: FLIGHT_SCALE };
    },
  };
}

// prefers-reduced-motion: a plain crossfade, nothing flies.
export const fade: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 1 },
};
export const still: Variants = { enter: {}, center: {}, exit: {} };
export const reducedTransition: Transition = { duration: 0.35, ease: "easeOut" };
