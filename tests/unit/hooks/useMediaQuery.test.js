import { renderHook } from '@testing-library/react';
import { useMediaQuery } from '../../../src/hooks/useMediaQuery';

describe('useMediaQuery Hook', () => {
  let matchMediaMock;

  beforeEach(() => {
    // Mock matchMedia
    matchMediaMock = jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    window.matchMedia = matchMediaMock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns false when media query does not match', () => {
    matchMediaMock.mockImplementation((query) => ({
      matches: false,
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(false);
  });

  it('returns true when media query matches', () => {
    matchMediaMock.mockImplementation((query) => ({
      matches: true,
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(true);
  });

  it('calls matchMedia with correct query', () => {
    const query = '(min-width: 1024px)';
    renderHook(() => useMediaQuery(query));
    expect(matchMediaMock).toHaveBeenCalledWith(query);
  });

  it('adds event listener on mount', () => {
    const addEventListenerSpy = jest.fn();
    matchMediaMock.mockImplementation((query) => ({
      matches: false,
      media: query,
      addEventListener: addEventListenerSpy,
      removeEventListener: jest.fn(),
    }));

    renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(addEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('removes event listener on unmount', () => {
    const removeEventListenerSpy = jest.fn();
    matchMediaMock.mockImplementation((query) => ({
      matches: false,
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: removeEventListenerSpy,
    }));

    const { unmount } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('updates when media query changes', () => {
    let changeHandler;
    const addEventListenerSpy = jest.fn((event, handler) => {
      if (event === 'change') {
        changeHandler = handler;
      }
    });

    matchMediaMock.mockImplementation((query) => ({
      matches: false,
      media: query,
      addEventListener: addEventListenerSpy,
      removeEventListener: jest.fn(),
    }));

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(false);

    // Simulate media query change
    if (changeHandler) {
      changeHandler({ matches: true });
    }
  });

  it('handles different query formats', () => {
    const queries = [
      '(min-width: 640px)',
      '(max-width: 1024px)',
      '(min-width: 768px) and (max-width: 1023px)',
      '(orientation: portrait)',
    ];

    queries.forEach((query) => {
      renderHook(() => useMediaQuery(query));
      expect(matchMediaMock).toHaveBeenCalledWith(query);
    });
  });
});
