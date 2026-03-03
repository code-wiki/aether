// Aether Design System - Motion & Animation
// Linear.app inspired spring physics and animation presets for Framer Motion

// Spring configuration presets - Linear.app style
export const spring = {
  // Default spring - balanced, natural motion
  default: {
    type: 'spring',
    stiffness: 300,
    damping: 30,
  },

  // Linear - Linear.app's signature snappy feel
  linear: {
    type: 'spring',
    stiffness: 400,
    damping: 30,
    mass: 0.8,
  },

  // Snappy - quick, responsive (for buttons, toggles)
  snappy: {
    type: 'spring',
    stiffness: 400,
    damping: 35,
  },

  // Smooth - gentle, flowing (for large elements, modals)
  smooth: {
    type: 'spring',
    stiffness: 200,
    damping: 25,
  },

  // Bouncy - playful (for notifications, success states)
  bouncy: {
    type: 'spring',
    stiffness: 300,
    damping: 20,
  },

  // Gentle - subtle, refined (for micro-interactions)
  gentle: {
    type: 'spring',
    stiffness: 250,
    damping: 28,
  },
};

// Duration presets (for non-spring animations)
export const duration = {
  instant: 0.1,
  fast: 0.2,
  normal: 0.3,
  slow: 0.4,
  slower: 0.6,
};

// Easing curves (when not using spring)
export const easing = {
  easeIn: [0.4, 0, 1, 1],
  easeOut: [0, 0, 0.2, 1],
  easeInOut: [0.4, 0, 0.2, 1],
};

// Common animation variants
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: spring.default,
};

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: spring.smooth,
};

export const fadeInDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: spring.smooth,
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
  transition: spring.snappy,
};

export const slideInRight = {
  initial: { x: '100%', opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: '100%', opacity: 0 },
  transition: spring.smooth,
};

export const slideInLeft = {
  initial: { x: '-100%', opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: '-100%', opacity: 0 },
  transition: spring.smooth,
};

export const expandVertical = {
  initial: { height: 0, opacity: 0 },
  animate: { height: 'auto', opacity: 1 },
  exit: { height: 0, opacity: 0 },
  transition: spring.smooth,
};

// Hover animations - Linear.app inspired micro-interactions
export const hoverScale = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: spring.snappy,
};

export const hoverLift = {
  whileHover: { y: -2 },
  whileTap: { y: 0 },
  transition: spring.snappy,
};

// Linear-style hover: subtle lift + scale
export const hoverLiftScale = {
  whileHover: { y: -2, scale: 1.01 },
  whileTap: { y: 0, scale: 0.99 },
  transition: spring.linear,
};

// Glow effect on hover (for cards, buttons)
export const hoverGlow = {
  whileHover: {
    boxShadow: '0 8px 30px rgba(0, 184, 230, 0.12)',
    transition: spring.gentle,
  },
};

// Button press - satisfying tactile feedback
export const buttonPress = {
  whileTap: { scale: 0.96 },
  transition: spring.snappy,
};

// Icon spin (for loading states)
export const iconSpin = {
  animate: {
    rotate: 360,
  },
  transition: {
    duration: 1,
    repeat: Infinity,
    ease: 'linear',
  },
};

// Pulse animation (for notifications, badges)
export const pulse = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
  },
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

// Page transitions
export const pageTransition = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: spring.smooth,
};

// Stagger children animation
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: spring.default,
};

// Delayed stagger with custom delay - for sequential reveals
export const staggerDelayed = (delay = 0.1) => ({
  animate: {
    transition: {
      staggerChildren: delay,
      delayChildren: 0.05,
    },
  },
});

// Elastic bounce - playful premium feel
export const elasticBounce = {
  type: 'spring',
  stiffness: 300,
  damping: 15,
  mass: 0.8,
};

// Focus ring animation - accessibility + premium
export const focusRing = {
  whileFocus: {
    boxShadow: [
      '0 0 0 0px rgba(0, 184, 230, 0)',
      '0 0 0 4px rgba(0, 184, 230, 0.2)',
    ],
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
};

// Glow on hover - accent colored
export const hoverGlowAccent = {
  whileHover: {
    boxShadow: '0 0 30px rgba(0, 184, 230, 0.25)',
    transition: spring.gentle,
  },
};

// Glow on hover - purple variant
export const hoverGlowPurple = {
  whileHover: {
    boxShadow: '0 0 30px rgba(139, 92, 246, 0.25)',
    transition: spring.gentle,
  },
};

// Enhanced stagger with custom index delay
export const staggerItemDelayed = (index = 0) => ({
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      ...spring.default,
      delay: index * 0.05,
    },
  },
});

// Scale and fade - for cards and panels
export const scaleInFade = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: spring.snappy,
};

export default {
  spring,
  duration,
  easing,
  fadeIn,
  fadeInUp,
  fadeInDown,
  scaleIn,
  slideInRight,
  slideInLeft,
  expandVertical,
  hoverScale,
  hoverLift,
  hoverLiftScale,
  hoverGlow,
  hoverGlowAccent,
  hoverGlowPurple,
  buttonPress,
  iconSpin,
  pulse,
  pageTransition,
  staggerContainer,
  staggerItem,
  staggerDelayed,
  staggerItemDelayed,
  elasticBounce,
  focusRing,
  scaleInFade,
};
