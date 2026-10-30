import type { TargetAndTransition, Variants } from "motion/react";
import type { Nav } from "../features/wheel";

const EASE_OUT = [0.2, 0, 0, 1] as const;

// Pages slide sideways, entering a category zooms in, going back zooms out. Tweens only: CEF 103 replaces springs
// on compositor values with a fixed ease.
const IN: Record<Nav, TargetAndTransition> = {
  open: { opacity: 0, scale: 0.94 },
  enter: { opacity: 0, scale: 0.9 },
  back: { opacity: 0, scale: 1.08 },
  next: { opacity: 0, x: "5vh" },
  prev: { opacity: 0, x: "-5vh" },
  refresh: { opacity: 0 },
};

const OUT: Record<Nav, TargetAndTransition> = {
  open: { opacity: 0 },
  enter: { opacity: 0, scale: 1.08 },
  back: { opacity: 0, scale: 0.9 },
  next: { opacity: 0, x: "-5vh" },
  prev: { opacity: 0, x: "5vh" },
  refresh: { opacity: 0 },
};

export const levelVariants: Variants = {
  initial: (nav: Nav) => IN[nav],
  animate: {
    opacity: 1,
    scale: 1,
    x: "0vh",
    transition: { duration: 0.26, ease: EASE_OUT },
  },
  exit: (nav: Nav) => ({
    ...OUT[nav],
    transition: { duration: 0.16, ease: "easeIn" },
  }),
};
