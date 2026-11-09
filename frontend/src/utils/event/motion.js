// Shared framer-motion settings for the events pages. Kept subtle on purpose:
// short fades with about 8px of movement.

export const EASE = [0.22, 1, 0.36, 1];
export const DURATION = 0.25;

const hidden = { opacity: 0, y: 8 };
const shown = { opacity: 1, y: 0 };

/** Spread onto a motion element to fade it up when it mounts. */
export const fadeUpProps = {
  initial: hidden,
  animate: shown,
  transition: { duration: DURATION, ease: EASE },
};

/** Spread onto a motion element to fade it up when it scrolls into view. */
export const revealProps = {
  initial: hidden,
  whileInView: shown,
  viewport: { once: true, amount: 0.2 },
  transition: { duration: DURATION, ease: EASE },
};

/** Parent of a list. Its children use staggerItem. */
export const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

/** Child of a staggerContainer. */
export const staggerItem = {
  hidden,
  show: { ...shown, transition: { duration: DURATION, ease: EASE } },
};