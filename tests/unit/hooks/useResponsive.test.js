import { renderHook } from '@testing-library/react';
import { useResponsive } from '../../../src/hooks/useResponsive';

// Mock useMediaQuery
jest.mock('../../../src/hooks/useMediaQuery', () => ({
  useMediaQuery: jest.fn(),
}));

import { useMediaQuery } from '../../../src/hooks/useMediaQuery';

describe('useResponsive Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns correct values for mobile viewport', () => {
    // Mock all media queries to return false (< 640px = mobile)
    useMediaQuery.mockReturnValue(false);

    const { result } = renderHook(() => useResponsive());

    expect(result.current.isMobile).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.isLargeDesktop).toBe(false);
    expect(result.current.isTouch).toBe(true);
    expect(result.current.showSidebar).toBe(false);
  });

  it('returns correct values for tablet viewport', () => {
    // Mock: >= 640px AND < 1024px = tablet
    useMediaQuery
      .mockReturnValueOnce(false) // isMobile (!>= 640px)
      .mockReturnValueOnce(true) // isTablet (640-1023)
      .mockReturnValueOnce(false) // isDesktop (>= 1024)
      .mockReturnValueOnce(false) // isLargeDesktop (>= 1536)
      .mockReturnValueOnce(true) // isSm (>= 640)
      .mockReturnValueOnce(true) // isMd (>= 768)
      .mockReturnValueOnce(false) // isLg (>= 1024)
      .mockReturnValueOnce(false) // isXl (>= 1280)
      .mockReturnValueOnce(false); // is2Xl (>= 1536)

    const { result } = renderHook(() => useResponsive());

    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(true);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.isTouch).toBe(true);
    expect(result.current.showSidebar).toBe(false);
  });

  it('returns correct values for desktop viewport', () => {
    // Mock: >= 1024px = desktop
    useMediaQuery
      .mockReturnValueOnce(false) // isMobile
      .mockReturnValueOnce(false) // isTablet
      .mockReturnValueOnce(true) // isDesktop (>= 1024)
      .mockReturnValueOnce(false) // isLargeDesktop
      .mockReturnValueOnce(true) // isSm
      .mockReturnValueOnce(true) // isMd
      .mockReturnValueOnce(true) // isLg (>= 1024)
      .mockReturnValueOnce(true) // isXl
      .mockReturnValueOnce(false); // is2Xl

    const { result } = renderHook(() => useResponsive());

    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(true);
    expect(result.current.isTouch).toBe(false);
    expect(result.current.showSidebar).toBe(true);
  });

  it('returns correct values for large desktop viewport', () => {
    // Mock: >= 1536px = large desktop
    useMediaQuery
      .mockReturnValueOnce(false) // isMobile
      .mockReturnValueOnce(false) // isTablet
      .mockReturnValueOnce(true) // isDesktop
      .mockReturnValueOnce(true) // isLargeDesktop (>= 1536)
      .mockReturnValueOnce(true) // isSm
      .mockReturnValueOnce(true) // isMd
      .mockReturnValueOnce(true) // isLg
      .mockReturnValueOnce(true) // isXl
      .mockReturnValueOnce(true); // is2Xl (>= 1536)

    const { result } = renderHook(() => useResponsive());

    expect(result.current.isLargeDesktop).toBe(true);
    expect(result.current.is2Xl).toBe(true);
    expect(result.current.showSidebar).toBe(true);
  });

  it('has correct breakpoint values', () => {
    useMediaQuery
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true) // isSm
      .mockReturnValueOnce(true) // isMd
      .mockReturnValueOnce(true) // isLg
      .mockReturnValueOnce(false) // isXl
      .mockReturnValueOnce(false); // is2Xl

    const { result } = renderHook(() => useResponsive());

    expect(result.current.isSm).toBe(true);
    expect(result.current.isMd).toBe(true);
    expect(result.current.isLg).toBe(true);
    expect(result.current.isXl).toBe(false);
    expect(result.current.is2Xl).toBe(false);
  });

  it('correctly determines isTouch based on mobile or tablet', () => {
    // Test mobile
    useMediaQuery.mockReturnValue(false);
    const { result: mobileResult } = renderHook(() => useResponsive());
    expect(mobileResult.current.isTouch).toBe(true);

    // Test tablet
    jest.clearAllMocks();
    useMediaQuery
      .mockReturnValueOnce(false) // isMobile
      .mockReturnValueOnce(true) // isTablet
      .mockReturnValue(false);

    const { result: tabletResult } = renderHook(() => useResponsive());
    expect(tabletResult.current.isTouch).toBe(true);

    // Test desktop
    jest.clearAllMocks();
    useMediaQuery
      .mockReturnValueOnce(false) // isMobile
      .mockReturnValueOnce(false) // isTablet
      .mockReturnValueOnce(true) // isDesktop
      .mockReturnValue(false);

    const { result: desktopResult } = renderHook(() => useResponsive());
    expect(desktopResult.current.isTouch).toBe(false);
  });
});
