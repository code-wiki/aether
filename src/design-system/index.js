// Aether Design System - Barrel Export
// Single entry point for all design system utilities

/**
 * The Aether Design System provides a comprehensive set of design tokens,
 * components, and utilities for building consistent, beautiful interfaces.
 *
 * Inspired by Linear.app's refined design language.
 *
 * Usage:
 * import { tokens, typography, elevation, colors } from '../design-system';
 */

// Design tokens (spacing, sizing, timing, etc.)
export { default as tokens } from './tokens';
export * from './tokens';

// Typography system (semantic text styles)
export { default as typography } from './typography';
export * from './typography';

// Elevation system (shadows, glows, focus states)
export { default as elevation } from './elevation';
export * from './elevation';

// Color system (palettes, semantic colors)
export { default as colors } from './colors';
export * from './colors';

// Motion system (Framer Motion presets)
export * from './motion';

// Spacing system
export { default as spacing } from './spacing';

// Primitive components
export { default as Button } from './primitives/Button';
export { default as Input } from './primitives/Input';
export { default as Card } from './primitives/Card';
export { default as Badge } from './primitives/Badge';
export { default as Kbd } from './primitives/Kbd';

// Design system metadata
export const designSystem = {
  name: 'Aether Design System',
  version: '1.0.0',
  inspiration: 'Linear.app',
  principles: [
    'Clarity over complexity',
    'Subtle motion enhances usability',
    'Consistent spacing creates rhythm',
    'Typography establishes hierarchy',
    'Elevation indicates interactivity',
  ],
};
