export const easeOut = [0.22, 1, 0.36, 1]

export const viewportOnce = { once: true, margin: '-12% 0px -8% 0px' }

export const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeOut },
  },
}

export const fadeIn = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.4, ease: easeOut },
  },
}

export const stagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07, delayChildren: 0.06 },
  },
}

export const staggerFast = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.05, delayChildren: 0.04 },
  },
}

export const shopPageTransition = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.34, ease: easeOut },
}

export const adminPageTransition = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.2, ease: easeOut },
}

export const overlayFade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
}

export const sheetEnter = {
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 16 },
  transition: { duration: 0.28, ease: easeOut },
}

/** Dialog giữa màn hình (mobile + desktop) */
export const modalEnter = {
  initial: { opacity: 0, scale: 0.94, y: 8 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.96, y: 4 },
  transition: { duration: 0.22, ease: easeOut },
}

export const drawerEnter = {
  initial: { x: '100%' },
  animate: { x: 0 },
  exit: { x: '100%' },
  transition: { duration: 0.28, ease: easeOut },
}

/** Chuyển màn mobile (list → edit) */
export const pageSlideIn = {
  initial: { x: '18%', opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: '12%', opacity: 0 },
  transition: { duration: 0.28, ease: easeOut },
}

export const pageSlideOut = {
  initial: { x: '-8%', opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: '-6%', opacity: 0 },
  transition: { duration: 0.24, ease: easeOut },
}

export const popoverEnter = {
  initial: { opacity: 0, y: -8, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -6, scale: 0.98 },
  transition: { duration: 0.18, ease: easeOut },
}
