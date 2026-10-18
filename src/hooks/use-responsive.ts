import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import {
  Breakpoint,
  CONTENT_MAX_WIDTH,
  GUTTER,
  SCALE,
  getBreakpoint,
} from '../constants/responsive';

export interface ResponsiveInfo {
  width: number;
  height: number;
  breakpoint: Breakpoint;
  /** < 360dp wide */
  isCompact: boolean;
  /** >= 600dp wide */
  isTablet: boolean;
  /** >= 900dp wide */
  isDesktop: boolean;
  isLandscape: boolean;
  /** < 640dp tall (landscape phones, split-screen) */
  isShort: boolean;
  gutter: number;
  contentMaxWidth: number | undefined;
  /** Width actually available to the content column. */
  contentWidth: number;
  /** Width available inside the content column after gutters. */
  innerWidth: number;
  /** Suggested column count for card grids. */
  columns: number;
  /** Scale a font size / dimension for the current breakpoint. */
  fs: (size: number) => number;
}

/**
 * Reactive responsive info. Built on `useWindowDimensions`, so it updates on
 * rotation, split-screen, foldable posture changes and web window resize.
 */
export function useResponsive(): ResponsiveInfo {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    const breakpoint = getBreakpoint(width);
    const scale = SCALE[breakpoint];
    const gutter = GUTTER[breakpoint];
    const contentMaxWidth = CONTENT_MAX_WIDTH[breakpoint];
    const contentWidth = Math.min(width, contentMaxWidth ?? width);
    return {
      width,
      height,
      breakpoint,
      isCompact: breakpoint === 'xs',
      isTablet: width >= 600,
      isDesktop: width >= 900,
      isLandscape: width > height,
      isShort: height < 640,
      gutter,
      contentMaxWidth,
      contentWidth,
      innerWidth: Math.max(contentWidth - gutter * 2, 0),
      columns: width >= 900 ? 3 : width >= 600 ? 2 : 1,
      fs: (size: number) => Math.round(size * scale * 10) / 10,
    };
  }, [width, height]);
}
