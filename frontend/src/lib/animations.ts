import { motion, Variants } from 'framer-motion';

// Smooth easing curves as tuples for Framer Motion
type EasingTuple = [number, number, number, number];

export const easing = {
  smooth: [0.22, 1, 0.36, 1] as EasingTuple,
  spring: [0.34, 1.56, 0.64, 1] as EasingTuple,
  gentle: [0.4, 0, 0.2, 1] as EasingTuple,
};

// Duration presets
export const duration = {
  fast: 0.3,
  normal: 0.5,
  slow: 0.8,
  slower: 1.2,
};

// Fade up reveal animation
export const fadeUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: duration.slow,
      ease: easing.smooth,
    },
  },
};

// Stagger container for children
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

// Stagger children items
export const staggerItem: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: duration.normal,
      ease: easing.smooth,
    },
  },
};

// Scale in animation
export const scaleInVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: duration.normal,
      ease: easing.smooth,
    },
  },
};

// Line grow animation
export const lineGrowVariants: Variants = {
  hidden: {
    scaleX: 0,
    originX: 0,
  },
  visible: {
    scaleX: 1,
    transition: {
      duration: duration.slow,
      ease: easing.smooth,
    },
  },
};

// Hero text reveal with stagger
export const heroTextVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 60,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: duration.slower,
      ease: easing.smooth,
    },
  },
};

// Card hover animation
export const cardHoverVariants: Variants = {
  initial: {
    y: 0,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 2px 4px -2px rgba(0, 0, 0, 0.02)',
  },
  hover: {
    y: -8,
    boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(232, 97, 74, 0.1)',
    transition: {
      duration: duration.normal,
      ease: easing.smooth,
    },
  },
};

// Navbar scroll animation
export const navbarVariants: Variants = {
  top: {
    backgroundColor: 'rgba(250, 249, 248, 0)',
    backdropFilter: 'blur(0px)',
    borderBottomColor: 'rgba(217, 218, 224, 0)',
  },
  scrolled: {
    backgroundColor: 'rgba(250, 249, 248, 0.9)',
    backdropFilter: 'blur(20px)',
    borderBottomColor: 'rgba(217, 218, 224, 0.5)',
    transition: {
      duration: duration.fast,
      ease: easing.gentle,
    },
  },
};

// Float animation for decorative elements
export const floatVariants: Variants = {
  animate: {
    y: [0, -12, 0],
    transition: {
      duration: 6,
      ease: 'easeInOut',
      repeat: Infinity,
    },
  },
};

// Pulse glow animation
export const pulseGlowVariants: Variants = {
  animate: {
    boxShadow: [
      '0 0 20px rgba(232, 97, 74, 0.15)',
      '0 0 40px rgba(232, 97, 74, 0.25)',
      '0 0 20px rgba(232, 97, 74, 0.15)',
    ],
    transition: {
      duration: 3,
      ease: 'easeInOut',
      repeat: Infinity,
    },
  },
};

// Slide in from left
export const slideInLeftVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -60,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: duration.slow,
      ease: easing.smooth,
    },
  },
};

// Slide in from right
export const slideInRightVariants: Variants = {
  hidden: {
    opacity: 0,
    x: 60,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: duration.slow,
      ease: easing.smooth,
    },
  },
};

// Page transition
export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: duration.normal,
      ease: easing.smooth,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: duration.fast,
      ease: easing.gentle,
    },
  },
};

// Section reveal variants for large content blocks
export const sectionRevealVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 56,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.9,
      ease: easing.smooth,
    },
  },
};

// Staggered cards container and item variants
export const staggerCardsVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.1,
    },
  },
};

export const cardRevealVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 34,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: easing.smooth,
    },
  },
};

// Viewport settings for scroll animations
export const viewportSettings = {
  once: true,
  margin: '-100px',
  amount: 0.3,
};
