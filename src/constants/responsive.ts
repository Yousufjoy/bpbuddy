/**
 * Responsive design tokens.
 *
 * Breakpoints (dp / CSS px of the *window*, so they react to rotation,
 * split-screen, foldables and desktop browser resizing):
 *   xs  <  360  small / compact phones (older iPhone SE, small Androids)
 *   sm  360–599 regular phones (Pixel, Galaxy, Redmi, OnePlus, Nothing, iPhone)
 *   md  600–899 large phones landscape, foldables, small tablets
 *   lg  900–1199 tablets landscape, small desktop windows
 *   xl  >= 1200 desktop
 */
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export const BREAKPOINTS = {
  sm: 360,
  md: 600,
  lg: 900,
  xl: 1200,
} as const;

export function getBreakpoint(width: number): Breakpoint {
  if (width >= BREAKPOINTS.xl) return 'xl';
  if (width >= BREAKPOINTS.lg) return 'lg';
  if (width >= BREAKPOINTS.md) return 'md';
  if (width >= BREAKPOINTS.sm) return 'sm';
  return 'xs';
}

/**
 * Max width of the main content column (includes horizontal padding).
 * Phones use the full width; larger screens get a centred, readable column.
 */
export const CONTENT_MAX_WIDTH: Record<Breakpoint, number | undefined> = {
  xs: undefined,
  sm: undefined,
  md: 640,
  lg: 720,
  xl: 760,
};

/** Multiplier applied to font sizes / spacing so phone-sm remains the baseline design. */
export const SCALE: Record<Breakpoint, number> = {
  xs: 0.94,
  sm: 1,
  md: 1.06,
  lg: 1.1,
  xl: 1.12,
};

/** Horizontal gutter (screen edge padding) per breakpoint. */
export const GUTTER: Record<Breakpoint, number> = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 32,
};
